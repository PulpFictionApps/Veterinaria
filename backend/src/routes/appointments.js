import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.js';
import { verifyActiveSubscription } from '../middleware/subscription.js';
import { sendAppointmentConfirmation } from '../../appointment-confirmation-service.js';

const prisma = new PrismaClient();
const router = Router();

// Función para encontrar y reservar múltiples bloques consecutivos
async function findAndReserveConsecutiveSlots(tx, userId, startTime, durationMinutes) {
  const slotDurationMs = 15 * 60 * 1000; // 15 minutos en millisegundos
  const slotsNeeded = Math.ceil(durationMinutes / 15); // Cuántos bloques de 15 min necesitamos
  
  const slotsToReserve = [];
  let currentTime = new Date(startTime);
  // normalize seconds/milliseconds to avoid mismatches with stored availability
  currentTime.setSeconds(0, 0);
  
  // Buscar slots consecutivos
  for (let i = 0; i < slotsNeeded; i++) {
    const slotEnd = new Date(currentTime.getTime() + slotDurationMs);
    
    // Buscar un slot que empiece exactamente en currentTime
    const slot = await tx.availability.findFirst({
      where: {
        userId: userId,
        start: currentTime,
        end: slotEnd
      }
    });
    
    if (!slot) {
      throw new Error(`No hay disponibilidad suficiente. Se necesitan ${slotsNeeded} bloques consecutivos de 15 minutos.`);
    }
    
    slotsToReserve.push(slot);
    currentTime = new Date(currentTime.getTime() + slotDurationMs);
  }
  
  // Eliminar todos los slots reservados
  for (const slot of slotsToReserve) {
  await tx.availability.delete({ where: { id: slot.id } });
  }
  
  return slotsToReserve;
}

// Crear cita (protegida) - crea appointment y elimina el slot de disponibilidad correspondiente de forma atómica
// POST /appointments - crear cita (requiere token)
router.post('/', verifyToken, verifyActiveSubscription, async (req, res) => {
  const { petId, tutorId, date, reason, slotId, consultationTypeId } = req.body;
  try {
    let selectedDate = null;
    let matching = null;
    let consultationType = null;

    // Si se proporciona consultationTypeId, obtener la información del tipo
    if (consultationTypeId) {
      consultationType = await prisma.consultationType.findUnique({
        where: { id: Number(consultationTypeId) }
      });
      if (!consultationType) {
        return res.status(400).json({ error: 'Consultation type not found' });
      }
    }

  // Determinar duración (por defecto 15 minutos si no hay tipo específico)
  const durationMinutes = consultationType?.duration || 15;

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
      // Verificar que no existe otra cita en ese horario
      const exists = await tx.appointment.findFirst({ where: { userId: req.user.id, date: selectedDate } });
      if (exists) throw new Error('Ya existe una cita en ese horario');

      // Reservar múltiples bloques consecutivos según la duración
      await findAndReserveConsecutiveSlots(tx, req.user.id, selectedDate, durationMinutes);

      // Crear la cita
      const appointmentData = { 
        petId, 
        tutorId, 
        date: selectedDate, 
        reason: reason || '', 
        userId: req.user.id 
      };
      
      if (consultationTypeId) {
        appointmentData.consultationTypeId = Number(consultationTypeId);
      }

      const appointment = await tx.appointment.create({ data: appointmentData });
      const full = await tx.appointment.findUnique({ 
        where: { id: appointment.id }, 
        include: { pet: true, tutor: true, consultationType: true } 
      });
      return full;
    });

    // Enviar confirmación automática por email
    console.log(`📧 Iniciando envío de confirmación automática para cita ID: ${result.id}`);
    try {
      const emailSent = await sendAppointmentConfirmation(result.id);
      if (emailSent) {
        console.log(`✅ Confirmación de cita enviada automáticamente para cita ID: ${result.id}`);
      } else {
        console.log(`⚠️  Confirmación NO enviada para cita ID: ${result.id} (sin errores pero falló el envío)`);
      }
    } catch (emailError) {
      console.error(`❌ Error enviando confirmación de cita ID ${result.id}:`, emailError.message);
      console.error(`Stack trace:`, emailError.stack);
      // No fallar la creación de la cita por error de email
    }

    res.json(result);
  } catch (err) {
    console.error('Error creating appointment:', err);
    const message = err.message || 'Internal server error';
    if (message.includes('No availability') || message.includes('Ya existe') || message.includes('No hay disponibilidad')) {
      return res.status(400).json({ error: message });
    }
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

// Obtener citas por mascota
router.get("/pet/:petId", verifyToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const appointments = await prisma.appointment.findMany({
      where: { petId: Number(petId) },
      include: {
        pet: true,
        tutor: true,
        consultationType: true
      },
      orderBy: { date: 'desc' }
    });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments by pet:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
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

    // Delete appointment and restore availability blocks of 15 minutes for that appointment time
  const slotDurationMs = 1000 * 60 * 15; // 15 minutes blocks
  const apptDate = new Date(appointment.date);
  // normalize restore start to zero seconds/ms to match availability entries
  const restoreStart = new Date(apptDate);
  restoreStart.setSeconds(0, 0);
    // We'll recreate enough 15-minute blocks to cover the original appointment duration
    // If consultationType is present we could use its duration; fallback to 15 minutes
    const consult = await prisma.consultationType.findUnique({ where: { id: appointment.consultationTypeId } }).catch(() => null);
    const durationMinutes = consult?.duration || 15;
    const blocks = Math.ceil(durationMinutes / 15);

    try {
      await prisma.$transaction(async (tx) => {
        await tx.appointment.delete({ where: { id: Number(id) } });

        // Create blocks starting at restoreStart for `blocks` iterations if they don't already exist
        for (let i = 0; i < blocks; i++) {
          const start = new Date(restoreStart.getTime() + i * slotDurationMs);
          start.setSeconds(0, 0);
          const end = new Date(start.getTime() + slotDurationMs);
          end.setSeconds(0, 0);
          const exists = await tx.availability.findFirst({ where: { userId: appointment.userId, start } });
          if (!exists) {
            await tx.availability.create({ data: { userId: appointment.userId, start, end } });
          }
        }
      });

      res.json({ ok: true });
    } catch (txErr) {
      console.error('Error deleting appointment and restoring slots:', txErr);
      // fallback: attempt simple delete (shouldn't normally reach here)
      await prisma.appointment.delete({ where: { id: Number(id) } });
      res.json({ ok: true, warning: 'Could not restore slots atomically' });
    }
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Actualizar cita (date, reason, status)
router.patch('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { date, reason, status } = req.body;
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id: Number(id) } });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    if (appointment.userId !== req.user.id) return res.status(403).json({ error: 'Not allowed' });

    // If caller wants to update only the status (e.g., mark as completed), handle it here
    if (typeof status === 'string') {
      const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const updatedStatus = await prisma.appointment.update({
        where: { id: Number(id) },
        data: { status },
        include: { pet: true, tutor: true, consultationType: true }
      });

      return res.json(updatedStatus);
    }

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
      // When recreating the old availability, recreate as 15-minute blocks matching the consultation duration
  const slotDurationMs = 1000 * 60 * 15; // 15 minutes
  const oldDate = new Date(appointment.date);
  const oldStart = new Date(oldDate);
  oldStart.setSeconds(0, 0);

      // Determine how many 15-minute blocks to recreate based on consultationType duration (fallback 15)
      const oldConsult = await prisma.consultationType.findUnique({ where: { id: appointment.consultationTypeId } }).catch(() => null);
      const oldDurationMinutes = oldConsult?.duration || 15;
      const oldBlocks = Math.ceil(oldDurationMinutes / 15);

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

        // Try to recreate availability for the old appointment time as 15-minute blocks (unless slots already exist)
        // Only recreate if the old slot doesn't collide with another appointment
        const collision = await tx.appointment.findFirst({ where: { userId: req.user.id, date: oldStart } });
        if (!collision) {
          for (let i = 0; i < oldBlocks; i++) {
            const s = new Date(oldStart.getTime() + i * slotDurationMs);
            s.setSeconds(0, 0);
            const e = new Date(s.getTime() + slotDurationMs);
            e.setSeconds(0, 0);
            const oldExists = await tx.availability.findFirst({ where: { userId: req.user.id, start: s } });
            if (!oldExists) {
              await tx.availability.create({ data: { userId: req.user.id, start: s, end: e } });
            }
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
    petId, existingPetId, petName, petType, petBreed, petAge, petWeight, petSex, petReproductiveStatus, petBirthDate,
    date, reason, professionalId, slotId, consultationTypeId 
  } = req.body;
  try {
    if (!professionalId) return res.status(400).json({ error: 'professionalId is required' });

    const profIdNum = Number(professionalId);
    if (Number.isNaN(profIdNum)) return res.status(400).json({ error: 'professionalId must be a number' });

    // Require all client info for public bookings
    if (!tutorEmail || !tutorPhone || !tutorName || !tutorRut || !tutorAddress) {
      return res.status(400).json({ error: 'Todos los datos del cliente son obligatorios: email, nombre, teléfono, RUT y dirección' });
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
      // Check for existing tutor with same email, phone, or RUT for this professional
      tutor = await prisma.tutor.findFirst({
        where: {
          userId: profIdNum,
          OR: [
            { email: tutorEmail },
            { phone: tutorPhone },
            { rut: tutorRut }
          ]
        }
      });

      if (!tutor) {
        // Before creating new tutor, check if phone or RUT already exist for this professional
        const existingByPhone = await prisma.tutor.findFirst({
          where: { userId: profIdNum, phone: tutorPhone }
        });
        
        if (existingByPhone) {
          return res.status(400).json({ error: 'Ya existe un cliente con este número de teléfono' });
        }

        const existingByRut = await prisma.tutor.findFirst({
          where: { userId: profIdNum, rut: tutorRut }
        });
        
        if (existingByRut) {
          return res.status(400).json({ error: 'Ya existe un cliente con este RUT' });
        }

        // Create new tutor
        tutor = await prisma.tutor.create({
          data: { 
            name: tutorName, 
            email: tutorEmail, 
            phone: tutorPhone,
            rut: tutorRut,
            address: tutorAddress,
            userId: profIdNum 
          },
        });
      }
    }

    // Handle pet: use existingPetId if provided, otherwise handle as before
    let pet = null;
    if (existingPetId) {
      pet = await prisma.pet.findUnique({ 
        where: { id: Number(existingPetId) },
        include: { tutor: true }
      });
      if (!pet) return res.status(400).json({ error: 'Existing pet not found' });
      // Verify pet belongs to this professional
      if (pet.tutor.userId !== profIdNum) {
        return res.status(400).json({ error: 'Pet does not belong to this professional' });
      }
    } else if (petId) {
      pet = await prisma.pet.findUnique({ where: { id: Number(petId) } });
      if (!pet) return res.status(400).json({ error: 'Pet not found' });
    } else if (petName) {
      // Validar campos obligatorios para mascotas nuevas
      if (!petName || !petType || !petBreed || !petAge || !petWeight || !petSex || !petReproductiveStatus || !petBirthDate) {
        return res.status(400).json({ error: 'Todos los datos de la mascota son obligatorios: nombre, tipo, raza, edad, peso, sexo, estado reproductivo y fecha de nacimiento' });
      }
      
      // try find existing pet by name for this tutor (case-sensitive match)
      pet = await prisma.pet.findFirst({ where: { tutorId: tutor.id, name: petName } });
      if (!pet) {
        const now = new Date();
        pet = await prisma.pet.create({ 
          data: { 
            name: petName, 
            type: petType,
            breed: petBreed,
            age: Number(petAge),
            weight: Number(petWeight),
            sex: petSex,
            reproductiveStatus: petReproductiveStatus,
            birthDate: new Date(petBirthDate),
            tutorId: tutor.id, 
            createdAt: now, 
            updatedAt: now 
          } 
        });
      }
    } else {
      return res.status(400).json({ error: 'petName, petId, or existingPetId is required' });
    }

    // Always create confirmed appointments and delete availability atomically
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Obtener información del tipo de consulta si se proporciona
        let consultationType = null;
        if (consultationTypeId) {
          consultationType = await tx.consultationType.findUnique({
            where: { id: Number(consultationTypeId) }
          });
        }

  // Determinar duración (por defecto 15 minutos si no hay tipo específico)
  const durationMinutes = consultationType?.duration || 15;

        // Verificar que no existe otra cita en ese horario
        const exists = await tx.appointment.findFirst({ where: { userId: profIdNum, date: selectedDate } });
        if (exists) throw new Error('Ya existe una cita en ese horario');

        // Reservar múltiples bloques consecutivos según la duración
        await findAndReserveConsecutiveSlots(tx, profIdNum, selectedDate, durationMinutes);

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
        const full = await tx.appointment.findUnique({ where: { id: appt.id }, include: { pet: true, tutor: true, consultationType: true } });
        return full;
      });

      // Enviar confirmación automática por email
      console.log(`📧 Iniciando envío de confirmación automática para cita pública ID: ${result.id}`);
      try {
        const emailSent = await sendAppointmentConfirmation(result.id);
        if (emailSent) {
          console.log(`✅ Confirmación de cita pública enviada automáticamente para cita ID: ${result.id}`);
        } else {
          console.log(`⚠️  Confirmación pública NO enviada para cita ID: ${result.id} (sin errores pero falló el envío)`);
        }
      } catch (emailError) {
        console.error(`❌ Error enviando confirmación de cita pública ID ${result.id}:`, emailError.message);
        console.error(`Stack trace:`, emailError.stack);
        // No fallar la creación de la cita por error de email
      }

      res.json(result);
    } catch (txErr) {
      console.error('Transaction error creating public appointment:', txErr);
      const msg = txErr.message || 'Internal server error';
      if (msg.includes('No disponibilidad') || msg.includes('Ya existe') || msg.includes('No hay disponibilidad')) {
        return res.status(400).json({ error: msg });
      }
      res.status(500).json({ error: msg });
    }
  } catch (err) {
    console.error('Error creating public appointment:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
