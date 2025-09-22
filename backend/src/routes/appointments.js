import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

// Crear cita
router.post("/", verifyToken, async (req, res) => {
  const { petId, tutorId, date, reason } = req.body;
  const appointment = await prisma.appointment.create({
    data: { petId, tutorId, date: new Date(date), reason, userId: req.user.id },
  });
  res.json(appointment);
});

// Listar citas del profesional
router.get("/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const appointments = await prisma.appointment.findMany({
    where: { userId: Number(userId) },
    include: { pet: true, tutor: true },
  });
  res.json(appointments);
});

// Reserva pública (sin token) desde link público
router.post('/public', async (req, res) => {
  const { tutorId, tutorName, tutorEmail, tutorPhone, petId, petName, petType, date, reason, professionalId } = req.body;
  try {
    if (!professionalId) return res.status(400).json({ error: 'professionalId is required' });

    const profIdNum = Number(professionalId);
    if (Number.isNaN(profIdNum)) return res.status(400).json({ error: 'professionalId must be a number' });

    // Parse date defensively
    const selectedDate = date ? new Date(date) : null;
    if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use ISO date string.' });
    }

    let tutor = null;
    if (tutorId) {
      tutor = await prisma.tutor.findUnique({ where: { id: Number(tutorId) } });
      if (!tutor) return res.status(400).json({ error: 'Tutor not found' });
    } else if (tutorName) {
      tutor = await prisma.tutor.create({
        data: { name: tutorName, email: tutorEmail || null, phone: tutorPhone || null, userId: profIdNum },
      });
    }

    // crear mascota si no existe y si tenemos tutor
    let pet = null;
    if (petId) {
      pet = await prisma.pet.findUnique({ where: { id: Number(petId) } });
      if (!pet) return res.status(400).json({ error: 'Pet not found' });
    } else if (petName) {
      if (!tutor) return res.status(400).json({ error: 'Cannot create pet without tutor information' });
      pet = await prisma.pet.create({ data: { name: petName, type: petType || 'unknown', tutorId: tutor.id } });
    }

    // verificar disponibilidad del profesional
    const matching = await prisma.availability.findFirst({
      where: {
        userId: profIdNum,
        start: { lte: selectedDate },
        end: { gt: selectedDate },
      },
    });

    if (!matching) {
      return res.status(400).json({ error: 'El horario solicitado no está dentro de las disponibilidades del profesional' });
    }

    // evitar doble reserva exactamente a la misma fecha
    const exists = await prisma.appointment.findFirst({ where: { userId: profIdNum, date: selectedDate } });
    if (exists) return res.status(400).json({ error: 'Ya existe una cita en ese horario' });

    if (!pet || !tutor) return res.status(400).json({ error: 'Tutor and pet are required to create an appointment' });

    const appointment = await prisma.appointment.create({
      data: {
        petId: pet.id,
        tutorId: tutor.id,
        userId: profIdNum,
        date: selectedDate,
        reason: reason || '',
      },
    });

    res.json(appointment);
  } catch (err) {
    console.error('Error creating public appointment:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
