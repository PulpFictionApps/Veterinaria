import express from 'express';
import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import Twilio from 'twilio';
import fetch from 'node-fetch';
import { verifyToken } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

const twilioClient = process.env.TWILIO_ACCOUNT_SID ? Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

// Helper function to download and cache image
const downloadImage = async (imageUrl, fileName) => {
  if (!imageUrl) return null;
  
  try {
    console.log('Downloading image from:', imageUrl);
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.log('Failed to download image:', response.status, response.statusText);
      return null;
    }
    
    const buffer = await response.buffer();
    const tmpDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'tmp');
    const imagePath = path.join(tmpDir, fileName);
    
    // Ensure tmp directory exists
    if (!process.env.VERCEL) {
      await fs.promises.mkdir(tmpDir, { recursive: true });
    }
    
    await fs.promises.writeFile(imagePath, buffer);
    console.log('Image saved to:', imagePath);
    return imagePath;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
};

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
        clinicName: true,
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
    console.log('Professional data received:', JSON.stringify(professional, null, 2));

    // Download logo and signature images if available
    let logoPath = null;
    let signaturePath = null;
    
    if (professional?.logoUrl) {
      logoPath = await downloadImage(professional.logoUrl, `logo_${req.user.id}_${Date.now()}.png`);
    }
    
    if (professional?.signatureUrl) {
      signaturePath = await downloadImage(professional.signatureUrl, `signature_${req.user.id}_${Date.now()}.png`);
    }

    // PDF Header - Professional letterhead with logo
    let currentY = 50;
    
    // Add logo if available (top-left)
    if (logoPath) {
      try {
        doc.image(logoPath, 50, currentY, { width: 100, height: 80 });
        console.log('Logo added successfully');
      } catch (logoError) {
        console.error('Error adding logo:', logoError);
      }
    }
    
    // Clinic info (centered or right if logo exists)
    const clinicName = professional?.clinicName || 'CLÍNICA VETERINARIA';
    const professionalName = professional?.fullName || 'Veterinario';
    const professionalTitle = professional?.professionalTitle || 'Médico Veterinario';
    
    console.log('Using clinic name:', clinicName);
    console.log('Using professional name:', professionalName);
    console.log('Using professional title:', professionalTitle);
    
    // Position text based on logo presence
    const headerX = logoPath ? 200 : 50;
    const headerAlign = logoPath ? 'left' : 'center';
    
    doc.fontSize(16).text(clinicName, headerX, currentY, { align: headerAlign, width: logoPath ? 350 : 500 });
    currentY += 20;
    doc.fontSize(12).text('Receta Médica Veterinaria', headerX, currentY, { align: headerAlign, width: logoPath ? 350 : 500 });
    currentY += 25;
    
    doc.fontSize(14).text(`Dr. ${professionalName}`, headerX, currentY, { align: headerAlign, width: logoPath ? 350 : 500 });
    currentY += 15;
    doc.fontSize(12).text(professionalTitle, headerX, currentY, { align: headerAlign, width: logoPath ? 350 : 500 });
    currentY += 12;
    
    if (professional?.professionalRut) {
      doc.fontSize(10).text(`RUT: ${professional.professionalRut}`, headerX, currentY, { align: headerAlign, width: logoPath ? 350 : 500 });
      currentY += 12;
    }
    if (professional?.licenseNumber) {
      doc.text(`Registro Profesional: ${professional.licenseNumber}`, headerX, currentY, { align: headerAlign, width: logoPath ? 350 : 500 });
      currentY += 12;
    }
    if (professional?.clinicAddress) {
      doc.text(professional.clinicAddress, headerX, currentY, { align: headerAlign, width: logoPath ? 350 : 500 });
      currentY += 12;
    }
    if (professional?.professionalPhone) {
      doc.text(`Tel: ${professional.professionalPhone}`, headerX, currentY, { align: headerAlign, width: logoPath ? 350 : 500 });
      currentY += 12;
    }
    if (professional?.email) {
      doc.text(`Email: ${professional.email}`, headerX, currentY, { align: headerAlign, width: logoPath ? 350 : 500 });
      currentY += 12;
    }
    
    currentY += 15;
    doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 50, currentY, { align: 'center', width: 500 });
    currentY += 15;
    doc.fontSize(1).text('_'.repeat(100), 50, currentY, { align: 'center', width: 500 });
    currentY += 20;

    // Set doc.y to our tracked position
    doc.y = currentY;

    // Patient Info Section
    doc.fontSize(14).text('DATOS DEL PACIENTE', { underline: true });
    doc.moveDown(0.5);
    
    const leftColumn = 50;
    const rightColumn = 300;
    let patientY = doc.y;
    
    doc.fontSize(11);
    doc.text(`Nombre: ${pet.name}`, leftColumn, patientY);
    doc.text(`Especie: ${pet.type}`, rightColumn, patientY);
    
    patientY += 15;
    if (pet.breed) {
      doc.text(`Raza: ${pet.breed}`, leftColumn, patientY);
    }
    if (pet.age) {
      doc.text(`Edad: ${pet.age} años`, rightColumn, patientY);
    }
    
    patientY += 15;
    if (pet.weight) {
      doc.text(`Peso: ${pet.weight} kg`, leftColumn, patientY);
    }
    
    doc.y = patientY + 20;

    // Owner Info Section
    doc.fontSize(14).text('DATOS DEL PROPIETARIO', { underline: true });
    doc.moveDown(0.5);
    
    patientY = doc.y;
    doc.fontSize(11);
    doc.text(`Nombre: ${pet.tutor.name}`, leftColumn, patientY);
    if (pet.tutor.rut) {
      doc.text(`RUT: ${pet.tutor.rut}`, rightColumn, patientY);
    }
    
    patientY += 15;
    if (pet.tutor.phone) {
      doc.text(`Teléfono: ${pet.tutor.phone}`, leftColumn, patientY);
    }
    if (pet.tutor.email) {
      doc.text(`Email: ${pet.tutor.email}`, rightColumn, patientY);
    }
    
    doc.y = patientY + 30;

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
    const footerY = doc.page.height - 180;
    doc.y = Math.max(doc.y, footerY);
    
    // Add signature if available
    if (signaturePath) {
      try {
        doc.image(signaturePath, 300, doc.y, { width: 200, height: 60 });
        console.log('Signature added successfully');
        doc.y += 70; // Move Y position below signature
      } catch (sigError) {
        console.error('Error adding signature:', sigError);
        // Fallback to signature line
        doc.text('_'.repeat(40), 350);
        doc.moveDown(0.5);
      }
    } else {
      // Signature line if no signature image
      doc.text('_'.repeat(40), 350);
      doc.moveDown(0.5);
    }
    
    doc.text(`Dr. ${professional?.fullName || 'Veterinario'}`, 350);
    if (professional?.professionalTitle) {
      doc.text(professional.professionalTitle, 350);
    } else {
      doc.text('Médico Veterinario', 350);
    }
    if (professional?.licenseNumber) {
      doc.text(`Reg. Prof.: ${professional.licenseNumber}`, 350);
    }
    doc.text('Firma y Timbre', 350);
    
    doc.moveDown(2);
    
    // Validity note
    doc.fontSize(8).text('Esta receta médica es válida por 30 días desde su emisión', { 
      align: 'center',
      width: doc.page.width - 100
    });

    // Clean up downloaded images
    if (logoPath) {
      try {
        await fsPromises.unlink(logoPath);
        console.log('Logo temp file cleaned up');
      } catch (cleanupError) {
        console.error('Error cleaning up logo file:', cleanupError);
      }
    }
    
    if (signaturePath) {
      try {
        await fsPromises.unlink(signaturePath);
        console.log('Signature temp file cleaned up');
      } catch (cleanupError) {
        console.error('Error cleaning up signature file:', cleanupError);
      }
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
    const pdfUrl = `/tmp/${fileName}`;
    
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

// Descargar PDF de receta específica
router.get('/download/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la prescripción en la base de datos
    const prescription = await prisma.prescription.findUnique({
      where: { id: Number(id) },
      include: {
        pet: {
          include: { tutor: true }
        }
      }
    });
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescripción no encontrada' });
    }
    
    // Verificar que el usuario tenga acceso a esta prescripción
    if (prescription.userId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a esta prescripción' });
    }
    
    // Buscar el archivo PDF
    const tmpDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'tmp');
    let pdfPath = prescription.pdfPath;
    
    // Si no hay pdfPath o el archivo no existe, extraer el nombre del archivo de pdfUrl
    if (!pdfPath || !fs.existsSync(pdfPath)) {
      const fileName = prescription.pdfUrl?.split('/').pop();
      if (fileName) {
        pdfPath = path.join(tmpDir, fileName);
      }
    }
    
    // Verificar que el archivo existe
    if (!pdfPath || !fs.existsSync(pdfPath)) {
      console.log('PDF file not found:', pdfPath);
      return res.status(404).json({ error: 'Archivo PDF no encontrado. El archivo puede haber sido eliminado.' });
    }
    
    // Generar nombre de archivo para descarga
    const downloadName = `receta_${prescription.pet.name.replace(/[^a-zA-Z0-9]/g, '_')}_${prescription.id}.pdf`;
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Length', fs.statSync(pdfPath).size);
    
    // Stream el archivo
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.on('error', (error) => {
      console.error('Error streaming PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al leer el archivo PDF' });
      }
    });
    
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al descargar el archivo PDF' });
    }
  }
});

// Función de limpieza automática de prescripciones vencidas
const cleanupExpiredPrescriptions = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Buscar prescripciones vencidas
    const expiredPrescriptions = await prisma.prescription.findMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    console.log(`Found ${expiredPrescriptions.length} expired prescriptions to delete`);
    
    // Eliminar archivos PDF y registros
    for (const prescription of expiredPrescriptions) {
      try {
        // Eliminar archivo PDF si existe
        if (prescription.pdfPath && fs.existsSync(prescription.pdfPath)) {
          fs.unlinkSync(prescription.pdfPath);
          console.log(`Deleted PDF file: ${prescription.pdfPath}`);
        }
      } catch (fileError) {
        console.error(`Error deleting PDF file ${prescription.pdfPath}:`, fileError.message);
      }
    }
    
    // Eliminar registros de la base de datos
    const deleteResult = await prisma.prescription.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    console.log(`Deleted ${deleteResult.count} expired prescription records`);
    return { deleted: deleteResult.count, processed: expiredPrescriptions.length };
    
  } catch (error) {
    console.error('Error during prescription cleanup:', error);
    throw error;
  }
};

// Endpoint para ejecutar limpieza manual (útil para testing y cron jobs)
router.post('/cleanup', verifyToken, async (req, res) => {
  try {
    const result = await cleanupExpiredPrescriptions();
    res.json({
      message: 'Limpieza completada exitosamente',
      ...result
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    res.status(500).json({
      error: 'Error durante la limpieza de prescripciones',
      details: error.message
    });
  }
});

// Ejecutar limpieza automática al inicializar (para testing)
// En producción, esto debería ser un cron job separado
if (process.env.NODE_ENV !== 'development') {
  // Ejecutar limpieza cada 24 horas
  setInterval(cleanupExpiredPrescriptions, 24 * 60 * 60 * 1000);
}

export default router;
