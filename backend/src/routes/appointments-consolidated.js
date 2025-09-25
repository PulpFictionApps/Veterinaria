import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

// ===========================
// AVAILABILITY MANAGEMENT
// ===========================

// GET /appointments/availability - Get user availability
router.get("/availability", verifyToken, async (req, res) => {
  try {
    const availability = await prisma.availability.findMany({
      where: { userId: req.user.id },
      orderBy: { start: 'asc' }
    });
    res.json(availability);
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ error: 'Error fetching availability' });
  }
});

// GET /appointments/availability/public/:userId - Get public availability for booking
router.get("/availability/public/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const availability = await prisma.availability.findMany({
      where: { userId },
      orderBy: { start: 'asc' }
    });
    res.json(availability);
  } catch (err) {
    console.error('Error fetching public availability:', err);
    res.status(500).json({ error: 'Error fetching availability' });
  }
});

// POST /appointments/availability - Create availability slots
router.post("/availability", verifyToken, async (req, res) => {
  try {
    const { start, end } = req.body;
    
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end are required' });
    }
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    if (startDate >= endDate) {
      return res.status(400).json({ error: 'end must be after start' });
    }
    
    const availability = await prisma.availability.create({
      data: {
        start: startDate,
        end: endDate,
        userId: req.user.id
      }
    });
    
    res.json(availability);
  } catch (err) {
    console.error('Error creating availability:', err);
    res.status(500).json({ error: 'Error creating availability' });
  }
});

// DELETE /appointments/availability/:id - Delete availability slot
router.delete("/availability/:id", verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    const deleted = await prisma.availability.deleteMany({
      where: { 
        id,
        userId: req.user.id 
      }
    });
    
    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Availability slot not found' });
    }
    
    res.json({ message: 'Availability deleted successfully' });
  } catch (err) {
    console.error('Error deleting availability:', err);
    res.status(500).json({ error: 'Error deleting availability' });
  }
});

// ===========================
// CONSULTATION TYPES MANAGEMENT
// ===========================

// GET /appointments/types - Get consultation types
router.get("/types", verifyToken, async (req, res) => {
  try {
    const types = await prisma.consultationType.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' }
    });
    res.json(types);
  } catch (err) {
    console.error('Error fetching consultation types:', err);
    res.status(500).json({ error: 'Error fetching consultation types' });
  }
});

// POST /appointments/types - Create consultation type
router.post("/types", verifyToken, async (req, res) => {
  try {
    const { name, duration, price } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    
    const type = await prisma.consultationType.create({
      data: {
        name,
        duration: duration ? Number(duration) : 60, // default 60 minutes
        price: price ? Number(price) : null,
        userId: req.user.id
      }
    });
    
    res.json(type);
  } catch (err) {
    console.error('Error creating consultation type:', err);
    res.status(500).json({ error: 'Error creating consultation type' });
  }
});

// PATCH /appointments/types/:id - Update consultation type
router.patch("/types/:id", verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, duration, price } = req.body;
    
    const updated = await prisma.consultationType.updateMany({
      where: { 
        id,
        userId: req.user.id 
      },
      data: {
        name: name || undefined,
        duration: duration !== undefined ? Number(duration) : undefined,
        price: price !== undefined ? (price ? Number(price) : null) : undefined
      }
    });
    
    if (updated.count === 0) {
      return res.status(404).json({ error: 'Consultation type not found' });
    }
    
    const type = await prisma.consultationType.findFirst({
      where: { id, userId: req.user.id }
    });
    
    res.json(type);
  } catch (err) {
    console.error('Error updating consultation type:', err);
    res.status(500).json({ error: 'Error updating consultation type' });
  }
});

// DELETE /appointments/types/:id - Delete consultation type
router.delete("/types/:id", verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    const deleted = await prisma.consultationType.deleteMany({
      where: { 
        id,
        userId: req.user.id 
      }
    });
    
    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Consultation type not found' });
    }
    
    res.json({ message: 'Consultation type deleted successfully' });
  } catch (err) {
    console.error('Error deleting consultation type:', err);
    res.status(500).json({ error: 'Error deleting consultation type' });
  }
});

// ===========================
// APPOINTMENTS MANAGEMENT
// ===========================

// POST /appointments - Create appointment (authenticated)
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
        matching = await tx.availability.findFirst({ 
          where: { 
            userId: req.user.id, 
            start: { lte: selectedDate }, 
            end: { gt: selectedDate } 
          } 
        });
      }

      if (matching) {
        await tx.availability.delete({ where: { id: matching.id } });
      }

      const appointment = await tx.appointment.create({
        data: {
          petId: petId ? Number(petId) : null,
          tutorId: tutorId ? Number(tutorId) : null,
          userId: req.user.id,
          date: selectedDate,
          reason: reason || 'Consulta general'
        },
        include: {
          pet: true,
          tutor: true
        }
      });

      return appointment;
    });

    res.json(result);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: err.message || 'Error creating appointment' });
  }
});

// POST /appointments/public - Create appointment (public, no auth)
router.post("/public", async (req, res) => {
  try {
    const { professionalId, petName, tutorName, tutorPhone, tutorEmail, date, reason } = req.body;
    
    if (!professionalId || !date) {
      return res.status(400).json({ error: 'professionalId and date are required' });
    }

    const selectedDate = new Date(date);
    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Check for duplicate appointments at the same time
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        userId: Number(professionalId),
        date: selectedDate
      }
    });

    if (existingAppointment) {
      return res.status(409).json({ error: 'Ya existe una cita en esta fecha y hora' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find matching availability slot
      const matching = await tx.availability.findFirst({
        where: {
          userId: Number(professionalId),
          start: { lte: selectedDate },
          end: { gt: selectedDate }
        }
      });

      // Remove the availability slot if found
      if (matching) {
        await tx.availability.delete({ where: { id: matching.id } });
      }

      // Create temporary tutor and pet if they don't exist
      let tutor = null;
      let pet = null;

      if (tutorName) {
        tutor = await tx.tutor.create({
          data: {
            name: tutorName,
            phone: tutorPhone || null,
            email: tutorEmail || null,
            userId: Number(professionalId)
          }
        });

        if (petName) {
          pet = await tx.pet.create({
            data: {
              name: petName,
              type: 'Unknown',
              tutorId: tutor.id,
              updatedAt: new Date()
            }
          });
        }
      }

      // Create appointment
      const appointment = await tx.appointment.create({
        data: {
          userId: Number(professionalId),
          petId: pet?.id || null,
          tutorId: tutor?.id || null,
          date: selectedDate,
          reason: reason || 'Consulta general'
        },
        include: {
          pet: true,
          tutor: true
        }
      });

      return appointment;
    });

    res.json(result);
  } catch (err) {
    console.error('Error creating public appointment:', err);
    res.status(500).json({ error: err.message || 'Error creating appointment' });
  }
});

// GET /appointments - Get user appointments
router.get("/", verifyToken, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: req.user.id },
      include: {
        pet: true,
        tutor: true
      },
      orderBy: { date: 'desc' }
    });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

// GET /appointments/:userId - Get appointments for specific user (public)
router.get("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      include: {
        pet: true,
        tutor: true
      },
      orderBy: { date: 'desc' }
    });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching public appointments:', err);
    res.status(500).json({ error: 'Error fetching appointments' });
  }
});

// PATCH /appointments/:id - Update appointment
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { date, reason, status } = req.body;
    
    const updated = await prisma.appointment.updateMany({
      where: { 
        id,
        userId: req.user.id 
      },
      data: {
        date: date ? new Date(date) : undefined,
        reason: reason || undefined,
        status: status || undefined
      }
    });
    
    if (updated.count === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const appointment = await prisma.appointment.findFirst({
      where: { id, userId: req.user.id },
      include: {
        pet: true,
        tutor: true
      }
    });
    
    res.json(appointment);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ error: 'Error updating appointment' });
  }
});

// DELETE /appointments/:id - Delete appointment
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    const deleted = await prisma.appointment.deleteMany({
      where: { 
        id,
        userId: req.user.id 
      }
    });
    
    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ error: 'Error deleting appointment' });
  }
});

export default router;