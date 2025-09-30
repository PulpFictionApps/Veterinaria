// Test del Sistema de Recordatorios con Gmail SMTP
import { processGmailReminders, sendGmailReminder, prisma } from './gmail-reminder-service.js';

console.log('📧 Test de Recordatorios con Gmail SMTP');
console.log('=====================================\n');

async function testGmailReminders() {
  try {
    // 1. Usar datos existentes - Usuario profesional (ID: 1)
    const professional = await prisma.user.findUnique({
      where: { id: 1 },
      select: { id: true, fullName: true, email: true, clinicName: true }
    });

    if (!professional) {
      console.log('❌ No se encontró usuario profesional');
      return;
    }
    console.log(`✅ Profesional: ${professional.fullName} (${professional.email})`);

    // 2. Usar datos existentes - Tutor/cliente (ID: 1)
    const tutor = await prisma.tutor.findUnique({
      where: { id: 1 },
      select: { id: true, name: true, email: true, phone: true }
    });

    if (!tutor) {
      console.log('❌ No se encontró tutor/cliente');
      return;
    }
    console.log(`✅ Cliente: ${tutor.name} (${tutor.email})`);

    // 3. Usar datos existentes - Mascota (ID: 1 - kimura)
    const pet = await prisma.pet.findUnique({
      where: { id: 1 },
      select: { id: true, name: true, type: true }
    });

    if (!pet) {
      console.log('❌ No se encontró mascota');
      return;
    }
    console.log(`✅ Mascota: ${pet.name} (${pet.type})\n`);

    // 4. Crear cita de prueba para MAÑANA (recordatorio 24h)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(16, 0, 0, 0); // Mañana a las 4 PM

    const appointment24h = await prisma.appointment.create({
      data: {
        date: tomorrow,
        status: 'confirmed',
        reason: 'Consulta general - Test Gmail SMTP 24h',
        userId: professional.id,
        tutorId: tutor.id,
        petId: pet.id,
        reminder24hSent: false,
        reminder1hSent: false
      },
      include: {
        pet: true,
        tutor: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            clinicName: true,
            professionalTitle: true
          }
        }
      }
    });

    console.log(`✅ Cita 24h creada para: ${tomorrow.toLocaleString('es-CL')}`);

    // 5. Crear cita de prueba para DENTRO DE 1.5 HORAS (recordatorio 1h)
    const soonAppointment = new Date();
    soonAppointment.setHours(soonAppointment.getHours() + 1.5);
    soonAppointment.setMinutes(0, 0, 0);

    const appointment1h = await prisma.appointment.create({
      data: {
        date: soonAppointment,
        status: 'confirmed',
        reason: 'Vacunación - Test Gmail SMTP 1h',
        userId: professional.id,
        tutorId: tutor.id,
        petId: pet.id,
        reminder24hSent: true, // Ya "enviado" para que no interfiera
        reminder1hSent: false
      },
      include: {
        pet: true,
        tutor: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            clinicName: true,
            professionalTitle: true
          }
        }
      }
    });

    console.log(`✅ Cita 1h creada para: ${soonAppointment.toLocaleString('es-CL')}\n`);

    // 6. Probar envío directo de recordatorio 24h con Gmail
    console.log(`📧 Probando envío GMAIL de recordatorio 24h...`);
    const success24h = await sendGmailReminder(appointment24h, '24h');
    console.log(`Resultado 24h: ${success24h ? '✅ Exitoso' : '❌ Falló'}\n`);

    // 7. Probar envío directo de recordatorio 1h con Gmail
    console.log(`📧 Probando envío GMAIL de recordatorio 1h...`);
    const success1h = await sendGmailReminder(appointment1h, '1h');
    console.log(`Resultado 1h: ${success1h ? '✅ Exitoso' : '❌ Falló'}\n`);

    // 8. Procesar recordatorios automáticamente con Gmail
    console.log(`🔄 Procesando recordatorios automáticos con Gmail...`);
    await processGmailReminders();

    console.log(`\n🎉 ¡Test de Recordatorios GMAIL Completado!`);
    console.log(`\n📬 Deberías recibir emails desde Gmail en:`);
    console.log(`   👨‍⚕️ Profesional: ${professional.email}`);
    console.log(`   👤 Cliente: ${tutor.email}`);
    
    console.log(`\n✨ Ventajas del Sistema Gmail:`);
    console.log(`   ✅ Emails enviados DESDE: benguriadonosorafael@gmail.com`);
    console.log(`   ✅ Sin restricciones de destinatarios`);
    console.log(`   ✅ Sin necesidad de dominio personalizado`);
    console.log(`   ✅ Los clientes pueden responder directamente`);
    console.log(`   ✅ Totalmente GRATIS`);

    // Mostrar IDs para referencia
    console.log(`\n📋 Referencias para limpiar después:`);
    console.log(`   Cita 24h Gmail ID: ${appointment24h.id}`);
    console.log(`   Cita 1h Gmail ID: ${appointment1h.id}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGmailReminders();