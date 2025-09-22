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
  const { petId, tutorId, content } = req.body;
  // accept either sendWhatsapp or sendWhatsApp from frontend
  const sendWhatsapp = req.body.sendWhatsapp || req.body.sendWhatsApp;
  try {
    const pet = await prisma.pet.findUnique({ where: { id: Number(petId) }, include: { tutor: true } });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    // generate PDF
    const doc = new PDFDocument();
    const fileName = `prescription_${Date.now()}.pdf`;
    const outPath = path.join(process.cwd(), 'tmp', fileName);
    await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);
    doc.fontSize(18).text('Receta Médica', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Paciente: ${pet.name}`);
    doc.text(`Tutor: ${pet.tutor.name || ''}`);
    doc.moveDown();
    doc.text(content || 'Sin contenido');
    doc.end();

    await new Promise((resolve) => stream.on('finish', resolve));

    // Save prescription record
    const prescription = await prisma.prescription.create({
      data: {
        petId: Number(petId),
        tutorId: Number(tutorId),
        userId: req.user.id,
        pdfUrl: `/tmp/${fileName}`,
      },
    });

    // send via WhatsApp if requested
    if (sendWhatsapp && twilioClient && pet.tutor.phone) {
      const to = `whatsapp:${pet.tutor.phone}`;
      const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+1415xxx
      await twilioClient.messages.create({
        from,
        to,
        body: `Tienes una nueva receta para ${pet.name}.`,
        // mediaUrl requires a hosted accessible URL; here we skip actual mediaUrl in local env
      });
    }

  // If BACKEND_BASE_URL is provided, return a full URL for convenience
  const base = process.env.BACKEND_BASE_URL;
  const pdfUrl = base ? `${base}${prescription.pdfUrl}` : prescription.pdfUrl;
  res.json({ prescription, file: pdfUrl });
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
