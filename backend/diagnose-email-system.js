import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseEmailIssue() {
  console.log('🔍 DIAGNÓSTICO DEL PROBLEMA DE EMAILS');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar configuración
    console.log('\n1️⃣ CONFIGURACIÓN DE EMAIL:');
    console.log(`GMAIL_USER: ${process.env.GMAIL_USER ? '✅' : '❌'}`);
    console.log(`GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅' : '❌'}`);
    
    // 2. Verificar datos en la base de datos
    console.log('\n2️⃣ DATOS EN LA BASE DE DATOS:');
    const tutorCount = await prisma.tutor.count();
    const petCount = await prisma.pet.count();
    const appointmentCount = await prisma.appointment.count();
    const availabilityCount = await prisma.availability.count();
    
    console.log(`Tutores: ${tutorCount}`);
    console.log(`Mascotas: ${petCount}`);
    console.log(`Citas: ${appointmentCount}`);
    console.log(`Disponibilidad: ${availabilityCount}`);
    
    // 3. Verificar tutores con email
    const tutorsWithEmail = await prisma.tutor.findMany({
      where: { email: { not: null } },
      include: { pets: true },
      take: 5
    });
    
    console.log('\n3️⃣ TUTORES CON EMAIL:');
    tutorsWithEmail.forEach(tutor => {
      console.log(`- ${tutor.name} (${tutor.email}) - ${tutor.pets.length} mascotas`);
    });
    
    // 4. Verificar las últimas citas
    const recentAppointments = await prisma.appointment.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        tutor: true,
        pet: true,
        user: true
      }
    });
    
    console.log('\n4️⃣ ÚLTIMAS CITAS:');
    recentAppointments.forEach(apt => {
      console.log(`- ID: ${apt.id} | ${apt.tutor.name} (${apt.tutor.email}) | ${apt.pet.name} | Profesional: ${apt.user.fullName}`);
      console.log(`  Fecha: ${apt.date} | Creada: ${apt.createdAt}`);
    });
    
    // 5. Verificar disponibilidad futura
    const futureSlots = await prisma.availability.findMany({
      where: { start: { gt: new Date() } },
      take: 3,
      orderBy: { start: 'asc' }
    });
    
    console.log('\n5️⃣ DISPONIBILIDAD FUTURA:');
    futureSlots.forEach(slot => {
      console.log(`- ${slot.start} | Profesional ID: ${slot.userId}`);
    });
    
    // 6. Sugerencias
    console.log('\n6️⃣ DIAGNÓSTICO:');
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log('❌ Variables de entorno de Gmail no configuradas');
    } else {
      console.log('✅ Variables de entorno Gmail configuradas');
    }
    
    if (tutorsWithEmail.length === 0) {
      console.log('❌ No hay tutores con email configurado');
    } else {
      console.log(`✅ ${tutorsWithEmail.length} tutores con email encontrados`);
    }
    
    const tutorsWithPets = tutorsWithEmail.filter(t => t.pets.length > 0);
    if (tutorsWithPets.length === 0) {
      console.log('❌ No hay tutores con mascotas Y email');
    } else {
      console.log(`✅ ${tutorsWithPets.length} tutores con mascotas Y email`);
    }
    
    if (recentAppointments.length === 0) {
      console.log('❌ No hay citas en el sistema');
    } else {
      console.log(`✅ ${recentAppointments.length} citas encontradas`);
    }
    
    // 7. Instrucciones específicas
    console.log('\n7️⃣ PARA PROBAR EL ENVÍO AUTOMÁTICO:');
    
    if (tutorsWithPets.length > 0 && futureSlots.length > 0) {
      const testTutor = tutorsWithPets[0];
      const testPet = testTutor.pets[0];
      const testSlot = futureSlots[0];
      
      console.log('✨ Puedes crear una cita con estos datos:');
      console.log(`   Cliente: ${testTutor.name} (${testTutor.email})`);
      console.log(`   Mascota: ${testPet.name} (ID: ${testPet.id})`);
      console.log(`   Fecha: ${testSlot.start}`);
      console.log(`   Slot ID: ${testSlot.id}`);
      
      console.log('\n📝 Opciones para crear la cita:');
      console.log('   1. Usar el frontend (dashboard) - RECOMENDADO');
      console.log('   2. Usar la API directamente con curl/Postman');
      console.log('   3. Usar el formulario público');
      
    } else {
      console.log('❌ Faltan datos necesarios. Necesitas:');
      if (tutorsWithPets.length === 0) console.log('   - Tutores con mascotas Y email');
      if (futureSlots.length === 0) console.log('   - Disponibilidad futura');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseEmailIssue().catch(console.error);