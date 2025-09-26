import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

// Crear cita (protegida) - crea appointment y elimina el slot de disponibilidad correspondiente de forma atómica
router.post("/", verifyToken, async (req, res) => {
  const { petId, tutorId, date, reason, slotId } = req.body;
  try {
    let selectedDate = null;
    let matching = null;

    if (slotId) {
      // prefer slotId when provided
      matching = await prisma.availability.findUnique({ where: { id: Number(slotId) } });
      if (!matching) return res.status(400).json({ error: 'Availability slot not found' });
      if (matching.userId !== req.user.id) return res.status(403).json({ error: 'Not allowed to book this slot' });
      selectedDate = new Date(matching.start);
    } else {
      selectedDate = new Date(date);
      if (Number.isNaN(selectedDate.getTime())) return res.status(400).json({ error: 'Invalid date' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // if slotId was not used, try to find a matching availability range
      if (!matching) {
        matching = await tx.availability.findFirst({ where: { userId: req.user.id, start: { lte: selectedDate }, end: { gt: selectedDate } } });
      }
      if (!matching) throw new Error('No availability for that time');

      const exists = await tx.appointment.findFirst({ where: { userId: req.user.id, date: selectedDate } });
      if (exists) throw new Error('Ya existe una cita en ese horario');

      const appointment = await tx.appointment.create({ data: { petId, tutorId, date: selectedDate, reason: reason || '', userId: req.user.id } });
      await tx.availability.delete({ where: { id: matching.id } });
      const full = await tx.appointment.findUnique({ where: { id: appointment.id }, include: { pet: true, tutor: true, consultationType: true } });
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
    include: { 
      pet: true, 
      tutor: true,
      consultationType: true
    },
  });
  res.json(appointments);
});

// Obtener una cita específica por ID
router.get("/appointment/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: {
        pet: true,
        tutor: true,
        consultationType: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify ownership
    if (appointment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this appointment' });
    }

    res.json(appointment);
  } catch (err) {
    console.error('Error fetching appointment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Eliminar cita
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id: Number(id) } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.userId !== req.user.id) return res.status(403).json({ error: 'Not allowed' });

    // Delete appointment and restore the 1-hour availability slot for that time if possible
    const slotDurationMs = 1000 * 60 * 60;
    const apptDate = new Date(appointment.date);
    const slotStart = apptDate;
    const slotEnd = new Date(apptDate.getTime() + slotDurationMs);

    try {
      await prisma.$transaction(async (tx) => {
        await tx.appointment.delete({ where: { id: Number(id) } });

        // Only create availability if there isn't already a slot with the same start
        const exists = await tx.availability.findFirst({ where: { userId: appointment.userId, start: slotStart } });
        if (!exists) {
          await tx.availability.create({ data: { userId: appointment.userId, start: slotStart, end: slotEnd } });
        }
      });

      res.json({ ok: true });
    } catch (txErr) {
      console.error('Error deleting appointment and restoring slot:', txErr);
      // fallback: attempt simple delete (shouldn't normally reach here)
      await prisma.appointment.delete({ where: { id: Number(id) } });
      res.json({ ok: true, warning: 'Could not restore slot atomically' });
    }
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Actualizar cita (date and/or reason)
router.patch('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { date, reason } = req.body;
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id: Number(id) } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.userId !== req.user.id) return res.status(403).json({ error: 'Not allowed' });

      if (date || req.body.slotId) {
      const slotId = req.body.slotId;
      let selectedDate = null;
      let matching = null;

      if (slotId) {
        matching = await prisma.availability.findUnique({ where: { id: Number(slotId) } });
        if (!matching) return res.status(400).json({ error: 'Availability slot not found' });
        if (matching.userId !== req.user.id) return res.status(403).json({ error: 'Not allowed to use this slot' });
        selectedDate = new Date(matching.start);
      } else {
        selectedDate = new Date(date);
        if (Number.isNaN(selectedDate.getTime())) return res.status(400).json({ error: 'Invalid date' });
      }

      // transaction: check availability, update appointment date, delete matched availability
      const slotDurationMs = 1000 * 60 * 60;
      const oldDate = new Date(appointment.date);
      const oldStart = oldDate;
      const oldEnd = new Date(oldDate.getTime() + slotDurationMs);

      const result = await prisma.$transaction(async (tx) => {
        if (!matching) {
          matching = await tx.availability.findFirst({ where: { userId: req.user.id, start: { lte: selectedDate }, end: { gt: selectedDate } } });
        }
        if (!matching) throw new Error('No availability for that time');

        // ensure no appointment exists at that date (except this one)
        const exists = await tx.appointment.findFirst({ where: { userId: req.user.id, date: selectedDate } });
        if (exists && exists.id !== Number(id)) throw new Error('Ya existe una cita en ese horario');

        // Update appointment date
        const updated = await tx.appointment.update({ where: { id: Number(id) }, data: { date: selectedDate, reason: reason || appointment.reason } });

        // Delete the matched availability for the new date
        await tx.availability.delete({ where: { id: matching.id } });

        // Try to recreate availability for the old appointment time (unless a slot already exists)
        const oldExists = await tx.availability.findFirst({ where: { userId: req.user.id, start: oldStart } });
        if (!oldExists) {
          // Only recreate if the old slot doesn't collide with another appointment
          const collision = await tx.appointment.findFirst({ where: { userId: req.user.id, date: oldStart } });
          if (!collision) {
            await tx.availability.create({ data: { userId: req.user.id, start: oldStart, end: oldEnd } });
          }
        }

        const full = await tx.appointment.findUnique({ where: { id: updated.id }, include: { pet: true, tutor: true, consultationType: true } });
        return full;
      });

      res.json(result);
    } else {
      // only update reason
      const updated = await prisma.appointment.update({ where: { id: Number(id) }, data: { reason: reason || appointment.reason }, include: { pet: true, tutor: true } });
      res.json(updated);
    }
  } catch (err) {
    console.error('Error updating appointment:', err);
    const msg = err.message || 'Internal server error';
    if (msg.includes('No availability') || msg.includes('Ya existe')) return res.status(400).json({ error: msg });
    res.status(500).json({ error: msg });
  }
});

// Reserva pública (sin token) desde link público
router.post('/public', async (req, res) => {
  const { 
    tutorId, tutorName, tutorEmail, tutorPhone, tutorRut, tutorAddress,
    petId, petName, petType, petBreed, petAge, petWeight, petSex, petBirthDate,
    date, reason, professionalId, slotId, consultationTypeId 
  } = req.body;
  try {
    if (!professionalId) return res.status(400).json({ error: 'professionalId is required' });

    const profIdNum = Number(professionalId);
    if (Number.isNaN(profIdNum)) return res.status(400).json({ error: 'professionalId must be a number' });

    // Require contact info (email and phone) for public bookings
    if (!tutorEmail || !tutorPhone) {
      return res.status(400).json({ error: 'tutorEmail and tutorPhone are required for public bookings' });
    }

    // Resolve selected date & matching availability. Prefer slotId when provided.
    let selectedDate = null;
    let matching = null;
    if (slotId) {
      matching = await prisma.availability.findUnique({ where: { id: Number(slotId) } });
      if (!matching) return res.status(400).json({ error: 'Availability slot not found' });
      if (matching.userId !== profIdNum) return res.status(400).json({ error: 'Slot does not belong to the professional' });
      selectedDate = new Date(matching.start);
    } else {
      selectedDate = date ? new Date(date) : null;
      if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Use ISO date string or provide slotId.' });
      }
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

      let tutorCreatedNow = false;
      if (!tutor) {
          // create new tutor (use provided name if available)
          tutor = await prisma.tutor.create({
            data: { 
              name: tutorName || 'Cliente público', 
              email: tutorEmail, 
              phone: tutorPhone,
              rut: tutorRut || null,
              address: tutorAddress || null,
              userId: profIdNum 
            },
          });
          tutorCreatedNow = true;
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
        pet = await prisma.pet.create({ 
          data: { 
            name: petName, 
            type: petType || 'unknown',
            breed: petBreed || null,
            age: petAge ? Number(petAge) : null,
            weight: petWeight ? Number(petWeight) : null,
            sex: petSex || null,
            birthDate: petBirthDate ? new Date(petBirthDate) : null,
            tutorId: tutor.id, 
            createdAt: now, 
            updatedAt: now 
          } 
        });
      }
    } else {
      return res.status(400).json({ error: 'petName or petId is required' });
    }

    // Always create confirmed appointments and delete availability atomically
    try {
      const result = await prisma.$transaction(async (tx) => {
        const matching = await tx.availability.findFirst({
          where: { userId: profIdNum, start: { lte: selectedDate }, end: { gt: selectedDate } },
        });
        if (!matching) throw new Error('El horario solicitado no está dentro de las disponibilidades del profesional');

        const exists = await tx.appointment.findFirst({ where: { userId: profIdNum, date: selectedDate } });
        if (exists) throw new Error('Ya existe una cita en ese horario');

        const appointmentData = { 
          petId: pet.id, 
          tutorId: tutor.id, 
          userId: profIdNum, 
          date: selectedDate, 
          reason: reason || '' 
        };
        
        // Add consultation type if provided
        if (consultationTypeId) {
          appointmentData.consultationTypeId = Number(consultationTypeId);
        }

        const appt = await tx.appointment.create({ data: appointmentData });
        await tx.availability.delete({ where: { id: matching.id } });
        const full = await tx.appointment.findUnique({ where: { id: appt.id }, include: { pet: true, tutor: true, consultationType: true } });
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
