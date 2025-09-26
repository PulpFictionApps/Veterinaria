import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import prisma from '../../lib/prisma.js';

const router = express.Router();

// ===========================
// PROFILE MANAGEMENT
// ===========================

// GET /profile - Get user profile (combines /users/:id functionality)
router.get('/', verifyToken, async (req, res) => {
  const uid = Number(req.user.id);
  let retries = 3;
  
  console.log(`[${new Date().toISOString()}] [info] Getting profile for user ${uid}`);
  
  while (retries > 0) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: uid },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          clinicName: true,
          professionalRut: true,
          professionalTitle: true,
          clinicAddress: true,
          professionalPhone: true,
          licenseNumber: true,
          signatureUrl: true,
          logoUrl: true,
          whatsappNumber: true,
          autoEmail: true,
          enableWhatsappReminders: true,
          enableEmailReminders: true,
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          // prescriptionHeader: true,  // Temporarily disabled until migration
          // prescriptionFooter: true,  // Temporarily disabled until migration
          accountType: true,
          isPremium: true,
          createdAt: true
        }
      });
      
      if (!user) {
        console.log(`[${new Date().toISOString()}] [warn] User ${uid} not found`);
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      console.log(`[${new Date().toISOString()}] [info] Profile retrieved successfully for user ${uid}`);
      return res.json(user);
    } catch (err) {
      retries--;
      console.error(`[${new Date().toISOString()}] [error] Error fetching user profile (retries left: ${retries}):`, err.message);
      
      // Detectar diferentes tipos de errores
      const isConnectionError = err.code === 'P1001' || 
                               err.message.includes("Can't reach database server") ||
                               err.message.includes("connection");
                               
      const isAuthError = err.message.includes("Authentication failed") ||
                         err.message.includes("database credentials") ||
                         err.message.includes("not valid");
      
      // Si es error de autenticación, no reintentar
      if (isAuthError) {
        console.error(`[${new Date().toISOString()}] [error] Database authentication failed. Check credentials.`);
        return res.status(503).json({ 
          error: 'Error de configuración de base de datos. Por favor contacta al administrador.',
          code: 'DB_AUTH_ERROR'
        });
      }
      
      // Si es error de conexión y aún tenemos reintentos
      if (retries > 0 && isConnectionError) {
        console.log(`[${new Date().toISOString()}] [info] Retrying database connection in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // Si no hay más reintentos o es otro tipo de error
      console.error(`[${new Date().toISOString()}] [error] Final database error:`, err.message);
      return res.status(500).json({ 
        error: 'Error interno del servidor. Base de datos no disponible.',
        code: 'DB_CONNECTION_ERROR'
      });
    }
  }
});

// PATCH /profile - Update user profile (combines /users/:id functionality)
router.patch('/', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    
    const {
      fullName,
      phone,
      clinicName,
      professionalRut,
      professionalTitle,
      clinicAddress,
      professionalPhone,
      licenseNumber,
      signatureUrl,
      logoUrl,
      whatsappNumber,
      autoEmail,
      enableWhatsappReminders,
      enableEmailReminders,
      primaryColor,
      secondaryColor,
      accentColor,
      // prescriptionHeader,  // Temporarily disabled until migration
      // prescriptionFooter   // Temporarily disabled until migration
    } = req.body;
    
    // Build update object with only defined fields
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (clinicName !== undefined) updateData.clinicName = clinicName;
    if (professionalRut !== undefined) updateData.professionalRut = professionalRut;
    if (professionalTitle !== undefined) updateData.professionalTitle = professionalTitle;
    if (clinicAddress !== undefined) updateData.clinicAddress = clinicAddress;
    if (professionalPhone !== undefined) updateData.professionalPhone = professionalPhone;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (signatureUrl !== undefined) updateData.signatureUrl = signatureUrl;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
    if (autoEmail !== undefined) updateData.autoEmail = autoEmail;
    if (enableWhatsappReminders !== undefined) updateData.enableWhatsappReminders = enableWhatsappReminders;
    if (enableEmailReminders !== undefined) updateData.enableEmailReminders = enableEmailReminders;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;
    if (accentColor !== undefined) updateData.accentColor = accentColor;
    // if (prescriptionHeader !== undefined) updateData.prescriptionHeader = prescriptionHeader;  // Temporarily disabled
    // if (prescriptionFooter !== undefined) updateData.prescriptionFooter = prescriptionFooter;  // Temporarily disabled
    
    const updatedUser = await prisma.user.update({
      where: { id: uid },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        clinicName: true,
        professionalRut: true,
        professionalTitle: true,
        clinicAddress: true,
        professionalPhone: true,
        licenseNumber: true,
        signatureUrl: true,
        logoUrl: true,
        whatsappNumber: true,
        autoEmail: true,
        enableWhatsappReminders: true,
        enableEmailReminders: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        accountType: true,
        isPremium: true,
        createdAt: true
      }
    });
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===========================
// ACCOUNT & SUBSCRIPTION MANAGEMENT
// ===========================

// GET /profile/status - Get account status (from /account/status)
router.get('/status', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    const now = new Date();
    const active = await prisma.subscription.findFirst({ 
      where: { 
        userId: uid, 
        status: 'active', 
        OR: [
          { expiresAt: null }, 
          { expiresAt: { gt: now } }
        ] 
      } 
    });
    return res.json({ isPremium: !!active });
  } catch (err) {
    console.error('profile/status error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /profile/subscription - Get subscription details (from /account/subscription)
router.get('/subscription', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    const sub = await prisma.subscription.findFirst({ 
      where: { userId: uid }, 
      orderBy: { createdAt: 'desc' } 
    });
    if (!sub) return res.json({ subscription: null });
    res.json({ subscription: sub });
  } catch (err) {
    console.error('profile/subscription error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /profile/activate-premium - Activate premium subscription (from /account/activate-premium)
router.post('/activate-premium', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    // Dev helper: create an active subscription for this user
    const sub = await prisma.subscription.create({ 
      data: { 
        userId: uid, 
        plan: 'dev', 
        status: 'active' 
      } 
    });
    // keep isPremium for compatibility
    await prisma.user.update({ 
      where: { id: uid }, 
      data: { isPremium: true } 
    });
    res.json({ ok: true, isPremium: true, subscription: sub });
  } catch (err) {
    console.error('activate-premium error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// ===========================
// PROFESSIONALS MANAGEMENT (Premium feature)
// ===========================

// GET /profile/professionals - List professionals for the user (from /account/professionals)
router.get('/professionals', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    const now = new Date();
    const active = await prisma.subscription.findFirst({ 
      where: { 
        userId: uid, 
        status: 'active', 
        OR: [
          { expiresAt: null }, 
          { expiresAt: { gt: now } }
        ] 
      } 
    });
    if (!active) return res.status(402).json({ error: 'Subscription required' });
    
    const list = await prisma.professional.findMany({ 
      where: { userId: uid }, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json(list);
  } catch (err) {
    console.error('professionals list error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /profile/professionals - Create professional (from /account/professionals)
router.post('/professionals', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    const now = new Date();
    const active = await prisma.subscription.findFirst({ 
      where: { 
        userId: uid, 
        status: 'active', 
        OR: [
          { expiresAt: null }, 
          { expiresAt: { gt: now } }
        ] 
      } 
    });
    if (!active) return res.status(402).json({ error: 'Subscription required' });
    
    const { name, role, email } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    
    const prof = await prisma.professional.create({ 
      data: { 
        name, 
        role: role || 'Profesional', 
        email: email || '', 
        userId: uid 
      } 
    });
    res.json(prof);
  } catch (err) {
    console.error('professionals create error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// DELETE /profile/professionals/:id - Delete professional (from /account/professionals/:id)
router.delete('/professionals/:id', verifyToken, async (req, res) => {
  try {
    const uid = Number(req.user.id);
    const now = new Date();
    const active = await prisma.subscription.findFirst({ 
      where: { 
        userId: uid, 
        status: 'active', 
        OR: [
          { expiresAt: null }, 
          { expiresAt: { gt: now } }
        ] 
      } 
    });
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