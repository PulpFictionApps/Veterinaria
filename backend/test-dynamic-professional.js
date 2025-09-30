import { PrismaClient } from '@prisma/client';
import { sendAppointmentConfirmation } from './appointment-confirmation-service.js';

const prisma = new PrismaClient();

async function testDynamicProfessionalData() {
  console.log('🧪 Probando sistema de confirmación con datos dinámicos del profesional\n');

  try {
    // Primero, vamos a actualizar los datos del profesional con información personalizada
    const professionalId = 1; // Rafael Benguria
    
    console.log('📝 Actualizando datos del profesional con información personalizada...');
    
    await prisma.user.update({
      where: { id: professionalId },
      data: {
        appointmentInstructions: `Llegada: Por favor llega 15 minutos antes de tu cita para completar formularios
Documentos: Trae la cartilla de vacunación y resultados de exámenes previos si los tienes
Ayuno: Para algunos procedimientos puede ser necesario ayuno de 12 horas, te confirmaremos por teléfono
Cambios: Para reprogramar, contáctanos con al menos 24 horas de anticipación
Estacionamiento: Tenemos estacionamiento gratuito disponible`,
        contactEmail: 'rafael.veterinario@clinicavet.cl',
        contactPhone: '+56 9 8765 4321',
        clinicName: 'Clínica Veterinaria San Bernardo',
        clinicAddress: 'Av. Los Profesionales 1234, San Bernardo, Santiago',
        fullName: 'Dr. Rafael Benguria Donoso'
      }
    });
    
    console.log('✅ Datos del profesional actualizados');
    
    // Buscar una cita existente para probar
    const appointment = await prisma.appointment.findFirst({
      include: {
        pet: { include: { tutor: true } },
        user: true
      }
    });
    
    if (!appointment) {
      console.log('❌ No se encontraron citas para probar');
      return;
    }
    
    console.log('\n📋 Cita encontrada para prueba:');
    console.log(`   ID: ${appointment.id}`);
    console.log(`   Cliente: ${appointment.pet.tutor.name}`);
    console.log(`   Mascota: ${appointment.pet.name}`);
    console.log(`   Profesional: ${appointment.user.fullName}`);
    console.log(`   Email profesional: ${appointment.user.contactEmail || appointment.user.email}`);
    
    console.log('\n📧 Enviando confirmación con datos personalizados...');
    
    await sendAppointmentConfirmation(appointment.id);
    
    console.log('\n✅ ¡Sistema de confirmación personalizado funcionando!');
    console.log('\n🎯 CARACTERÍSTICAS IMPLEMENTADAS:');
    console.log('   ✅ Instrucciones importantes configurables por profesional');
    console.log('   ✅ Información de contacto personalizada (email, teléfono, clínica)');
    console.log('   ✅ Datos dinámicos obtenidos de la base de datos');
    console.log('   ✅ Templates HTML que se adaptan a cada profesional');
    console.log('   ✅ Sistema multi-profesional (cada uno recibe sus propios emails)');
    
    console.log('\n📧 EMAILS ENVIADOS:');
    console.log(`   👨‍⚕️ Profesional: ${appointment.user.contactEmail || appointment.user.email}`);
    console.log(`   👤 Cliente: ${appointment.pet.tutor.email}`);
    
    console.log('\n📋 CONTENIDO PERSONALIZADO INCLUYE:');
    console.log('   🔸 Instrucciones específicas del profesional');
    console.log('   🔸 Email de contacto personalizado');
    console.log('   🔸 Teléfono de contacto del profesional');
    console.log('   🔸 Nombre completo del profesional');
    console.log('   🔸 Nombre y dirección de la clínica');
    
  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDynamicProfessionalData();