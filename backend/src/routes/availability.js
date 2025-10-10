import express from "express";
import prisma from '../../lib/prisma.js';
import { verifyToken } from "../middleware/auth.js";
import { verifyActiveSubscription } from "../middleware/subscription.js";
import { getChileDate } from "../../scripts/cleanup-expired-slots.js";
import { parseChileanDateTime, logDateTimeDebug } from "../lib/timezone.js";

const router = express.Router();

// Crear disponibilidad
router.post("/", verifyToken, verifyActiveSubscription, async (req, res) => {
  const { start, end } = req.body;
  
  try {
    if (!start || !end) return res.status(400).json({ error: 'start and end are required' });
    
    // Parse dates as Chilean local time using shared helper function
    const startDate = parseChileanDateTime(start);
    const endDate = parseChileanDateTime(end);
    
    // Debug logging
    logDateTimeDebug('Availability startDate', startDate);
    logDateTimeDebug('Availability endDate', endDate);
    
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Debug logs: show what we received and how the server parsed it
    console.log('POST /availability received start:', start, 'end:', end);
    console.log('Parsed start ISO:', startDate.toISOString(), 'Parsed end ISO:', endDate.toISOString());

    // Normalize seconds and milliseconds to zero for exactness
    startDate.setSeconds(0, 0);
    endDate.setSeconds(0, 0);

    // Validate that incoming times are aligned to 15-minute boundaries
    if (startDate.getMinutes() % 15 !== 0 || endDate.getMinutes() % 15 !== 0) {
      return res.status(400).json({ error: 'Start and end must be aligned to 15-minute increments (e.g., :00, :15, :30, :45).', parsedStart: startDate.toISOString(), parsedEnd: endDate.toISOString() });
    }
    if (startDate >= endDate) return res.status(400).json({ error: 'start must be before end' });

    // Split into 15-minute slots
    const slotsToCreate = [];
    const slotDurationMs = 1000 * 60 * 15; // 15 minutes
    let cursor = new Date(startDate);
    while (cursor.getTime() + slotDurationMs <= endDate.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + slotDurationMs);
      slotsToCreate.push({ userId: req.user.id, start: slotStart, end: slotEnd });
      cursor = new Date(cursor.getTime() + slotDurationMs);
    }

    // If no slots found, return error
    if (slotsToCreate.length === 0) {
      return res.status(400).json({ error: 'The provided range is smaller than 15 minutes' });
    }

    // Verificar duplicados antes de crear cualquier slot con mayor tolerancia
    console.log('Checking for duplicates among', slotsToCreate.length, 'slots...');
    const duplicateChecks = [];
    for (const s of slotsToCreate) {
      // Buscar slots existentes con una ventana de tiempo para evitar problemas de precisión
      const exists = await prisma.availability.findFirst({ 
        where: { 
          userId: s.userId, 
          start: {
            gte: new Date(s.start.getTime() - 1000), // 1 segundo antes
            lte: new Date(s.start.getTime() + 1000)  // 1 segundo después
          },
          end: {
            gte: new Date(s.end.getTime() - 1000),
            lte: new Date(s.end.getTime() + 1000)
          }
        } 
      });
      
      if (exists) {
        console.log(`Duplicate found: ${s.start.toISOString()} - ${s.end.toISOString()}`);
        duplicateChecks.push({
          start: s.start.toISOString(),
          end: s.end.toISOString(),
          existing: true,
          existingId: exists.id
        });
      } else {
        duplicateChecks.push({
          start: s.start.toISOString(),
          end: s.end.toISOString(),
          existing: false
        });
      }
    }

    // Contar duplicados
    const duplicateCount = duplicateChecks.filter(check => check.existing).length;
    const totalSlots = slotsToCreate.length;

    // Si todos son duplicados, devolver error específico
    if (duplicateCount === totalSlots) {
      return res.status(409).json({ 
        error: 'Todos los horarios solicitados ya existen para este período',
        details: duplicateChecks,
        duplicateCount,
        totalSlots
      });
    }

    // Filtrar solo los slots que no son duplicados para crear
    const slotsToActuallyCreate = slotsToCreate.filter((_, index) => !duplicateChecks[index].existing);
    
    console.log(`Will create ${slotsToActuallyCreate.length} new slots, skipping ${duplicateCount} duplicates`);
    
    // Si no hay slots nuevos para crear, retornar información sobre duplicados
    if (slotsToActuallyCreate.length === 0) {
      return res.status(200).json({
        message: 'Todos los horarios ya existen',
        created: [],
        skipped: duplicateChecks.filter(check => check.existing),
        summary: {
          totalRequested: totalSlots,
          duplicatesFound: duplicateCount,
          newSlotsCreated: 0
        }
      });
    }

    // Usar transacción para crear slots de manera atómica
    const result = await prisma.$transaction(async (tx) => {
      const created = [];
      const skipped = duplicateChecks.filter(check => check.existing);
      
      for (const s of slotsToActuallyCreate) {
        try {
          const c = await tx.availability.create({ data: s });
          created.push(c);
        } catch (createError) {
          console.error('Error creating slot:', createError);
          // Capturar errores de duplicado de la constraint única
          if (createError.code === 'P2002') {
            skipped.push({
              start: s.start.toISOString(),
              end: s.end.toISOString(),
              reason: 'Horario duplicado - ya existe'
            });
          } else {
            // Re-lanzar otros errores
            throw createError;
          }
        }
      }

      return { created, skipped };
    });

    // Respuesta detallada
    const response = {
      created: result.created,
      summary: {
        totalRequested: totalSlots,
        created: result.created.length,
        skipped: result.skipped.length,
        skippedSlots: result.skipped
      }
    };

    res.json(response);
  } catch (err) {
    console.error('Error creating availability:', err);
    
    // Manejo específico de errores de duplicado
    if (err.code === 'P2002' && err.meta?.target?.includes('unique_user_slot')) {
      return res.status(409).json({ 
        error: 'No se pueden crear horarios duplicados para la misma fecha y hora',
        details: 'Ya existe un horario de disponibilidad para este período'
      });
    }
    
    res.status(500).json({ error: err.message });
  }
});

// Listar disponibilidad de un profesional (filtrar horarios expirados)
router.get("/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const now = getChileDate();
    const slots = await prisma.availability.findMany({ 
      where: { 
        userId: Number(userId),
        end: {
          gt: now // Solo horarios que no han expirado
        }
      },
      orderBy: { start: 'asc' }
    });
    res.json(slots);
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener slot por id
router.get('/slot/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const slot = await prisma.availability.findUnique({ where: { id: Number(id) } });
  res.json(slot);
});

// Actualizar slot
router.patch('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { start, end } = req.body;
  const slot = await prisma.availability.update({ where: { id: Number(id) }, data: { start: new Date(start), end: new Date(end) } });
  res.json(slot);
});

// Eliminar slot
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  await prisma.availability.delete({ where: { id: Number(id) } });
  res.json({ ok: true });
});

// Disponibilidad pública para link (sin token) - filtrar horarios expirados
router.get('/public/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const now = getChileDate();
    const slots = await prisma.availability.findMany({ 
      where: { 
        userId: Number(userId),
        end: {
          gt: now // Solo horarios que no han expirado
        }
      },
      orderBy: { start: 'asc' }
    });
    res.json(slots);
  } catch (err) {
    console.error('Error fetching public availability:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
