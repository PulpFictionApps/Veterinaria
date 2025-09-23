import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Registro
router.post("/register", async (req, res) => {
  const { email, password, fullName, phone, clinicName, accountType } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, fullName, phone, clinicName, accountType },
    });

    // If registering a professional (clinic), create a 30-day trial subscription
    let subscription = null;
    if (accountType === 'professional') {
      const now = new Date();
      const expires = new Date(now);
      expires.setDate(expires.getDate() + 30);
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'basic',
          status: 'active',
          startedAt: now,
          expiresAt: expires,
        },
      });
      // keep isPremium for compatibility
      await prisma.user.update({ where: { id: user.id }, data: { isPremium: true } });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, subscription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
