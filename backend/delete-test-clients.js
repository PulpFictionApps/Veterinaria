// Script para eliminar clientes de prueba específicos y su información relacionada
// CONSERVA: El perfil del profesional y su configuración
// ELIMINA: Solo los clientes especificados y sus datos (mascotas, citas, registros médicos)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTestClients() {
  console.log('🧹 ELIMINANDO CLIENTES DE PRUEBA');
  console.log('👤 CONSERVA: Perfil del profesional');
  console.log('🗑️  ELIMINA: Solo clientes especificados y sus datos relacionados');
  
  // Clientes de prueba a eliminar (basados en la imagen)
  const testClientEmails = [
    'cliente.test@example.com',
    'cliente.test2@example.com'
  ];

  // También buscar por nombres que contengan "Test"
  const testClientNames = [
    'Cliente Test',
    'Cliente Test 2'
  ];

  try {
    console.log('\n🔍 Buscando clientes de prueba...');

    // Buscar tutores por email o nombre que coincidan
    const testTutors = await prisma.tutor.findMany({
      where: {
        OR: [
          { email: { in: testClientEmails } },
          { name: { in: testClientNames } },
          { name: { contains: 'Test', mode: 'insensitive' } },
          { email: { contains: 'test', mode: 'insensitive' } }
        ]
      },
      include: {
        pets: {
          include: {
            medicalRecords: true,
            prescriptions: true,
            appointments: true
          }
        },
        appointments: true
      }
    });

    if (testTutors.length === 0) {
      console.log('✅ No se encontraron clientes de prueba para eliminar');
      return;
    }

    console.log(`📋 Encontrados ${testTutors.length} clientes de prueba:`);
    
    for (const tutor of testTutors) {
      console.log(`   - ${tutor.name} (${tutor.email})`);
      console.log(`     📱 Teléfono: ${tutor.phone || 'N/A'}`);
      console.log(`     🐕 Mascotas: ${tutor.pets.length}`);
      
      const totalMedRecords = tutor.pets.reduce((sum, pet) => sum + pet.medicalRecords.length, 0);
      const totalPrescriptions = tutor.pets.reduce((sum, pet) => sum + pet.prescriptions.length, 0);
      const totalPetAppointments = tutor.pets.reduce((sum, pet) => sum + pet.appointments.length, 0);
      
      console.log(`     📋 Registros médicos: ${totalMedRecords}`);
      console.log(`     💊 Recetas: ${totalPrescriptions}`);
      console.log(`     📅 Citas: ${tutor.appointments.length + totalPetAppointments}`);
    }

    // Confirmar eliminación
    console.log('\n⚠️  ELIMINANDO DATOS...');
    
    let totalDeleted = {
      medicalRecords: 0,
      prescriptions: 0,
      appointments: 0,
      pets: 0,
      tutors: 0
    };

    await prisma.$transaction(async (tx) => {
      for (const tutor of testTutors) {
        console.log(`\n🗑️  Eliminando cliente: ${tutor.name}`);
        
        // Para cada mascota del tutor
        for (const pet of tutor.pets) {
          console.log(`   🐕 Procesando mascota: ${pet.name}`);
          
          // 1. Eliminar registros médicos de la mascota
          if (pet.medicalRecords.length > 0) {
            await tx.medicalRecord.deleteMany({
              where: { petId: pet.id }
            });
            totalDeleted.medicalRecords += pet.medicalRecords.length;
            console.log(`      📋 ${pet.medicalRecords.length} registros médicos eliminados`);
          }
          
          // 2. Eliminar recetas de la mascota
          if (pet.prescriptions.length > 0) {
            await tx.prescription.deleteMany({
              where: { petId: pet.id }
            });
            totalDeleted.prescriptions += pet.prescriptions.length;
            console.log(`      💊 ${pet.prescriptions.length} recetas eliminadas`);
          }
          
          // 3. Eliminar citas de la mascota
          if (pet.appointments.length > 0) {
            await tx.appointment.deleteMany({
              where: { petId: pet.id }
            });
            totalDeleted.appointments += pet.appointments.length;
            console.log(`      📅 ${pet.appointments.length} citas de mascota eliminadas`);
          }
        }
        
        // 4. Eliminar citas directas del tutor (sin mascota)
        if (tutor.appointments.length > 0) {
          await tx.appointment.deleteMany({
            where: { tutorId: tutor.id }
          });
          totalDeleted.appointments += tutor.appointments.length;
          console.log(`   📅 ${tutor.appointments.length} citas del tutor eliminadas`);
        }
        
        // 5. Eliminar todas las mascotas del tutor
        if (tutor.pets.length > 0) {
          await tx.pet.deleteMany({
            where: { tutorId: tutor.id }
          });
          totalDeleted.pets += tutor.pets.length;
          console.log(`   🐕 ${tutor.pets.length} mascotas eliminadas`);
        }
        
        // 6. Finalmente, eliminar el tutor
        await tx.tutor.delete({
          where: { id: tutor.id }
        });
        totalDeleted.tutors += 1;
        console.log(`   👥 Cliente eliminado: ${tutor.name}`);
      }
    });

    // Estadísticas finales
    console.log(`\n✅ ELIMINACIÓN COMPLETADA:`);
    console.log(`   👥 Clientes eliminados: ${totalDeleted.tutors}`);
    console.log(`   🐕 Mascotas eliminadas: ${totalDeleted.pets}`);
    console.log(`   📋 Registros médicos eliminados: ${totalDeleted.medicalRecords}`);
    console.log(`   💊 Recetas eliminadas: ${totalDeleted.prescriptions}`);
    console.log(`   📅 Citas eliminadas: ${totalDeleted.appointments}`);

    // Verificar que el profesional sigue intacto
    const professionalCount = await prisma.user.count({
      where: { accountType: 'professional' }
    });
    
    console.log(`\n👤 PROFESIONALES CONSERVADOS: ${professionalCount}`);
    console.log(`✅ El perfil del profesional permanece intacto`);

    // Estadísticas actuales
    const currentStats = {
      tutors: await prisma.tutor.count(),
      pets: await prisma.pet.count(),
      medicalRecords: await prisma.medicalRecord.count(),
      prescriptions: await prisma.prescription.count(),
      appointments: await prisma.appointment.count()
    };

    console.log(`\n📊 ESTADÍSTICAS ACTUALES:`);
    console.log(`   👥 Clientes restantes: ${currentStats.tutors}`);
    console.log(`   🐕 Mascotas restantes: ${currentStats.pets}`);
    console.log(`   📋 Registros médicos restantes: ${currentStats.medicalRecords}`);
    console.log(`   💊 Recetas restantes: ${currentStats.prescriptions}`);
    console.log(`   📅 Citas restantes: ${currentStats.appointments}`);

  } catch (error) {
    console.error('❌ Error durante la eliminación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {  
  deleteTestClients()
    .then(() => {
      console.log('\n🎉 Eliminación de clientes de prueba completada exitosamente');
      console.log('👤 Perfil del profesional conservado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la eliminación de clientes de prueba:', error);
      process.exit(1);
    });
}

export { deleteTestClients };