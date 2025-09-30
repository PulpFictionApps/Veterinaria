// Test creando cita real para probar recordatorios automáticos
import { PrismaClient } from '@prisma/client';
import { processReminders } from './src/lib/reminderService.js';

const prisma = new PrismaClient();

async function createTestAppointmentAndProcess() {
  console.log('🏥 Creando Cita de Prueba para Recordatorios Automáticos');
  console.log('========================================================\n');
  
  try {
    // 1. Buscar tu usuario
    const user = await prisma.user.findFirst({
      where: { email: 'rafaelalbertobenguria@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log(`✅ Usuario encontrado: ${user.fullName || user.email}`);
    
    // 2. Buscar o crear tutor
    let tutor = await prisma.tutor.findFirst({
      where: { userId: user.id }
    });
    
    if (!tutor) {
      tutor = await prisma.tutor.create({
        data: {
          name: 'Rafael Benguria (Cliente)',
          email: 'rafaelalbertobenguria@gmail.com',
          phone: '+56912345678',
          userId: user.id
        }
      });
      console.log(`✅ Tutor creado: ${tutor.name}`);
    } else {
      console.log(`✅ Tutor encontrado: ${tutor.name}`);
    }
    
    // 3. Buscar o crear mascota
    let pet = await prisma.pet.findFirst({
      where: { tutorId: tutor.id }
    });
    
    if (!pet) {
      pet = await prisma.pet.create({
        data: {
          name: 'Luna',
          type: 'Perro',
          breed: 'Golden Retriever',
          age: 3,
          tutorId: tutor.id
        }
      });
      console.log(`✅ Mascota creada: ${pet.name}`);
    } else {
      console.log(`✅ Mascota encontrada: ${pet.name}`);
    }
    
    // 4. Crear cita para mañana (para test de recordatorio 24h)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0); // Mañana a las 15:00
    
    const appointment24h = await prisma.appointment.create({
      data: {
        date: tomorrow,
        status: 'confirmed',
        reason: 'Consulta de prueba para test de recordatorios 24h',
        userId: user.id,
        tutorId: tutor.id,
        petId: pet.id,
        reminder24hSent: false,
        reminder1hSent: false
      }
    });
    
    console.log(`✅ Cita 24h creada para: ${tomorrow.toLocaleString('es-CL')}`);
    
    // 5. Crear cita para dentro de 1 hora (para test de recordatorio 1h)
    const inOneHour = new Date();
    inOneHour.setHours(inOneHour.getHours() + 1);
    inOneHour.setMinutes(0, 0, 0);
    
    const appointment1h = await prisma.appointment.create({
      data: {
        date: inOneHour,
        status: 'confirmed',
        reason: 'Consulta de prueba para test de recordatorio 1h',
        userId: user.id,
        tutorId: tutor.id,
        petId: pet.id,
        reminder24hSent: true, // Ya "enviado" para que no interfiera
        reminder1hSent: false
      }
    });
    
    console.log(`✅ Cita 1h creada para: ${inOneHour.toLocaleString('es-CL')}`);
    
    // 6. Procesar recordatorios automáticamente
    console.log(`\n📧 Procesando recordatorios automáticos...`);
    await processReminders();
    
    console.log(`\n🎉 ¡Test Completado!`);
    console.log(`📬 Deberías recibir 2 emails en: benguriadonosorafael@gmail.com`);
    console.log(`   1. Recordatorio de 24h para la cita de mañana`);
    console.log(`   2. Recordatorio de 1h para la cita de dentro de 1 hora`);
    console.log(`\n⚠️  Nota: Las citas creadas son reales. Puedes eliminarlas desde el dashboard.`);
    
    // Mostrar IDs para referencia
    console.log(`\n📋 Referencias:`);
    console.log(`   Cita 24h ID: ${appointment24h.id}`);
    console.log(`   Cita 1h ID: ${appointment1h.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAppointmentAndProcess();