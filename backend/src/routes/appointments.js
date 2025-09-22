import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

// Crear cita (protegida) - crea appointment y elimina el slot de disponibilidad correspondiente de forma atómica
router.post("/", verifyToken, async (req, res) => {
  const { petId, tutorId, date, reason } = req.body;
  try {
    const selectedDate = new Date(date);
    if (Number.isNaN(selectedDate.getTime())) return res.status(400).json({ error: 'Invalid date' });

    const result = await prisma.$transaction(async (tx) => {
      const matching = await tx.availability.findFirst({
        where: { userId: req.user.id, start: { lte: selectedDate }, end: { gt: selectedDate } },
      });
      if (!matching) throw new Error('No availability for that time');

      const exists = await tx.appointment.findFirst({ where: { userId: req.user.id, date: selectedDate } });
      if (exists) throw new Error('Ya existe una cita en ese horario');

      const appointment = await tx.appointment.create({ data: { petId, tutorId, date: selectedDate, reason: reason || '', userId: req.user.id } });
      await tx.availability.delete({ where: { id: matching.id } });
      const full = await tx.appointment.findUnique({ where: { id: appointment.id }, include: { pet: true, tutor: true } });
      return full;
    });

    res.json(result);
  } catch (err) {
    console.error('Error creating appointment:', err);
    const message = err.message || 'Internal server error';
    if (message.includes('No availability') || message.includes('Ya existe')) return res.status(400).json({ error: message });
    res.status(500).json({ error: message });
  }
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

    // Require contact info (email and phone) for public bookings
    if (!tutorEmail || !tutorPhone) {
      return res.status(400).json({ error: 'tutorEmail and tutorPhone are required for public bookings' });
    }

    let tutor = null;
    if (tutorId) {
      tutor = await prisma.tutor.findUnique({ where: { id: Number(tutorId) } });
      if (!tutor) return res.status(400).json({ error: 'Tutor not found' });
    } else {
      // Try to find an existing tutor for this professional by email or phone
      tutor = await prisma.tutor.findFirst({
        where: {
          userId: profIdNum,
          OR: [
            { email: tutorEmail },
            { phone: tutorPhone }
          ]
        }
      });

      if (!tutor) {
        // create new tutor (use provided name if available)
        tutor = await prisma.tutor.create({
          data: { name: tutorName || 'Cliente público', email: tutorEmail, phone: tutorPhone, userId: profIdNum },
        });
      }
    }

    // Handle pet: reuse existing pet by name for that tutor if possible
    let pet = null;
    if (petId) {
      pet = await prisma.pet.findUnique({ where: { id: Number(petId) } });
      if (!pet) return res.status(400).json({ error: 'Pet not found' });
    } else if (petName) {
      // try find existing pet by name for this tutor (case-sensitive match)
      pet = await prisma.pet.findFirst({ where: { tutorId: tutor.id, name: petName } });
      if (!pet) {
        const now = new Date();
        pet = await prisma.pet.create({ data: { name: petName, type: petType || 'unknown', tutorId: tutor.id, createdAt: now, updatedAt: now } });
      }
    } else {
      return res.status(400).json({ error: 'petName or petId is required' });
    }

    // perform create + delete availability in a transaction to avoid races
    try {
      const result = await prisma.$transaction(async (tx) => {
        const matching = await tx.availability.findFirst({
          where: { userId: profIdNum, start: { lte: selectedDate }, end: { gt: selectedDate } },
        });
        if (!matching) throw new Error('El horario solicitado no está dentro de las disponibilidades del profesional');

        const exists = await tx.appointment.findFirst({ where: { userId: profIdNum, date: selectedDate } });
        if (exists) throw new Error('Ya existe una cita en ese horario');

        const appt = await tx.appointment.create({ data: { petId: pet.id, tutorId: tutor.id, userId: profIdNum, date: selectedDate, reason: reason || '' } });
        await tx.availability.delete({ where: { id: matching.id } });
        const full = await tx.appointment.findUnique({ where: { id: appt.id }, include: { pet: true, tutor: true } });
        return full;
      });

      res.json(result);
    } catch (txErr) {
      console.error('Transaction error creating public appointment:', txErr);
      const msg = txErr.message || 'Internal server error';
      if (msg.includes('No disponibilidad') || msg.includes('Ya existe')) return res.status(400).json({ error: msg });
      res.status(500).json({ error: msg });
    }
  } catch (err) {
    console.error('Error creating public appointment:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
