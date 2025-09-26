import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

// Crear tutor
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, email, phone, rut, address } = req.body;
    const tutor = await prisma.tutor.create({
      data: { 
        name, 
        email: email || null, 
        phone: phone || null, 
        rut: rut || null, 
        address: address || null, 
        userId: req.user.id 
      },
    });
    res.json(tutor);
  } catch (err) {
    console.error('Error creating tutor:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Listar tutores con sus mascotas
router.get("/", verifyToken, async (req, res) => {
  const tutors = await prisma.tutor.findMany({ 
    where: { userId: req.user.id }, 
    include: { pets: true } 
  });
  res.json(tutors);
});

// Obtener tutor por id
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const tutor = await prisma.tutor.findUnique({ where: { id: Number(id) }, include: { pets: true } });
  res.json(tutor);
});

// Actualizar tutor
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, rut, address } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (rut !== undefined) updateData.rut = rut || null;
    if (address !== undefined) updateData.address = address || null;
    
    const tutor = await prisma.tutor.update({ 
      where: { id: Number(id) }, 
      data: updateData 
    });
    res.json(tutor);
  } catch (err) {
    console.error('Error updating tutor:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Eliminar tutor
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  await prisma.tutor.delete({ where: { id: Number(id) } });
  res.json({ ok: true });
});

export default router;
