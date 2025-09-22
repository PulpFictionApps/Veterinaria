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
  const { petId, tutorId, title, content } = req.body;
  const sendWhatsApp = req.body.sendWhatsApp || false;
  
  try {
    const pet = await prisma.pet.findUnique({ 
      where: { id: Number(petId) }, 
      include: { tutor: true } 
    });
    if (!pet) return res.status(404).json({ error: 'Mascota no encontrada' });

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `receta_${pet.name}_${Date.now()}.pdf`;
    const outPath = path.join(process.cwd(), 'tmp', fileName);
    await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    // PDF Header
    doc.fontSize(20).text('RECETA VETERINARIA', { align: 'center' });
    doc.moveDown(2);

    // Patient Info
    doc.fontSize(14).text('INFORMACIÓN DEL PACIENTE', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Nombre: ${pet.name}`);
    doc.text(`Tipo: ${pet.type}`);
    if (pet.breed) doc.text(`Raza: ${pet.breed}`);
    if (pet.age) doc.text(`Edad: ${pet.age} años`);
    doc.moveDown();

    // Owner Info
    doc.fontSize(14).text('INFORMACIÓN DEL TUTOR', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Nombre: ${pet.tutor.name}`);
    if (pet.tutor.phone) doc.text(`Teléfono: ${pet.tutor.phone}`);
    if (pet.tutor.email) doc.text(`Email: ${pet.tutor.email}`);
    doc.moveDown(2);

    // Prescription Content
    doc.fontSize(14).text('RECETA MÉDICA', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(title || 'Receta Veterinaria', { bold: true });
    doc.moveDown();
    doc.text(content || 'Sin contenido específico');
    doc.moveDown(2);

    // Footer
    doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, { align: 'right' });
    doc.text('Firma del Veterinario: _________________', { align: 'right' });

    doc.end();

    await new Promise((resolve) => stream.on('finish', resolve));

    // Save prescription record
    const prescription = await prisma.prescription.create({
      data: {
        petId: Number(petId),
        tutorId: Number(tutorId),
        userId: req.user.id,
        title: title || 'Receta Veterinaria',
        content,
        pdfUrl: `/tmp/${fileName}`,
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
