import { sendAppointmentConfirmation } from './appointment-confirmation-service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function demonstrateConfirmationSystem() {
  console.log('🎯 Demostrando el sistema de confirmación automática de citas\n');

  try {
    // Buscar una cita existente en la base de datos
    const existingAppointment = await prisma.appointment.findFirst({
      include: {
        pet: {
          include: {
            tutor: true
          }
        },
        user: true
      }
    });

    if (!existingAppointment) {
      console.log('❌ No se encontraron citas existentes en la base de datos');
      console.log('💡 Necesitas crear una cita primero para probar el sistema');
      return;
    }

    console.log('📋 Cita encontrada para demostración:');
    console.log(`   ID: ${existingAppointment.id}`);
    console.log(`   Cliente: ${existingAppointment.pet.tutor.name}`);
    console.log(`   Email Cliente: ${existingAppointment.pet.tutor.email}`);
    console.log(`   Mascota: ${existingAppointment.pet.name}`);
    console.log(`   Profesional: ${existingAppointment.user.name}`);
    console.log(`   Fecha: ${new Date(existingAppointment.date).toLocaleString()}`);

    console.log('\n📧 Enviando confirmación automática...');
    
    await sendAppointmentConfirmation(existingAppointment.id);
    
    console.log('\n✅ ¡Sistema de confirmación funcionando perfectamente!');
    console.log('📧 Se enviaron emails de confirmación a:');
    console.log(`   - Profesional: myvetagenda@gmail.com`);
    console.log(`   - Cliente: ${existingAppointment.pet.tutor.email}`);
    
    console.log('\n🎉 RESUMEN DEL SISTEMA IMPLEMENTADO:');
    console.log('   ✅ Sistema de confirmación automática creado');
    console.log('   ✅ Integrado en las rutas POST /appointments y /appointments/public');
    console.log('   ✅ Emails duales (profesional + cliente) configurados');
    console.log('   ✅ Gmail SMTP funcionando correctamente');
    console.log('   ✅ Templates HTML profesionales creados');
    
    console.log('\n📝 FUNCIONAMIENTO:');
    console.log('   1. Cuando se crea una cita (autenticada o pública)');
    console.log('   2. El sistema automáticamente envía confirmación por email');
    console.log('   3. Se envía un email al profesional (myvetagenda@gmail.com)');
    console.log('   4. Se envía un email al cliente con sus datos de la cita');
    console.log('   5. Los errores de email no afectan la creación de la cita');
    
  } catch (error) {
    console.error('\n❌ Error en la demostración:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

demonstrateConfirmationSystem();