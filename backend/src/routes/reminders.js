import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { processReminders, sendEmailReminder } from "../lib/reminderService.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
import prisma from '../../lib/prisma.js';

// POST /reminders/test - Ejecutar recordatorios manualmente (para testing)
router.post('/test', verifyToken, async (req, res) => {
  try {
    console.log('🧪 Ejecutando recordatorios de prueba...');
    await processReminders();
    res.json({ message: 'Recordatorios procesados exitosamente' });
  } catch (error) {
    console.error('Error procesando recordatorios:', error);
    res.status(500).json({ error: 'Error procesando recordatorios' });
  }
});

// POST /reminders/test-single/:appointmentId - Probar recordatorio para una cita específica
router.post('/test-single/:appointmentId', verifyToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { type } = req.body; // '24h' o '1h'

    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(appointmentId) },
      include: {
        tutor: true,
        pet: true,
        user: {
          select: {
            enableEmailReminders: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    if (appointment.userId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para esta cita' });
    }

    const results = {
      email: false
    };

    // Probar Email si está habilitado
    if (appointment.user.enableEmailReminders) {
      results.email = await sendEmailReminder(appointment, type || '24h');
    }

    res.json({
      message: `Recordatorio de prueba enviado para ${appointment.pet.name}`,
      results,
      appointment: {
        id: appointment.id,
        pet: appointment.pet.name,
        tutor: appointment.tutor.name,
        date: appointment.date
      }
    });

  } catch (error) {
    console.error('Error enviando recordatorio de prueba:', error);
    res.status(500).json({ error: 'Error enviando recordatorio de prueba' });
  }
});

// GET /reminders/status - Ver estado de recordatorios para el profesional
router.get('/status', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        enableEmailReminders: true
      }
    });

    // Contar citas próximas que necesitan recordatorios
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

    const [pending24h, pending1h, recent] = await Promise.all([
      // Citas para recordatorio de 24h
      prisma.appointment.count({
        where: {
          userId: req.user.id,
          date: {
            gte: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
            lt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1)
          },
          reminder24hSent: false,
          status: { not: 'cancelled' }
        }
      }),

      // Citas para recordatorio de 1h
      prisma.appointment.count({
        where: {
          userId: req.user.id,
          date: {
            gte: new Date(inOneHour.getTime() - 15 * 60 * 1000),
            lte: new Date(inOneHour.getTime() + 15 * 60 * 1000)
          },
          reminder1hSent: false,
          status: { not: 'cancelled' }
        }
      }),

      // Recordatorios enviados recientemente
      prisma.appointment.findMany({
        where: {
          userId: req.user.id,
          OR: [
            { reminder24hSentAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
            { reminder1hSentAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) } }
          ]
        },
        include: {
          pet: { select: { name: true } },
          tutor: { select: { name: true } }
        },
        orderBy: { date: 'desc' },
        take: 10
      })
    ]);

    res.json({
      configuration: {
        emailEnabled: user.enableEmailReminders
      },
      pending: {
        reminders24h: pending24h,
        reminders1h: pending1h
      },
      recentlySent: recent.map(apt => ({
        id: apt.id,
        pet: apt.pet.name,
        tutor: apt.tutor.name,
        date: apt.date,
        reminder24hSent: apt.reminder24hSent,
        reminder24hSentAt: apt.reminder24hSentAt,
        reminder1hSent: apt.reminder1hSent,
        reminder1hSentAt: apt.reminder1hSentAt
      }))
    });

  } catch (error) {
    console.error('Error obteniendo estado de recordatorios:', error);
    res.status(500).json({ error: 'Error obteniendo estado de recordatorios' });
  }
});

export default router;