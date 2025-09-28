import express from 'express';
import prisma from '../../lib/prisma.js';
import { verifyToken } from '../middleware/auth.js';
import mercadopago from 'mercadopago';

const router = express.Router();

// Dev-only: create a mock checkout session
// POST /billing/create-checkout-session { planId }
router.post('/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    const { planId = 'basic' } = req.body;
    // Create a mock session id and return a fake checkout url
    const sessionId = `mock_sess_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const checkoutUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing/checkout?sessionId=${sessionId}&userId=${uid}&plan=${planId}`;
    res.json({ sessionId, checkoutUrl });
  } catch (err) {
    console.error('create-checkout-session error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Dev-only webhook that simulates a successful payment
// POST /billing/webhook-mock { sessionId, userId, plan }
router.post('/webhook-mock', async (req, res) => {
  try {
    const { sessionId, userId, plan = 'basic' } = req.body;
    if (!sessionId || !userId) return res.status(400).json({ error: 'sessionId and userId required' });

    // Mark or create subscription as active and set providerId
    const uid = Number(userId);
    const now = new Date();
    // Para suscripción pagada: 1 mes a partir de ahora
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + 1);

    // Update existing subscription if present, otherwise create
    const existing = await prisma.subscription.findFirst({ where: { userId: uid } });
    let sub;
    if (existing) {
      sub = await prisma.subscription.update({ where: { id: existing.id }, data: { providerId: sessionId, status: 'active', plan, startedAt: now, expiresAt: expires } });
    } else {
      sub = await prisma.subscription.create({ data: { userId: uid, providerId: sessionId, status: 'active', plan, startedAt: now, expiresAt: expires } });
    }

    // Also ensure user.isPremium is true
    await prisma.user.update({ where: { id: uid }, data: { isPremium: true } });

    res.json({ ok: true, subscription: sub });
  } catch (err) {
    console.error('webhook-mock error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Mercado Pago: create preference (sandbox or production depending on ACCESS_TOKEN)
// POST /billing/create-preference { planId }
router.post('/create-preference', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    const { planId = 'basic' } = req.body;

    // Check if MERCADOPAGO_ACCESS_TOKEN is configured
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured in environment');
      return res.status(500).json({ 
        error: 'Mercado Pago no está configurado. Contacta al administrador.' 
      });
    }

    // configure mercadopago with ACCESS_TOKEN from env
    mercadopago.configure({ access_token: process.env.MERCADOPAGO_ACCESS_TOKEN });

    // Plan único: $15.000 CLP mensual
    const planMap = {
      basic: { title: 'Plan Veterinario Premium', price: 15000.00 }
    };
    const plan = planMap[planId] || planMap['basic'];

    const preference = {
      items: [
        {
          title: plan.title,
          unit_price: plan.price,
          quantity: 1
        }
      ],
      payer: {
        // we don't send PII; Mercado Pago allows anonymous payer in sandbox
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/billing?status=success`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/billing?status=failure`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/billing?status=pending`
      },
      auto_return: 'approved',
      external_reference: `${uid}:${planId}`
    };

    const mpRes = await mercadopago.preferences.create(preference);
    const init_point = mpRes.body.init_point;

    res.json({ ok: true, init_point });
  } catch (err) {
    console.error('create-preference error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Mercado Pago webhook receiver
// POST /billing/webhook-mercadopago
router.post('/webhook-mercadopago', express.json(), async (req, res) => {
  try {
    // Validar webhook secret si está configurado
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-signature'];
      // En producción, aquí validarías la firma del webhook
      // Por simplicidad, solo verificamos que el header existe
      if (!signature) {
        console.log('Webhook sin firma válida');
        return res.status(401).json({ error: 'Unauthorized webhook' });
      }
    }

    // Mercado Pago can send different topics; here we handle payment events
    const body = req.body;
    console.log('📬 Webhook recibido:', JSON.stringify(body, null, 2));
    // Example: notification contains { type: 'payment', data: { id: '...' } }
    // For simplicity, if we receive an external_reference in the resource metadata, use it

    // In many Mercado Pago setups you'd call the API to fetch the payment or subscription
    // We'll try to read resource and create/update subscription by external_reference if present
    const topic = body.type || body.topic || null;
    const data = body.data || body.resource || body;

    // Try to fetch external_reference if present
    let external_reference = null;
    if (data && data.id) {
      // fetch payment to read external_reference
      try {
        mercadopago.configure({ access_token: process.env.MERCADOPAGO_ACCESS_TOKEN });
        const payment = await mercadopago.payment.findById(data.id);
        external_reference = payment.body.external_reference;
      } catch (e) {
        console.warn('Could not fetch payment from MP', e?.message || e);
      }
    } else if (body && body['external_reference']) {
      external_reference = body['external_reference'];
    }

    if (!external_reference) {
      // nothing we can map reliably
      console.warn('MP webhook received without external_reference', body);
      return res.json({ ok: true });
    }

    // external_reference was set as `${uid}:${planId}` in preference
    const parts = external_reference.split(':');
    const uid = Number(parts[0]);
    const planId = parts[1] || 'basic';

    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + 1);

    // Update or create subscription
    const existing = await prisma.subscription.findFirst({ where: { userId: uid } });
    let sub;
    if (existing) {
      sub = await prisma.subscription.update({ where: { id: existing.id }, data: { providerId: `mp_${data.id || Date.now()}`, status: 'active', plan: planId, startedAt: now, expiresAt: expires } });
    } else {
      sub = await prisma.subscription.create({ data: { userId: uid, providerId: `mp_${data.id || Date.now()}`, status: 'active', plan: planId, startedAt: now, expiresAt: expires } });
    }

    // Ensure user flagged as premium
    await prisma.user.update({ where: { id: uid }, data: { isPremium: true } });

    res.json({ ok: true, subscription: sub });
  } catch (err) {
    console.error('webhook-mercadopago error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /billing/create-subscription { preapproval_plan_id? }
// Creates a pending subscription entry and returns a Mercado Pago subscription checkout URL
router.post('/create-subscription', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    const { preapproval_plan_id } = req.body;

    // prefer env plan id if not provided
    const planId = preapproval_plan_id || process.env.MERCADOPAGO_PREAPPROVAL_PLAN_ID;
    if (!planId) return res.status(400).json({ error: 'preapproval_plan_id required (or set MERCADOPAGO_PREAPPROVAL_PLAN_ID in env)' });

    // Create a local 'pending' subscription record so we can reconcile when webhook arrives
    const now = new Date();
    const pending = await prisma.subscription.create({ data: { userId: uid, plan: planId, status: 'pending', providerId: null, startedAt: now } });

    // Build the Mercado Pago subscriptions checkout URL (preapproval flow)
    // This URL pattern expects `preapproval_plan_id` in the query string
    // If FRONTEND_URL or BACKEND_BASE_URL need to be used to build a return URL, include them as 'back_url' param
    const checkoutUrl = `https://www.mercadopago.com/subscriptions/checkout?preapproval_plan_id=${planId}&external_reference=${uid}:${pending.id}`;

    res.json({ ok: true, checkoutUrl, subscription: pending });
  } catch (err) {
    console.error('create-subscription error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /billing/activate-free-trial
// Activa automáticamente 7 días de prueba gratuita para el usuario
router.post('/activate-free-trial', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    
    // Verificar si el usuario ya tiene una suscripción
    const existing = await prisma.subscription.findFirst({ where: { userId: uid } });
    if (existing) {
      return res.status(400).json({ error: 'Usuario ya tiene una suscripción activa' });
    }
    
    // Crear suscripción de prueba gratuita por 7 días
    const now = new Date();
    const trialExpires = new Date(now);
    trialExpires.setDate(trialExpires.getDate() + 7); // 7 días de prueba
    
    const subscription = await prisma.subscription.create({
      data: {
        userId: uid,
        plan: 'basic',
        status: 'trial',
        providerId: `trial_${Date.now()}`,
        startedAt: now,
        expiresAt: trialExpires
      }
    });
    
    // Marcar usuario como premium durante el periodo de prueba
    await prisma.user.update({ 
      where: { id: uid }, 
      data: { isPremium: true } 
    });
    
    res.json({ ok: true, subscription });
  } catch (err) {
    console.error('activate-free-trial error', err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router;
