import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Crear ficha clínica para una mascota
router.post('/', verifyToken, async (req, res) => {
  const { petId, title, content } = req.body;
  try {
    const record = await prisma.medicalRecord.create({ data: { petId: Number(petId), title, content } });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar fichas de una mascota
router.get('/pet/:petId', verifyToken, async (req, res) => {
  const { petId } = req.params;
  const records = await prisma.medicalRecord.findMany({ where: { petId: Number(petId) } });
  res.json(records);
});

export default router;
