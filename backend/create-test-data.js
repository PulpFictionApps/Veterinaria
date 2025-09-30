// Crear datos de prueba para el sistema dual
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🔧 Creando datos de prueba para sistema dual...');

    // 1. Verificar/crear usuario profesional
    let professional = await prisma.user.findFirst({
      where: { 
        OR: [
          { accountType: 'professional' },
          { accountType: 'premium' },
          { accountType: { not: 'client' } }
        ]
      }
    });

    if (!professional) {
      professional = await prisma.user.create({
        data: {
          email: 'benguriadonosorafael@gmail.com',
          fullName: 'Dr. Rafael Benguria',
          accountType: 'professional',
          password: 'temp_password', // Requerido por el esquema
          clinicName: 'Clínica Veterinaria VetCare',
          professionalTitle: 'MÉDICO VETERINARIO',
          enableEmailReminders: true
        }
      });
      console.log('✅ Profesional creado');
    } else {
      // Actualizar email si es necesario
      professional = await prisma.user.update({
        where: { id: professional.id },
        data: { 
          email: 'benguriadonosorafael@gmail.com',
          enableEmailReminders: true
        }
      });
      console.log('✅ Profesional actualizado');
    }

    // 2. Crear/verificar tutor (cliente)
    let tutor = await prisma.tutor.findFirst({
      where: { email: { not: null } }
    });

    if (!tutor) {
      tutor = await prisma.tutor.create({
        data: {
          name: 'María González',
          email: 'benguriadonosorafael@gmail.com', // Mismo email por limitación de Resend gratuito
          phone: '+56912345678'
        }
      });
      console.log('✅ Tutor/cliente creado');
    } else {
      // Actualizar email si es necesario
      tutor = await prisma.tutor.update({
        where: { id: tutor.id },
        data: { 
          email: 'benguriadonosorafael@gmail.com',
          phone: '+56912345678'
        }
      });
      console.log('✅ Tutor/cliente actualizado');
    }

    // 3. Crear/verificar mascota
    let pet = await prisma.pet.findFirst({
      where: { tutorId: tutor.id }
    });

    if (!pet) {
      pet = await prisma.pet.create({
        data: {
          name: 'Luna',
          type: 'Perro',
          breed: 'Golden Retriever',
          age: 3,
          tutorId: tutor.id
        }
      });
      console.log('✅ Mascota creada');
    } else {
      console.log('✅ Mascota existente encontrada');
    }

    console.log('\n📋 Datos de prueba listos:');
    console.log(`👨‍⚕️ Profesional: ${professional.name} (${professional.email})`);
    console.log(`👤 Cliente: ${tutor.name} (${tutor.email})`);
    console.log(`🐾 Mascota: ${pet.name} (${pet.type})`);

    return { professional, tutor, pet };

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();