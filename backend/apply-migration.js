// Script para aplicar migración manualmente
import prisma from './lib/prisma.js';

async function applyMigration() {
  try {
    console.log('🔧 Aplicando migración de campos de prescripción...');
    
    // Verificar si las columnas ya existen
    try {
      await prisma.$queryRaw`SELECT "prescriptionHeader" FROM "User" LIMIT 1`;
      console.log('✅ Las columnas ya existen, no es necesario aplicar migración');
      return;
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('📋 Las columnas no existen, aplicando migración...');
      } else {
        throw error;
      }
    }
    
    // Aplicar la migración
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN "prescriptionHeader" TEXT,
      ADD COLUMN "prescriptionFooter" TEXT
    `;
    
    console.log('✅ Migración aplicada correctamente');
    
    // Verificar que funcione
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        prescriptionHeader: true,
        prescriptionFooter: true
      }
    });
    
    console.log('✅ Verificación exitosa:', {
      id: user.id,
      email: user.email,
      prescriptionHeader: user.prescriptionHeader || 'null',
      prescriptionFooter: user.prescriptionFooter || 'null'
    });
    
  } catch (error) {
    console.error('❌ Error aplicando migración:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('✅ Las columnas ya existían, migración no necesaria');
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();