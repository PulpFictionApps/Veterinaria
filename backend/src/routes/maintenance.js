import express from 'express';
import { cleanupExpiredSlots } from '../../scripts/cleanup-expired-slots.js';
import prisma from '../../lib/prisma.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Endpoint para limpieza manual (solo para usuarios autenticados)
router.post('/cleanup-expired', verifyToken, async (req, res) => {
  try {
    await cleanupExpiredSlots();
    res.json({ 
      success: true, 
      message: 'Limpieza de horarios expirados completada exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en limpieza manual:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error durante la limpieza de horarios expirados',
      details: error.message 
    });
  }
});

// Endpoint de salud del sistema
router.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos usando el cliente compartido
    await prisma.$queryRaw`SELECT 1`;

    const stats = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      availableSlots: await prisma.availability.count(),
      totalAppointments: await prisma.appointment.count(),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;