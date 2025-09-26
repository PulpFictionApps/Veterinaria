import express from "express";
import prisma from "../../lib/prisma.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Crear mascota
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, type, breed, age, weight, sex, birthDate, tutorId } = req.body;

    if (!name || !type) return res.status(400).json({ error: 'name and type are required' });
    if (!tutorId) return res.status(400).json({ error: 'tutorId is required' });

    const tutorIdNum = Number(tutorId);
    if (Number.isNaN(tutorIdNum)) return res.status(400).json({ error: 'tutorId must be a number' });

    // Verify tutor exists
    const tutor = await prisma.tutor.findUnique({ where: { id: tutorIdNum } });
    if (!tutor) return res.status(400).json({ error: 'Tutor not found' });

    const now = new Date();
    const pet = await prisma.pet.create({
      data: {
        name,
        type,
        breed: breed || null,
        age: age ? Number(age) : null,
        weight: weight ? Number(weight) : null,
        sex: sex || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        tutorId: tutorIdNum,
        createdAt: now,
        updatedAt: now,
      },
    });

    res.json(pet);
  } catch (err) {
    console.error('Error creating pet:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Obtener mascotas (soporta query tutorId para compatibilidad con frontend)
router.get('/', verifyToken, async (req, res) => {
  const tutorId = req.query.tutorId;
  if (tutorId) {
    const pets = await prisma.pet.findMany({ where: { tutorId: Number(tutorId) } });
    return res.json(pets);
  }
  const pets = await prisma.pet.findMany();
  res.json(pets);
});

// Listar mascotas de un tutor
router.get("/tutor/:tutorId", verifyToken, async (req, res) => {
  const { tutorId } = req.params;
  const pets = await prisma.pet.findMany({ where: { tutorId: Number(tutorId) } });
  res.json(pets);
});

// Obtener mascota por id
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const pet = await prisma.pet.findUnique({ where: { id: Number(id) } });
  res.json(pet);
});

// Actualizar mascota
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, breed, age, weight, sex, birthDate, tutorId } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (breed !== undefined) updateData.breed = breed || null;
    if (age !== undefined) updateData.age = age ? Number(age) : null;
    if (weight !== undefined) updateData.weight = weight ? Number(weight) : null;
    if (sex !== undefined) updateData.sex = sex || null;
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (tutorId !== undefined) updateData.tutorId = Number(tutorId);
    
    updateData.updatedAt = new Date();
    
    const pet = await prisma.pet.update({ 
      where: { id: Number(id) }, 
      data: updateData
    });
    res.json(pet);
  } catch (err) {
    console.error('Error updating pet:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Eliminar mascota
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  await prisma.pet.delete({ where: { id: Number(id) } });
  res.json({ ok: true });
});

export default router;
