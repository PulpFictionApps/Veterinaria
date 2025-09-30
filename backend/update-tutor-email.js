// Actualizar email del tutor
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateTutorEmail() {
  try {
    const updated = await prisma.tutor.update({
      where: { id: 1 },
      data: { email: 'benguriadonosorafael@gmail.com' }
    });
    console.log('✅ Email del tutor actualizado:', updated.email);
    console.log('✅ Nombre del tutor:', updated.name);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTutorEmail();