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
  console.log('POST /prescriptions - Body:', req.body);
  console.log('POST /prescriptions - User:', req.user);
  
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
  
  try {
    const pet = await prisma.pet.findUnique({ 
      where: { id: Number(petId) }, 
      include: { tutor: true } 
    });
    if (!pet) return res.status(404).json({ error: 'Mascota no encontrada' });

    // Obtener datos del profesional
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

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `receta_${pet.name}_${Date.now()}.pdf`;
    const outPath = path.join(process.cwd(), 'tmp', fileName);
    await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

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

    await new Promise((resolve) => stream.on('finish', resolve));

    // Save prescription record
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
        pdfUrl: `/tmp/${fileName}`,
        pdfPath: outPath,
        sendWhatsApp,
        whatsappSent: false
      },
    });

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
    const pdfUrl = base ? `${base}${prescription.pdfUrl}` : prescription.pdfUrl;
    res.json({ 
      prescription: { ...prescription, whatsappSent }, 
      file: pdfUrl 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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

export default router;
