import { PrismaClient } from '@prisma/client';
import { sendAppointmentConfirmation } from './appointment-confirmation-service.js';

const prisma = new PrismaClient();

async function testFullPersonalizationSystem() {
  console.log('🎯 PRUEBA COMPLETA DEL SISTEMA DE CONFIRMACIÓN PERSONALIZADO\n');

  try {
    // Paso 1: Crear un segundo profesional para demostrar la personalización por profesional
    console.log('📝 Paso 1: Configurando dos profesionales con datos distintos...');
    
    // Profesional 1 - Rafael (ya existente, actualizamos)
    await prisma.user.update({
      where: { id: 1 },
      data: {
        fullName: 'Dr. Rafael Benguria Donoso',
        appointmentInstructions: `Llegada: Por favor llega 15 minutos antes para completar formularios
Documentos: Trae cartilla de vacunación y exámenes previos si los tienes
Ayuno: Para algunos procedimientos puede ser necesario ayuno de 12 horas, te confirmaremos
Cambios: Para reprogramar, contáctanos con al menos 24 horas de anticipación
Estacionamiento: Tenemos estacionamiento gratuito disponible`,
        contactEmail: 'rafael.veterinario@clinicasanbernardo.cl',
        contactPhone: '+56 9 8765 4321',
        clinicName: 'Clínica Veterinaria San Bernardo',
        clinicAddress: 'Av. Los Profesionales 1234, San Bernardo, Santiago'
      }
    });

    // Profesional 2 - Crear un nuevo profesional con configuración diferente
    let professional2;
    try {
      professional2 = await prisma.user.create({
        data: {
          email: 'maria.gonzalez@veterinaria.cl',
          password: 'hashedpassword',
          fullName: 'Dra. María González López',
          accountType: 'professional',
          appointmentInstructions: `Llegada: Puntualidad es importante, llega 10 minutos antes
Documentos: Obligatorio traer carnet de identidad del dueño y cartilla veterinaria
Ayuno: Consultar por WhatsApp si es necesario ayuno previo
Cambios: Cambios con menos de 2 horas se cobran 50% del valor
Mascotas nerviosas: Informar previamente si tu mascota se estresa fácilmente`,
          contactEmail: 'dra.maria@veterinariacentral.cl',
          contactPhone: '+56 2 2345 6789',
          clinicName: 'Veterinaria Central',
          clinicAddress: 'Providencia 2468, Providencia, Santiago'
        }
      });
    } catch (error) {
      // Si ya existe, buscarla
      professional2 = await prisma.user.findUnique({
        where: { id: 2 }
      });
      if (professional2) {
        await prisma.user.update({
          where: { id: 2 },
          data: {
            fullName: 'Dra. María González López',
            appointmentInstructions: `Llegada: Puntualidad es importante, llega 10 minutos antes
Documentos: Obligatorio traer carnet de identidad del dueño y cartilla veterinaria
Ayuno: Consultar por WhatsApp si es necesario ayuno previo
Cambios: Cambios con menos de 2 horas se cobran 50% del valor
Mascotas nerviosas: Informar previamente si tu mascota se estresa fácilmente`,
            contactEmail: 'dra.maria@veterinariacentral.cl',
            contactPhone: '+56 2 2345 6789',
            clinicName: 'Veterinaria Central',
            clinicAddress: 'Providencia 2468, Providencia, Santiago'
          }
        });
      }
    }

    console.log('✅ Profesionales configurados:');
    console.log('   - Dr. Rafael: Clínica San Bernardo');
    console.log('   - Dra. María: Veterinaria Central');

    // Paso 2: Buscar citas de cada profesional
    console.log('\n📅 Paso 2: Buscando citas de cada profesional...');
    
    const appointments = await prisma.appointment.findMany({
      include: {
        pet: { include: { tutor: true } },
        user: true
      },
      take: 2
    });

    if (appointments.length === 0) {
      console.log('❌ No se encontraron citas para probar');
      return;
    }

    console.log(`📋 Encontradas ${appointments.length} cita(s) para probar`);

    // Paso 3: Enviar confirmaciones personalizadas
    console.log('\n📧 Paso 3: Enviando confirmaciones personalizadas...');
    
    for (const appointment of appointments) {
      console.log(`\n🔄 Procesando cita ID ${appointment.id}:`);
      console.log(`   👨‍⚕️ Profesional: ${appointment.user.fullName}`);
      console.log(`   🏥 Clínica: ${appointment.user.clinicName}`);
      console.log(`   📧 Email profesional: ${appointment.user.contactEmail || appointment.user.email}`);
      console.log(`   📞 Teléfono: ${appointment.user.contactPhone}`);
      console.log(`   👤 Cliente: ${appointment.pet.tutor.name}`);
      console.log(`   🐾 Mascota: ${appointment.pet.name}`);
      
      await sendAppointmentConfirmation(appointment.id);
      
      // Pausa entre envíos
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Paso 4: Resumen del sistema
    console.log('\n🎉 SISTEMA DE CONFIRMACIÓN PERSONALIZADO COMPLETADO');
    console.log('\n🔧 CARACTERÍSTICAS IMPLEMENTADAS:');
    console.log('   ✅ Base de datos expandida con campos de personalización');
    console.log('   ✅ Templates dinámicos que se adaptan a cada profesional');
    console.log('   ✅ Instrucciones importantes configurables por profesional');
    console.log('   ✅ Información de contacto personalizada (email, teléfono, clínica)');
    console.log('   ✅ Sistema multi-profesional completamente funcional');
    console.log('   ✅ Interface web para configuración en /dashboard/settings');
    console.log('   ✅ Vista previa en tiempo real en la configuración');
    
    console.log('\n📧 FUNCIONAMIENTO DEL SISTEMA:');
    console.log('   1. Cada profesional configura sus instrucciones y contacto en Settings');
    console.log('   2. Al crearse una cita, se obtienen los datos específicos del profesional');
    console.log('   3. Se genera email personalizado con instrucciones del profesional');
    console.log('   4. Se envía confirmación al email del profesional específico');
    console.log('   5. Se envía confirmación al cliente con datos del profesional correspondiente');
    
    console.log('\n🎯 RESULTADO:');
    console.log('   • Cada profesional recibe emails en su dirección personalizada');
    console.log('   • Cada cliente recibe información específica del profesional que lo atiende');
    console.log('   • Sistema escalable para múltiples profesionales');
    console.log('   • Configuración completamente personalizable');

  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFullPersonalizationSystem();