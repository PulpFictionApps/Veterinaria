// Test del Sistema de Recordatorios DUALES (Profesional + Cliente)
import { processReminders, sendDualEmailReminder, prisma } from './dual-reminder-service.js';

console.log('🏥 Test de Recordatorios DUALES - Profesional + Cliente');
console.log('=====================================================');

async function testDualReminders() {
  try {
    // 1. Usar datos existentes - Usuario profesional (ID: 1)
    const professional = await prisma.user.findUnique({
      where: { id: 1 },
      select: { id: true, fullName: true, email: true }
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
    console.log(`✅ Mascota: ${pet.name} (${pet.type})`);

    // 4. Crear cita de prueba para MAÑANA (recordatorio 24h)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0); // Mañana a las 3 PM

    const appointment24h = await prisma.appointment.create({
      data: {
        date: tomorrow,
        status: 'confirmed',
        reason: 'Consulta general - Test recordatorio dual 24h',
        userId: professional.id,
        tutorId: tutor.id,
        petId: pet.id,
        reminder24hSent: false,
        reminder1hSent: false
      },
      include: {
        pet: true,
        tutor: true,
        user: true
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
        reason: 'Vacunación - Test recordatorio dual 1h',
        userId: professional.id,
        tutorId: tutor.id,
        petId: pet.id,
        reminder24hSent: true, // Ya "enviado" para que no interfiera
        reminder1hSent: false
      },
      include: {
        pet: true,
        tutor: true,
        user: true
      }
    });

    console.log(`✅ Cita 1h creada para: ${soonAppointment.toLocaleString('es-CL')}`);

    // 6. Probar envío directo de recordatorio 24h
    console.log(`\n📧 Probando envío DUAL de recordatorio 24h...`);
    const success24h = await sendDualEmailReminder(appointment24h, '24h');
    console.log(`Resultado 24h: ${success24h ? '✅ Exitoso' : '❌ Falló'}`);

    // 7. Probar envío directo de recordatorio 1h
    console.log(`\n📧 Probando envío DUAL de recordatorio 1h...`);
    const success1h = await sendDualEmailReminder(appointment1h, '1h');
    console.log(`Resultado 1h: ${success1h ? '✅ Exitoso' : '❌ Falló'}`);

    // 8. Procesar recordatorios automáticamente
    console.log(`\n🔄 Procesando recordatorios automáticos...`);
    await processReminders();

    console.log(`\n🎉 ¡Test de Recordatorios DUALES Completado!`);
    console.log(`\n📬 Deberías recibir emails en:`);
    console.log(`   👨‍⚕️ Profesional: ${professional.email}`);
    console.log(`   👤 Cliente: ${tutor.email}`);
    console.log(`\n📧 Tipos de email enviados:`);
    console.log(`   1. Recordatorio 24h para profesional (con detalles del cliente)`);
    console.log(`   2. Recordatorio 24h para cliente (con instrucciones)`);
    console.log(`   3. Recordatorio 1h para profesional (cita próxima)`);
    console.log(`   4. Recordatorio 1h para cliente (cita muy pronto)`);

    // Mostrar IDs para referencia
    console.log(`\n📋 Referencias para limpiar después:`);
    console.log(`   Cita 24h ID: ${appointment24h.id}`);
    console.log(`   Cita 1h ID: ${appointment1h.id}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDualReminders();