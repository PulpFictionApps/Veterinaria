#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function wipeAvailability() {
  console.log('🧹 Iniciando borrado masivo de availability...');
  try {
    const countBefore = await prisma.availability.count();
    console.log(`📊 Horarios antes: ${countBefore}`);

    const deleted = await prisma.availability.deleteMany({});
    console.log(`🗑️ Eliminados: ${deleted.count}`);

    const countAfter = await prisma.availability.count();
    console.log(`📊 Horarios después: ${countAfter}`);
  } catch (err) {
    console.error('❌ Error borrando availability:', err);
  } finally {
    await prisma.$disconnect();
  }
}

wipeAvailability();