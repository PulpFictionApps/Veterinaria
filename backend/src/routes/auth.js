import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Registro
router.post("/register", async (req, res) => {
  const { email, password, fullName, phone, professionalRut, clinicName, accountType } = req.body;
  try {
    // Validar campos obligatorios
    if (!email || !password || !fullName || !phone || !professionalRut) {
      return res.status(400).json({ error: "Nombre, email, contraseña, teléfono y RUT son obligatorios" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Usuario ya existe" });

    // Validar unicidad de teléfono
    if (phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ error: "Este número de teléfono ya está registrado" });
      }
    }

    // Validar unicidad de RUT
    if (professionalRut) {
      const existingRut = await prisma.user.findFirst({ where: { professionalRut } });
      if (existingRut) {
        return res.status(400).json({ error: "Este RUT ya está registrado" });
      }
    }

    // Only professionals are allowed to register accounts in this app.
    if (accountType !== 'professional') {
      return res.status(400).json({ error: 'Sólo profesionales pueden crear cuentas en esta plataforma' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, fullName, phone, professionalRut, clinicName, accountType },
    });

    // Si se registra un profesional, crear suscripción de prueba gratuita de 7 días
    let subscription = null;
    if (accountType === 'professional') {
      const now = new Date();
      const expires = new Date(now);
      expires.setDate(expires.getDate() + 7); // 7 días de prueba gratuita
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'basic',
          status: 'trial',
          providerId: `trial_${Date.now()}`,
          startedAt: now,
          expiresAt: expires,
        },
      });
      // Marcar como premium durante el periodo de prueba
      await prisma.user.update({ where: { id: user.id }, data: { isPremium: true } });
    }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  // Set httpOnly cookie so client can't read it via JS (more secure)
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
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
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Devuelve info del usuario autenticado. Soporta token en cookie 'token' o header Authorization
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization ? req.headers.authorization.replace(/^Bearer\s+/i, '') : null);
    if (!token) return res.status(401).json({ error: 'No autorizado' });
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    // return minimal safe info
    res.json({ id: user.id, email: user.email, fullName: user.fullName, accountType: user.accountType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
