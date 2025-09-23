import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import prisma from '../../lib/prisma.js';

const router = express.Router();

// GET /account/status -> { isPremium }
router.get('/status', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    const now = new Date();
    const active = await prisma.subscription.findFirst({ where: { userId: uid, status: 'active', OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } });
    return res.json({ isPremium: !!active });
  } catch (err) {
    console.error('account/status error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /account/subscription -> { subscription }
router.get('/subscription', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    const sub = await prisma.subscription.findFirst({ where: { userId: uid }, orderBy: { createdAt: 'desc' } });
    if (!sub) return res.json({ subscription: null });
    res.json({ subscription: sub });
  } catch (err) {
    console.error('account/subscription error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /account/activate-premium -> set isPremium true for the user
router.post('/activate-premium', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    // Dev helper: create an active subscription for this user
    const sub = await prisma.subscription.create({ data: { userId: uid, plan: 'dev', status: 'active' } });
    // keep isPremium for compatibility
    await prisma.user.update({ where: { id: uid }, data: { isPremium: true } });
    res.json({ ok: true, isPremium: true, subscription: sub });
  } catch (err) {
    console.error('activate-premium error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /account/professionals -> list professionals for the user (requires premium)
router.get('/professionals', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
  const now = new Date();
  const active = await prisma.subscription.findFirst({ where: { userId: uid, status: 'active', OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } });
  if (!active) return res.status(402).json({ error: 'Subscription required' });
    const list = await prisma.professional.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' } });
    res.json(list);
  } catch (err) {
    console.error('professionals list error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /account/professionals -> create professional (requires premium)
router.post('/professionals', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
  const now = new Date();
  const active = await prisma.subscription.findFirst({ where: { userId: uid, status: 'active', OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } });
  if (!active) return res.status(402).json({ error: 'Subscription required' });
    const { name, role, email } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const prof = await prisma.professional.create({ data: { name, role: role || 'Profesional', email: email || '', userId: uid } });
    res.json(prof);
  } catch (err) {
    console.error('professionals create error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// DELETE /account/professionals/:id -> delete professional (requires premium)
router.delete('/professionals/:id', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
  const now = new Date();
  const active = await prisma.subscription.findFirst({ where: { userId: uid, status: 'active', OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } });
  if (!active) return res.status(402).json({ error: 'Subscription required' });
    const id = Number(req.params.id);
    await prisma.professional.deleteMany({ where: { id, userId: uid } });
    res.json({ ok: true });
  } catch (err) {
    console.error('professionals delete error', err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
