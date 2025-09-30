// Verificar usuarios existentes y probar sistema dual
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkExistingData() {
  try {
    console.log('🔍 Verificando datos existentes...\n');

    // 1. Verificar usuarios
    const users = await prisma.user.findMany({
      select: { id: true, email: true, fullName: true, accountType: true }
    });
    console.log('👥 Usuarios encontrados:');
    users.forEach(user => {
      console.log(`   ID: ${user.id}, Email: ${user.email}, Nombre: ${user.fullName}, Tipo: ${user.accountType}`);
    });

    // 2. Verificar tutores
    const tutors = await prisma.tutor.findMany({
      select: { id: true, name: true, email: true, phone: true }
    });
    console.log('\n👤 Tutores encontrados:');
    tutors.forEach(tutor => {
      console.log(`   ID: ${tutor.id}, Nombre: ${tutor.name}, Email: ${tutor.email}, Teléfono: ${tutor.phone}`);
    });

    // 3. Verificar mascotas
    const pets = await prisma.pet.findMany({
      select: { id: true, name: true, type: true, tutorId: true }
    });
    console.log('\n🐾 Mascotas encontradas:');
    pets.forEach(pet => {
      console.log(`   ID: ${pet.id}, Nombre: ${pet.name}, Tipo: ${pet.type}, Tutor ID: ${pet.tutorId}`);
    });

    // 4. Verificar citas existentes
    const appointments = await prisma.appointment.findMany({
      select: { 
        id: true, 
        date: true, 
        reason: true, 
        userId: true, 
        tutorId: true, 
        petId: true,
        reminder24hSent: true,
        reminder1hSent: true
      }
    });
    console.log('\n📅 Citas encontradas:');
    appointments.forEach(apt => {
      console.log(`   ID: ${apt.id}, Fecha: ${apt.date.toLocaleString('es-CL')}, Motivo: ${apt.reason}`);
      console.log(`     User: ${apt.userId}, Tutor: ${apt.tutorId}, Pet: ${apt.petId}`);
      console.log(`     Recordatorios - 24h: ${apt.reminder24hSent}, 1h: ${apt.reminder1hSent}`);
    });

    return { users, tutors, pets, appointments };

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingData();