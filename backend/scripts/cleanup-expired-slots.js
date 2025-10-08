#!/usr/bin/env node

// Script para limpiar automáticamente horarios disponibles expirados
// Mantiene las citas (appointments) por 7 días después de la fecha
// Elimina availability slots que hayan pasado inmediatamente

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configurar timezone de Chile
const CHILE_TIMEZONE = 'America/Santiago';

/**
 * Devuelve un objeto Date que representa el instante UTC correspondiente
 * a la hora de muro actual en la zona America/Santiago.
 *
 * En otras palabras: toma el year/month/day/hour/minute/second en la zona
 * America/Santiago para el instante actual y construye la fecha UTC que
 * corresponde a esos componentes. Esto evita el antipatrón
 * `new Date(new Date().toLocaleString(...))` que produce una fecha
 * interpretada en la zona del sistema y provoca desfases.
 */
function getChileDate() {
  const now = new Date();

  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: CHILE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = fmt.formatToParts(now).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);

  // Construir la fecha UTC que corresponde a la hora de muro en Chile
  const utcMillis = Date.UTC(year, month - 1, day, hour, minute, second);
  return new Date(utcMillis);
}

async function cleanupExpiredSlots() {
  console.log('🧹 Iniciando limpieza de horarios expirados...');
  
  try {
    const now = getChileDate();
    console.log(`⏰ Hora actual de Chile: ${now.toISOString()}`);

    // Calcular el último corte de 15 minutos (cuartos)
    const minutes = now.getMinutes();
    const quarter = Math.floor(minutes / 15) * 15; // 0,15,30,45
    const lastQuarter = new Date(now);
    lastQuarter.setMinutes(quarter);
    lastQuarter.setSeconds(0);
    lastQuarter.setMilliseconds(0);

    console.log(`⏱️ Último corte de 15 minutos: ${lastQuarter.toISOString()}`);

    // 1. Eliminar availability slots cuya 'end' sea menor o igual al último corte
    // (nadie puede reservar un slot que terminó en o antes del último cuarto)
    const expiredSlots = await prisma.availability.deleteMany({
      where: {
        end: {
          lte: lastQuarter
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