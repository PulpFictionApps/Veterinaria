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
    let tutor = null;

    if (tutorId) {
      tutor = await prisma.tutor.findUnique({ where: { id: Number(tutorId) } });
    } else if (tutorName) {
      // crear tutor asociado al profesional
      tutor = await prisma.tutor.create({
        data: { name: tutorName, email: tutorEmail || null, phone: tutorPhone || null, userId: Number(professionalId) },
      });
    }

    // crear mascota si no existe
    let pet = null;
    if (petId) {
      // opcional: podríamos validar que pet pertenece al tutor
      pet = await prisma.pet.findUnique({ where: { id: Number(petId) } });
    } else if (petName && tutor) {
      pet = await prisma.pet.create({ data: { name: petName, type: petType || 'unknown', tutorId: tutor.id } });
    }

    const selectedDate = new Date(date);

    // verificar que la fecha solicitada cae dentro de alguna disponibilidad del profesional
    const matching = await prisma.availability.findFirst({
      where: {
        userId: Number(professionalId),
        start: { lte: selectedDate },
        end: { gt: selectedDate },
      },
    });

    if (!matching) {
      return res.status(400).json({ error: 'El horario solicitado no está dentro de las disponibilidades del profesional' });
    }

    // opcional: evitar doble reserva exactamente a la misma fecha
    const exists = await prisma.appointment.findFirst({ where: { userId: Number(professionalId), date: selectedDate } });
    if (exists) return res.status(400).json({ error: 'Ya existe una cita en ese horario' });

    const appointment = await prisma.appointment.create({
      data: {
        petId: pet.id,
        tutorId: tutor.id,
        userId: Number(professionalId),
        date: selectedDate,
        reason: reason || '',
      },
    });

    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
