import express from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

// Crear tutor
router.post("/", verifyToken, async (req, res) => {
  const { name, email, phone } = req.body;
  const tutor = await prisma.tutor.create({
    data: { name, email, phone, userId: req.user.id },
  });
  res.json(tutor);
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
  const { id } = req.params;
  const { name, email, phone } = req.body;
  const tutor = await prisma.tutor.update({ where: { id: Number(id) }, data: { name, email, phone } });
  res.json(tutor);
});

// Eliminar tutor
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  await prisma.tutor.delete({ where: { id: Number(id) } });
  res.json({ ok: true });
});

export default router;
