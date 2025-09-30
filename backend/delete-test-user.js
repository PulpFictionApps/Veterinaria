// Script para eliminar el usuario de testing maria.gonzalez@veterinaria.cl
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function deleteTestUser() {
  console.log('🗑️ ELIMINAR USUARIO DE TEST: maria.gonzalez@veterinaria.cl');
  console.log('='.repeat(50));
  
  try {
    const email = 'maria.gonzalez@veterinaria.cl';
    const userId = 4;
    
    console.log('⚠️  ADVERTENCIA: Esto eliminará permanentemente:');
    console.log('   - Usuario: maria.gonzalez@veterinaria.cl');
    console.log('   - Todos sus datos asociados');
    console.log('');
    console.log('❌ SCRIPT PARADO - Para ejecutar, descomenta las líneas de eliminación');
    
    // DESCOMENTA LAS SIGUIENTES LÍNEAS SOLO SI QUIERES ELIMINAR EL USUARIO
    /*
    const result = await prisma.user.delete({
      where: { id: userId }
    });
    
    console.log('✅ Usuario eliminado exitosamente');
    console.log(`   Email: ${result.email}`);
    console.log(`   Nombre: ${result.fullName}`);
    */
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestUser();