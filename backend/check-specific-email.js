// Verificar si el email rafaelalbertobenguria@gmail.com existe en la BD
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function checkSpecificEmail() {
  try {
    const email = 'rafaelalbertobenguria@gmail.com';
    console.log(`🔍 Verificando email: ${email}`);
    
    // Buscar en tutors
    const tutor = await prisma.tutor.findFirst({
      where: { email },
      include: { pets: true }
    });
    
    if (tutor) {
      console.log(`✅ ENCONTRADO EN TUTORS:`);
      console.log(`   ID: ${tutor.id}`);
      console.log(`   Nombre: ${tutor.name}`);
      console.log(`   Mascotas: ${tutor.pets.length}`);
    } else {
      console.log(`❌ NO encontrado en tutors`);
    }
    
    // Buscar en users (profesionales)
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (user) {
      console.log(`⚠️  TAMBIÉN ENCONTRADO EN USERS (profesional):`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Nombre: ${user.fullName}`);
      console.log(`   ❌ PROBLEMA: Este email pertenece a un profesional`);
    } else {
      console.log(`✅ NO es email de profesional`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificEmail();