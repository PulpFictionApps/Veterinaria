import express from 'express';
import prisma from '../../lib/prisma.js';
import { verifyToken } from '../middleware/auth.js';
import { verifyActiveSubscription } from '../middleware/subscription.js';

const router = express.Router();

// POST /medical-records
router.post('/', verifyToken, verifyActiveSubscription, async (req, res) => {
  const { petId, title, content, diagnosis, treatment, weight, temperature } = req.body;
  try {
    const record = await prisma.medicalRecord.create({ 
      data: { 
        petId: Number(petId), 
        title, 
        content,
        diagnosis: diagnosis || null,
        treatment: treatment || null,
        weight: weight ? Number(weight) : null,
        temperature: temperature ? Number(temperature) : null
      } 
    });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar fichas de una mascota
router.get('/pet/:petId', verifyToken, async (req, res) => {
  const { petId } = req.params;
  const records = await prisma.medicalRecord.findMany({ 
    where: { petId: Number(petId) },
    orderBy: { createdAt: 'desc' }
  });
  res.json(records);
});

// Obtener una ficha específica
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const record = await prisma.medicalRecord.findUnique({ where: { id: Number(id) } });
  res.json(record);
});

// Actualizar ficha clínica
router.patch('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, diagnosis, treatment, weight, temperature } = req.body;
  try {
    const record = await prisma.medicalRecord.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        diagnosis: diagnosis || null,
        treatment: treatment || null,
        weight: weight ? Number(weight) : null,
        temperature: temperature ? Number(temperature) : null
      }
    });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar ficha clínica
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.medicalRecord.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
