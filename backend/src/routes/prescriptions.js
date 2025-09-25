import express from 'express';
import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import Twilio from 'twilio';
import { verifyToken } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

const twilioClient = process.env.TWILIO_ACCOUNT_SID ? Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

router.post('/', verifyToken, async (req, res) => {
  const { 
    petId, 
    tutorId, 
    title, 
    content, 
    medication, 
    dosage, 
    frequency, 
    duration, 
    instructions 
  } = req.body;
  const sendWhatsApp = req.body.sendWhatsApp || false;
  
  console.log('Creating prescription - Request body:', {
    petId, tutorId, title, medication, dosage, frequency, duration
  });
  
  try {
    // Validate required fields
    if (!petId || !tutorId || !title || !medication || !dosage || !frequency || !duration) {
      const missingFields = [];
      if (!petId) missingFields.push('petId');
      if (!tutorId) missingFields.push('tutorId');
      if (!title) missingFields.push('title');
      if (!medication) missingFields.push('medication');
      if (!dosage) missingFields.push('dosage');
      if (!frequency) missingFields.push('frequency');
      if (!duration) missingFields.push('duration');
      
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: 'Campos requeridos faltantes', 
        missingFields 
      });
    }

    const pet = await prisma.pet.findUnique({ 
      where: { id: Number(petId) }, 
      include: { tutor: true } 
    });
    if (!pet) {
      console.log('Pet not found for ID:', petId);
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    // Obtener datos del profesional
    console.log('Fetching professional data for user ID:', req.user.id);
    const professional = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        fullName: true,
        email: true,
        professionalRut: true,
        professionalTitle: true,
        clinicAddress: true,
        professionalPhone: true,
        licenseNumber: true,
        signatureUrl: true,
        logoUrl: true
      }
    });

    console.log('Professional data found:', professional?.fullName || 'None');

    // Generate PDF
    console.log('Starting PDF generation...');
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `receta_${pet.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    
    // Use /tmp for Vercel (exists by default), or local tmp for development  
    const tmpDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'tmp');
    const outPath = path.join(tmpDir, fileName);
    
    console.log('PDF output path:', outPath);
    console.log('Running on Vercel:', !!process.env.VERCEL);
    
    try {
      // Only create directory in local development (not on Vercel)
      if (!process.env.VERCEL) {
        await fs.promises.mkdir(tmpDir, { recursive: true });
        console.log('Created local tmp directory successfully');
      } else {
        console.log('Using Vercel /tmp directory');
      }
    } catch (dirError) {
      console.error('Error with tmp directory:', dirError);
      throw new Error('No se pudo acceder al directorio temporal para el PDF');
    }
    
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    console.log('PDF stream created, generating content...');

    // PDF Header - Professional letterhead
    doc.fontSize(16).text(professional?.fullName || 'Veterinario', { align: 'center' });
    if (professional?.professionalTitle) {
      doc.fontSize(12).text(professional.professionalTitle, { align: 'center' });
    }
    if (professional?.professionalRut) {
      doc.fontSize(10).text(`RUT: ${professional.professionalRut}`, { align: 'center' });
    }
    if (professional?.licenseNumber) {
      doc.text(`Registro Profesional: ${professional.licenseNumber}`, { align: 'center' });
    }
    if (professional?.clinicAddress) {
      doc.text(professional.clinicAddress, { align: 'center' });
    }
    if (professional?.professionalPhone) {
      doc.text(`Tel: ${professional.professionalPhone}`, { align: 'center' });
    }
    if (professional?.email) {
      doc.text(`Email: ${professional.email}`, { align: 'center' });
    }
    
    doc.moveDown();
    doc.fontSize(1).text('_'.repeat(100), { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text('RECETA VETERINARIA', { align: 'center', underline: true });
    doc.moveDown(2);

    // Patient Info Section
    doc.fontSize(14).text('DATOS DEL PACIENTE', { underline: true });
    doc.moveDown(0.5);
    
    const leftColumn = 50;
    const rightColumn = 300;
    let currentY = doc.y;
    
    doc.fontSize(11);
    doc.text(`Nombre: ${pet.name}`, leftColumn, currentY);
    doc.text(`Especie: ${pet.type}`, rightColumn, currentY);
    
    currentY += 15;
    if (pet.breed) {
      doc.text(`Raza: ${pet.breed}`, leftColumn, currentY);
    }
    if (pet.age) {
      doc.text(`Edad: ${pet.age} años`, rightColumn, currentY);
    }
    
    currentY += 15;
    if (pet.weight) {
      doc.text(`Peso: ${pet.weight} kg`, leftColumn, currentY);
    }
    
    doc.y = currentY + 20;

    // Owner Info Section
    doc.fontSize(14).text('DATOS DEL PROPIETARIO', { underline: true });
    doc.moveDown(0.5);
    
    currentY = doc.y;
    doc.fontSize(11);
    doc.text(`Nombre: ${pet.tutor.name}`, leftColumn, currentY);
    if (pet.tutor.rut) {
      doc.text(`RUT: ${pet.tutor.rut}`, rightColumn, currentY);
    }
    
    currentY += 15;
    if (pet.tutor.phone) {
      doc.text(`Teléfono: ${pet.tutor.phone}`, leftColumn, currentY);
    }
    if (pet.tutor.email) {
      doc.text(`Email: ${pet.tutor.email}`, rightColumn, currentY);
    }
    
    doc.y = currentY + 30;

    // Prescription Content - Rx Section
    doc.fontSize(16).text('℞', 50, doc.y, { width: 30 });
    doc.fontSize(14).text('PRESCRIPCIÓN MÉDICA', 80, doc.y - 15, { underline: true });
    doc.moveDown(1.5);
    
    if (medication) {
      doc.fontSize(12);
      doc.text(`Medicamento: `, { continued: true });
      doc.text(medication);
      doc.moveDown(0.3);
      
      if (dosage) {
        doc.text(`Dosis: `, { continued: true });
        doc.text(dosage);
        doc.moveDown(0.3);
      }
      
      if (frequency) {
        doc.text(`Frecuencia: `, { continued: true });
        doc.text(frequency);
        doc.moveDown(0.3);
      }
      
      if (duration) {
        doc.text(`Duración del tratamiento: `, { continued: true });
        doc.text(duration);
        doc.moveDown(0.5);
      }
    }
    
    if (instructions) {
      doc.fontSize(11);
      doc.text('INSTRUCCIONES ESPECIALES:');
      doc.text(instructions, { width: 500 });
      doc.moveDown(0.5);
    }
    
    if (content) {
      doc.fontSize(11);
      doc.text('OBSERVACIONES:');
      doc.text(content, { width: 500 });
      doc.moveDown();
    }

    // Footer with signature
    doc.moveDown(2);
    const footerY = doc.page.height - 150;
    doc.y = Math.max(doc.y, footerY);
    
    doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 50);
    doc.moveDown();
    
    doc.text('_'.repeat(40), 350);
    doc.text(`${professional?.fullName || 'Veterinario'}`, 350, doc.y + 5);
    if (professional?.professionalTitle) {
      doc.text(professional.professionalTitle, 350);
    }
    if (professional?.licenseNumber) {
      doc.text(`Reg. Prof.: ${professional.licenseNumber}`, 350);
    }

    doc.end();

    try {
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
        setTimeout(() => reject(new Error('PDF generation timeout')), 30000); // 30s timeout
      });
      console.log('PDF generation completed successfully');
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      throw new Error('Error al generar el PDF: ' + pdfError.message);
    }

    // Save prescription record
    console.log('Saving prescription to database...');
    const pdfUrl = process.env.VERCEL ? `/prescriptions/pdf/${fileName}` : `/tmp/${fileName}`;
    
    const prescription = await prisma.prescription.create({
      data: {
        petId: Number(petId),
        tutorId: Number(tutorId),
        userId: req.user.id,
        title: title || 'Receta Veterinaria',
        content: content || '',
        medication: medication || '',
        dosage: dosage || '',
        frequency: frequency || '',
        duration: duration || '',
        instructions: instructions || null,
        pdfUrl,
        pdfPath: outPath,
        sendWhatsApp,
        whatsappSent: false
      },
    });

    console.log('Prescription saved successfully with ID:', prescription.id);

    // Send via WhatsApp if requested
    let whatsappSent = false;
    if (sendWhatsApp && twilioClient && pet.tutor.phone) {
      try {
        const to = `whatsapp:${pet.tutor.phone}`;
        const from = process.env.TWILIO_WHATSAPP_FROM;
        await twilioClient.messages.create({
          from,
          to,
          body: `🏥 Nueva receta veterinaria para ${pet.name}\n\nHola ${pet.tutor.name}, tienes una nueva receta médica para ${pet.name}. Por favor revisa los detalles en el PDF adjunto.`,
        });
        whatsappSent = true;
        
        // Update prescription record
        await prisma.prescription.update({
          where: { id: prescription.id },
          data: { whatsappSent: true }
        });
      } catch (whatsappError) {
        console.error('Error sending WhatsApp:', whatsappError);
      }
    }

    // Return response
    const base = process.env.BACKEND_BASE_URL;
    const fullPdfUrl = base ? `${base}${prescription.pdfUrl}` : prescription.pdfUrl;
    
    console.log('Prescription created successfully, returning response');
    res.json({ 
      prescription: { ...prescription, whatsappSent }, 
      file: fullPdfUrl 
    });
  } catch (err) {
    console.error('Error creating prescription:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    
    // Return appropriate error message
    const errorMessage = err.message.includes('PDF') 
      ? 'Error al generar el PDF de la receta'
      : err.message.includes('Prisma') || err.message.includes('database')
      ? 'Error en la base de datos'
      : err.message || 'Error interno del servidor';
      
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Listar recetas por mascota
router.get('/pet/:petId', verifyToken, async (req, res) => {
  const { petId } = req.params;
  const items = await prisma.prescription.findMany({ where: { petId: Number(petId) } });
  res.json(items);
});

// Listar recetas por profesional (userId)
router.get('/user/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;
  const items = await prisma.prescription.findMany({ where: { userId: Number(userId) } });
  res.json(items);
});

// Servir archivos PDF
router.get('/pdf/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Use /tmp for Vercel compatibility, or local tmp for development
    const tmpDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'tmp');
    const filePath = path.join(tmpDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('PDF file not found:', filePath);
      return res.status(404).json({ error: 'Archivo PDF no encontrado' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error('Error streaming PDF:', error);
      res.status(500).json({ error: 'Error al leer el archivo PDF' });
    });
    
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({ error: 'Error al servir el archivo PDF' });
  }
});

export default router;
