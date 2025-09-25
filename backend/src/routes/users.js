import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.js';

const prisma = new PrismaClient();
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
      logoUrl
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

export default router;