// Actualizar email del usuario profesional
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserEmail() {
  try {
    const updated = await prisma.user.update({
      where: { id: 1 },
      data: { email: 'benguriadonosorafael@gmail.com' }
    });
    console.log('✅ Email actualizado:', updated.email);
    console.log('✅ Usuario:', updated.name);
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
  }
}

updateUserEmail();