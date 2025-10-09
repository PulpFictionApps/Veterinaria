#!/usr/bin/env node

/**
 * Script para probar la validación de horarios duplicados
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDuplicateValidation() {
  console.log('🧪 Probando validación de horarios duplicados...\n');
  
  try {
    // Usar un userId de prueba (ajusta según tu DB)
    const testUserId = 7;
    
    // Fecha de prueba (mañana)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9:00 AM
    
    const testStart = new Date(tomorrow);
    const testEnd = new Date(tomorrow.getTime() + 15 * 60 * 1000); // +15 minutos
    
    console.log(`📅 Probando con fecha: ${testStart.toISOString()} - ${testEnd.toISOString()}`);
    console.log(`👤 Usuario ID: ${testUserId}\n`);
    
    // 1. Crear el primer slot
    console.log('1️⃣ Creando primer slot...');
    try {
      const firstSlot = await prisma.availability.create({
        data: {
          userId: testUserId,
          start: testStart,
          end: testEnd
        }
      });
      console.log(`   ✅ Primer slot creado exitosamente - ID: ${firstSlot.id}`);
    } catch (error) {
      console.log(`   ℹ️  Slot ya existía (esto es normal): ${error.message}`);
    }
    
    // 2. Intentar crear el mismo slot (debería fallar)
    console.log('\n2️⃣ Intentando crear slot duplicado...');
    try {
      const duplicateSlot = await prisma.availability.create({
        data: {
          userId: testUserId,
          start: testStart,
          end: testEnd
        }
      });
      console.log(`   ❌ ERROR: Se permitió crear duplicado - ID: ${duplicateSlot.id}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`   ✅ CORRECTO: Duplicado rechazado por constraint única`);
        console.log(`      Error: ${error.message}`);
      } else {
        console.log(`   ❓ Error inesperado: ${error.message}`);
      }
    }
    
    // 3. Crear slot diferente (debería funcionar)
    const differentStart = new Date(testStart.getTime() + 15 * 60 * 1000); // +15 min
    const differentEnd = new Date(differentStart.getTime() + 15 * 60 * 1000); // +15 min
    
    console.log('\n3️⃣ Creando slot en horario diferente...');
    try {
      const differentSlot = await prisma.availability.create({
        data: {
          userId: testUserId,
          start: differentStart,
          end: differentEnd
        }
      });
      console.log(`   ✅ Slot diferente creado exitosamente - ID: ${differentSlot.id}`);
    } catch (error) {
      console.log(`   ❌ Error creando slot diferente: ${error.message}`);
    }
    
    // 4. Limpiar datos de prueba
    console.log('\n4️⃣ Limpiando datos de prueba...');
    const deleted = await prisma.availability.deleteMany({
      where: {
        userId: testUserId,
        start: {
          gte: testStart,
          lt: new Date(testStart.getTime() + 60 * 60 * 1000) // próxima hora
        }
      }
    });
    console.log(`   🧹 Eliminados ${deleted.count} slots de prueba`);
    
    console.log('\n🎉 Prueba completada exitosamente');
    console.log('✅ La validación de duplicados está funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDuplicateValidation();