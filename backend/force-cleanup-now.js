#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { getChileDate } from './scripts/cleanup-expired-slots.js';

const prisma = new PrismaClient();

async function forceCleanupNow() {
  console.log('🧹 FORZANDO limpieza de horarios expirados...');
  
  try {
    const now = getChileDate();
    console.log(`⏰ Hora Chile calculada: ${now.toISOString()}`);

    // Calcular el último corte de 15 minutos
    const minutes = now.getMinutes();
    const quarter = Math.floor(minutes / 15) * 15;
    const lastQuarter = new Date(now);
    lastQuarter.setMinutes(quarter);
    lastQuarter.setSeconds(0);
    lastQuarter.setMilliseconds(0);

    console.log(`⏱️ Último corte de 15 minutos: ${lastQuarter.toISOString()}`);

    // Tolerancia para desfases
    const cutoff = new Date(lastQuarter.getTime() + 999);
    console.log(`🔧 Cutoff con tolerancia: ${cutoff.toISOString()}`);

    // Ver qué slots coinciden
    const matching = await prisma.availability.findMany({
      where: { end: { lte: cutoff } },
      orderBy: { end: 'asc' }
    });

    console.log(`🔎 Slots que coinciden con end <= ${cutoff.toISOString()}: ${matching.length}`);
    
    if (matching.length > 0) {
      console.log('Slots a eliminar:');
      matching.forEach((slot, i) => {
        const startDate = new Date(slot.start);
        const endDate = new Date(slot.end);
        console.log(`  ${i+1}. ID ${slot.id}: ${startDate.toISOString()} -> ${endDate.toISOString()} (userId=${slot.userId})`);
      });

      // Eliminar uno por uno
      for (const slot of matching) {
        try {
          await prisma.availability.delete({ where: { id: slot.id } });
          console.log(`  ✅ Eliminado slot ID ${slot.id}`);
        } catch (err) {
          console.error(`  ❌ Error eliminando slot ID ${slot.id}:`, err.message);
        }
      }
    }

    console.log(`🗑️ Limpieza completada: ${matching.length} slots eliminados`);

  } catch (error) {
    console.error('❌ Error durante limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceCleanupNow();