import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrescription() {
  try {
    // Buscar usuario existente
    let user = await prisma.user.findFirst();
    console.log('Usuario encontrado:', user?.name || 'Ninguno');

    // Buscar tutor existente 
    let tutor = await prisma.tutor.findFirst();
    console.log('Tutor encontrado:', tutor?.name || 'Ninguno');

    // Buscar mascota existente
    let pet = await prisma.pet.findFirst({ include: { tutor: true } });
    console.log('Mascota encontrada:', pet?.name || 'Ninguna');

    if (!user || !tutor || !pet) {
      console.log('Faltan datos básicos para crear receta');
      return;
    }

    // Intentar crear una receta de prueba
    const prescriptionData = {
      petId: pet.id,
      tutorId: pet.tutorId,
      userId: user.id,
      title: 'Receta de Prueba',
      content: 'Esta es una receta de prueba',
      medication: 'Amoxicilina',
      dosage: '250mg',
      frequency: 'cada 8 horas',
      duration: '7 días',
      instructions: 'Administrar con comida'
    };

    console.log('Creando receta con datos:', prescriptionData);

    const prescription = await prisma.prescription.create({
      data: prescriptionData
    });

    console.log('✓ Receta creada exitosamente:', prescription.id);
    
  } catch (error) {
    console.error('❌ Error al crear receta:', error.message);
    console.error('Detalles del error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrescription();