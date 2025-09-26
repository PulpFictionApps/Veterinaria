import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Crear disponibilidad
router.post("/", verifyToken, async (req, res) => {
  const { start, end } = req.body;
  try {
    if (!start || !end) return res.status(400).json({ error: 'start and end are required' });
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (startDate >= endDate) return res.status(400).json({ error: 'start must be before end' });

    // Split into 1-hour slots (only full 1-hour blocks)
    const slotsToCreate = [];
    const slotDurationMs = 1000 * 60 * 60; // 1 hour
    let cursor = new Date(startDate);
    while (cursor.getTime() + slotDurationMs <= endDate.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + slotDurationMs);
      slotsToCreate.push({ userId: req.user.id, start: slotStart, end: slotEnd });
      cursor = new Date(cursor.getTime() + slotDurationMs);
    }

    // If no full hour slots found, return error
    if (slotsToCreate.length === 0) {
      return res.status(400).json({ error: 'The provided range is smaller than 1 hour' });
    }

    const created = [];
    for (const s of slotsToCreate) {
      const exists = await prisma.availability.findFirst({ where: { userId: s.userId, start: s.start } });
      if (exists) continue; // skip duplicates
      const c = await prisma.availability.create({ data: s });
      created.push(c);
    }

    res.json(created);
  } catch (err) {
    console.error('Error creating availability:', err);
    res.status(500).json({ error: err.message });
  }
});

// Listar disponibilidad de un profesional
router.get("/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const slots = await prisma.availability.findMany({ where: { userId: Number(userId) } });
  res.json(slots);
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

// Disponibilidad pública para link (sin token)
router.get('/public/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const slots = await prisma.availability.findMany({ where: { userId: Number(userId) } });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
