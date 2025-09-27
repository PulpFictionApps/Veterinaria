#!/usr/bin/env node

// Script para limpiar automáticamente horarios disponibles expirados
// Mantiene las citas (appointments) por 7 días después de la fecha
// Elimina availability slots que hayan pasado inmediatamente

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configurar timezone de Chile
const CHILE_TIMEZONE = 'America/Santiago';

function getChileTime() {
  return new Date().toLocaleString("en-US", { timeZone: CHILE_TIMEZONE });
}

function getChileDate() {
  const chileTime = getChileTime();
  return new Date(chileTime);
}

async function cleanupExpiredSlots() {
  console.log('🧹 Iniciando limpieza de horarios expirados...');
  
  try {
    const now = getChileDate();
    console.log(`⏰ Hora actual de Chile: ${now.toISOString()}`);

    // 1. Eliminar availability slots que hayan pasado (inmediatamente)
    const expiredSlots = await prisma.availability.deleteMany({
      where: {
        end: {
          lt: now
        }
      }
    });

    console.log(`🗑️  Eliminados ${expiredSlots.count} horarios disponibles expirados`);

    // 2. Eliminar appointments que tengan más de 7 días de antigüedad
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const oldAppointments = await prisma.appointment.deleteMany({
      where: {
        date: {
          lt: sevenDaysAgo
        }
      }
    });

    console.log(`📅 Eliminadas ${oldAppointments.count} citas con más de 7 días de antigüedad`);

    // 3. Estadísticas finales
    const remainingSlots = await prisma.availability.count();
    const remainingAppointments = await prisma.appointment.count();

    console.log(`✅ Limpieza completada:`);
    console.log(`   - Horarios disponibles restantes: ${remainingSlots}`);
    console.log(`   - Citas restantes: ${remainingAppointments}`);

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupExpiredSlots()
    .then(() => {
      console.log('🎉 Limpieza completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la limpieza:', error);
      process.exit(1);
    });
}

export { cleanupExpiredSlots, getChileDate };