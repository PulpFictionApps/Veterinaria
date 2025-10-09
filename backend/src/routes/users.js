import express from 'express';
import prisma from '../../lib/prisma.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Obtener perfil de usuario
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    
    // Verificar que el usuario solo pueda acceder a su propio perfil
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        autoEmail: true,
        enableEmailReminders: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        accountType: true,
        isPremium: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar perfil de usuario
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    
    // Verificar que el usuario solo pueda actualizar su propio perfil
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
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
      autoEmail,
      enableEmailReminders,
      primaryColor,
      secondaryColor,
      accentColor
    } = req.body;
    
    // Construir objeto de actualización solo con campos definidos
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
    if (autoEmail !== undefined) updateData.autoEmail = autoEmail;
    if (enableEmailReminders !== undefined) updateData.enableEmailReminders = enableEmailReminders;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;
    if (accentColor !== undefined) updateData.accentColor = accentColor;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
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
        autoEmail: true,
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

// Obtener paleta de colores del profesional (público)
router.get('/public/:id/colors', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        fullName: true,
        clinicName: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({
      primaryColor: user.primaryColor || '#ec4899', // pink-500 por defecto
      secondaryColor: user.secondaryColor || '#f97316', // orange-500 por defecto
      accentColor: user.accentColor || '#3b82f6', // blue-500 por defecto
      professionalName: user.fullName || user.clinicName || 'Profesional'
    });
  } catch (err) {
    console.error('Error getting user colors:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;