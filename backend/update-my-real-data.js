import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateMyRealData() {
  console.log('🔧 ACTUALIZANDO TUS DATOS REALES');
  console.log('='.repeat(40));
  
  try {
    // CAMBIA ESTOS DATOS POR LOS TUYOS REALES:
    const myRealData = {
      fullName: 'Dr. [TU NOMBRE REAL]',                    // ← Cambia aquí
      clinicName: '[NOMBRE DE TU CLÍNICA]',                // ← Cambia aquí
      clinicAddress: '[DIRECCIÓN DE TU CLÍNICA]',          // ← Cambia aquí
      contactEmail: '[TU EMAIL DE CONTACTO]',              // ← Cambia aquí
      contactPhone: '[TU TELÉFONO]',                       // ← Cambia aquí
      appointmentInstructions: `Llegada: [TUS INSTRUCCIONES REALES]
Documentos: [QUÉ DOCUMENTOS NECESITAS]
Otros: [CUALQUIER INFORMACIÓN IMPORTANTE]`                 // ← Cambia aquí
    };
    
    console.log('📝 Datos que se van a actualizar:');
    Object.entries(myRealData).forEach(([key, value]) => {
      console.log(`${key}: "${value}"`);
    });
    
    console.log('\n⚠️  IMPORTANTE: Actualiza los valores en el archivo antes de ejecutar');
    console.log('📁 Archivo: backend/update-my-real-data.js');
    console.log('🚫 NO ejecutes este script sin cambiar los datos primero');
    
    // Descomenta las siguientes líneas DESPUÉS de actualizar tus datos:
    /*
    await prisma.user.update({
      where: { id: 1 }, // Tu ID de usuario
      data: myRealData
    });
    
    console.log('✅ Datos actualizados exitosamente');
    
    // Verificar los cambios
    const updatedUser = await prisma.user.findUnique({
      where: { id: 1 },
      select: {
        fullName: true,
        clinicName: true,
        clinicAddress: true,
        contactEmail: true,
        contactPhone: true,
        appointmentInstructions: true
      }
    });
    
    console.log('\n📋 DATOS ACTUALIZADOS:');
    console.log(updatedUser);
    */
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateMyRealData().catch(console.error);