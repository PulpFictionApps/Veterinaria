#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugAvailability() {
  console.log('🔍 Diagnóstico de disponibilidad');
  
  try {
    // Hora actual de Chile
    const now = new Date();
    console.log(`⏰ Hora actual UTC: ${now.toISOString()}`);
    
    // Chile timezone
    const chileTime = now.toLocaleString('en-US', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    console.log(`🇨🇱 Hora actual Chile: ${chileTime}`);

    // Contar todos los slots
    const totalSlots = await prisma.availability.count();
    console.log(`📊 Total slots en DB: ${totalSlots}`);
    
    // Obtener algunos ejemplos de slots
    const sampleSlots = await prisma.availability.findMany({
      take: 10,
      orderBy: { start: 'desc' }
    });
    
    console.log(`\n📋 Últimos ${sampleSlots.length} slots creados:`);
    sampleSlots.forEach((slot, i) => {
      const startDate = new Date(slot.start);
      const endDate = new Date(slot.end);
      console.log(`  ${i+1}. ID: ${slot.id}, Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}, UserId: ${slot.userId}`);
    });
    
    // Verificar slots de hoy
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const todaySlots = await prisma.availability.findMany({
      where: {
        start: {
          gte: startOfToday,
          lte: endOfToday
        }
      },
      orderBy: { start: 'asc' }
    });
    
    console.log(`\n📅 Slots de hoy (${startOfToday.toISOString()} - ${endOfToday.toISOString()}): ${todaySlots.length}`);
    
    // Slots que ya pasaron (end < now)
    const expiredSlots = await prisma.availability.findMany({
      where: {
        end: {
          lt: now
        }
      },
      orderBy: { end: 'desc' },
      take: 5
    });
    
    console.log(`\n⏰ Slots expirados (end < now): ${expiredSlots.length} total`);
    if (expiredSlots.length > 0) {
      console.log('Últimos 5 slots expirados:');
      expiredSlots.forEach((slot, i) => {
        const endDate = new Date(slot.end);
        console.log(`  ${i+1}. ID: ${slot.id}, End: ${endDate.toISOString()}, UserId: ${slot.userId}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAvailability();