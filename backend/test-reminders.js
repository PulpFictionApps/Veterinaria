/**
 * Script de prueba para el sistema de recordatorios automáticos
 * 
 * Uso:
 * node test-reminders.js
 */

import { PrismaClient } from "@prisma/client";
import { processReminders } from "./src/lib/reminderService.js";

const prisma = new PrismaClient();

async function testReminderSystem() {
  console.log('🧪 Iniciando pruebas del sistema de recordatorios...\n');

  try {
    // 1. Verificar configuración de usuarios
    console.log('1️⃣ Verificando configuración de usuarios...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        enableWhatsappReminders: true,
        enableEmailReminders: true,
        whatsappNumber: true
      }
    });

    console.log(`   📊 Total usuarios: ${users.length}`);
    console.log(`   📱 Con WhatsApp habilitado: ${users.filter(u => u.enableWhatsappReminders).length}`);
    console.log(`   📧 Con Email habilitado: ${users.filter(u => u.enableEmailReminders).length}`);
    console.log();

    // 2. Verificar citas próximas
    console.log('2️⃣ Verificando citas próximas...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

    const appointmentsFor24h = await prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
          lt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1)
        },
        reminder24hSent: false,
        status: { not: 'cancelled' }
      },
      include: {
        tutor: { select: { name: true, email: true, phone: true } },
        pet: { select: { name: true } },
        user: { select: { fullName: true, enableWhatsappReminders: true, enableEmailReminders: true } }
      }
    });

    const appointmentsFor1h = await prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(inOneHour.getTime() - 15 * 60 * 1000),
          lte: new Date(inOneHour.getTime() + 15 * 60 * 1000)
        },
        reminder1hSent: false,
        status: { not: 'cancelled' }
      },
      include: {
        tutor: { select: { name: true, email: true, phone: true } },
        pet: { select: { name: true } },
        user: { select: { fullName: true, enableWhatsappReminders: true, enableEmailReminders: true } }
      }
    });

    console.log(`   📅 Citas para recordatorio 24h: ${appointmentsFor24h.length}`);
    appointmentsFor24h.forEach(apt => {
      console.log(`      - ${apt.pet.name} (${apt.tutor.name}) - ${apt.date.toLocaleString('es-CL')}`);
    });

    console.log(`   ⏰ Citas para recordatorio 1h: ${appointmentsFor1h.length}`);
    appointmentsFor1h.forEach(apt => {
      console.log(`      - ${apt.pet.name} (${apt.tutor.name}) - ${apt.date.toLocaleString('es-CL')}`);
    });
    console.log();

    // 3. Verificar variables de entorno
    console.log('3️⃣ Verificando configuración de servicios...');
    console.log(`   📱 Twilio configurado: ${!!process.env.TWILIO_ACCOUNT_SID}`);
    console.log(`   📱 WhatsApp número: ${process.env.TWILIO_WHATSAPP_NUMBER || 'No configurado'}`);
    console.log(`   📧 Email API Key: ${!!process.env.EMAIL_API_KEY}`);
    console.log(`   📧 Email From: ${process.env.EMAIL_FROM || 'No configurado'}`);
    console.log();

    // 4. Simular procesamiento de recordatorios (DRY RUN)
    console.log('4️⃣ Simulando procesamiento de recordatorios...');
    if (appointmentsFor24h.length > 0 || appointmentsFor1h.length > 0) {
      console.log('   ⚠️  MODO SIMULACIÓN - No se enviarán mensajes reales');
      console.log('      Para ejecutar realmente, usa: await processReminders();');
    } else {
      console.log('   ✅ Sin recordatorios pendientes por enviar');
    }
    console.log();

    // 5. Estadísticas de recordatorios enviados recientemente
    console.log('5️⃣ Recordatorios enviados recientemente...');
    const recentReminders = await prisma.appointment.findMany({
      where: {
        OR: [
          { reminder24hSentAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
          { reminder1hSentAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) } }
        ]
      },
      include: {
        tutor: { select: { name: true } },
        pet: { select: { name: true } }
      },
      orderBy: { date: 'desc' },
      take: 5
    });

    console.log(`   📊 Recordatorios enviados últimas 24h: ${recentReminders.length}`);
    recentReminders.forEach(apt => {
      const sent24h = apt.reminder24hSentAt ? `24h: ${apt.reminder24hSentAt.toLocaleString('es-CL')}` : '';
      const sent1h = apt.reminder1hSentAt ? `1h: ${apt.reminder1hSentAt.toLocaleString('es-CL')}` : '';
      console.log(`      - ${apt.pet.name} (${apt.tutor.name}) - ${sent24h} ${sent1h}`);
    });

    console.log('\n✅ Pruebas del sistema de recordatorios completadas');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar las pruebas
testReminderSystem();