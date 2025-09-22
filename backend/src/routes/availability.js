import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

// Crear disponibilidad
router.post("/", verifyToken, async (req, res) => {
  const { start, end } = req.body;
  const slot = await prisma.availability.create({
    data: { userId: req.user.id, start: new Date(start), end: new Date(end) },
  });
  res.json(slot);
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
