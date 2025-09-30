#!/usr/bin/env node

// Script para limpiar automáticamente horarios disponibles expirados
// Mantiene las citas (appointments) por 7 días después de la fecha
// Elimina availability slots que hayan pasado inmediatamente

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configurar timezone de Chile
const CHILE_TIMEZONE = 'America/Santiago';

function getChileTime() {
  const now = new Date();
  
  // Chile está normalmente UTC-3 (horario estándar) o UTC-4 (horario de verano) 
  // Pero dado que muestra 16:40 y debería ser 13:40, necesitamos restar 3 horas más
  // El sistema está mostrando UTC cuando debería mostrar Chile
  const chileOffset = -6; // UTC-6 para corregir la diferencia observada
  
  // Crear nueva fecha ajustando por el offset de Chile
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const chileTime = new Date(utc + (chileOffset * 3600000));
  
  return chileTime;
}

function getChileDate() {
  return getChileTime();
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
    // NOTA: Se mantienen historial médico y recetas de por vida
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const oldAppointments = await prisma.appointment.deleteMany({
      where: {
        date: {
          lt: sevenDaysAgo
        }
      }
    });

    console.log(`📅 Eliminadas ${oldAppointments.count} citas con más de 7 días de antigüedad`);
    console.log(`💊 CONSERVADO: Historial médico y recetas médicas de por vida`);

    // 3. Estadísticas finales
    const remainingSlots = await prisma.availability.count();
    const remainingAppointments = await prisma.appointment.count();
    const totalMedicalRecords = await prisma.medicalRecord.count();
    const totalPrescriptions = await prisma.prescription.count();

    console.log(`✅ Limpieza completada:`);
    console.log(`   - Horarios disponibles restantes: ${remainingSlots}`);
    console.log(`   - Citas restantes: ${remainingAppointments}`);
    console.log(`   - Registros médicos conservados: ${totalMedicalRecords}`);
    console.log(`   - Recetas médicas conservadas: ${totalPrescriptions}`);

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