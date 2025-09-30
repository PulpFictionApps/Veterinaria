// Script para eliminar usuarios profesionales CONSERVANDO historial médico y recetas
// Solo elimina: usuarios, citas >7 días, disponibilidad pasada
// CONSERVA: registros médicos, recetas médicas, mascotas

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupProfessionalsConservingHistory() {
  console.log('🧹 LIMPIEZA CONSERVADORA DE USUARIOS PROFESIONALES');
  console.log('💊 CONSERVA: Historial médico y recetas médicas de por vida');
  console.log('🗑️  ELIMINA: Solo datos operacionales (citas antiguas, disponibilidad pasada)');
  
  // Lista de emails de usuarios a limpiar (si necesario)
  const usersToCleanup = [
    // Agregar emails aquí si se necesita limpiar usuarios específicos
    // 'usuario@ejemplo.com'
  ];

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    if (usersToCleanup.length > 0) {
      console.log(`\n📋 Usuarios específicos a limpiar: ${usersToCleanup.length}`);
      
      for (const email of usersToCleanup) {
        console.log(`\n🔍 Procesando usuario: ${email}`);
        
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            appointments: true,
            availability: true,
            consultationTypes: true,
            tutors: {
              include: {
                pets: {
                  include: {
                    medicalRecords: true,
                    prescriptions: true
                  }
                }
              }
            }
          }
        });

        if (!user) {
          console.log(`   ❌ Usuario no encontrado`);
          continue;
        }

        console.log(`   📊 Datos del usuario:`);
        console.log(`      - Citas: ${user.appointments.length}`);
        console.log(`      - Disponibilidad: ${user.availability.length}`);
        console.log(`      - Tipos consulta: ${user.consultationTypes.length}`);
        console.log(`      - Tutores: ${user.tutors.length}`);
        
        const totalPets = user.tutors.reduce((sum, tutor) => sum + tutor.pets.length, 0);
        const totalMedRecords = user.tutors.reduce((sum, tutor) => 
          sum + tutor.pets.reduce((petSum, pet) => petSum + pet.medicalRecords.length, 0), 0);
        const totalPrescriptions = user.tutors.reduce((sum, tutor) => 
          sum + tutor.pets.reduce((petSum, pet) => petSum + pet.prescriptions.length, 0), 0);
        
        console.log(`      - Mascotas: ${totalPets}`);
        console.log(`      - Registros médicos: ${totalMedRecords} (SE CONSERVAN)`);
        console.log(`      - Recetas: ${totalPrescriptions} (SE CONSERVAN)`);

        await prisma.$transaction(async (tx) => {
          // 1. Eliminar solo citas antiguas (>7 días)
          const oldAppointments = await tx.appointment.deleteMany({
            where: { 
              userId: user.id,
              date: { lt: sevenDaysAgo }
            }
          });
          console.log(`      ✅ ${oldAppointments.count} citas antiguas eliminadas (>7 días)`);

          // 2. Eliminar disponibilidad pasada
          const expiredAvailability = await tx.availability.deleteMany({
            where: { 
              userId: user.id,
              end: { lt: now }
            }
          });
          console.log(`      ✅ ${expiredAvailability.count} slots de disponibilidad pasada eliminados`);

          // 3. Mantener tipos de consulta (son configuración del profesional)
          console.log(`      ✅ ${user.consultationTypes.length} tipos de consulta CONSERVADOS`);

          // 4. CONSERVAR TODO EL HISTORIAL MÉDICO Y RECETAS
          console.log(`      💊 ${totalMedRecords} registros médicos CONSERVADOS`);
          console.log(`      💊 ${totalPrescriptions} recetas médicas CONSERVADAS`);
          console.log(`      🐕 ${totalPets} mascotas CONSERVADAS`);
          console.log(`      👥 ${user.tutors.length} tutores CONSERVADOS`);

          // Nota: NO eliminamos el usuario para conservar relaciones
          console.log(`      👤 Usuario CONSERVADO para mantener integridad de datos`);
        });

        console.log(`   ✅ Limpieza conservadora completada para ${email}`);
      }
    }

    // Limpieza general de datos expirados (sin afectar usuarios)
    console.log(`\n🧹 Limpieza general de datos expirados...`);
    
    // Eliminar availability slots expirados de todos los usuarios
    const expiredSlots = await prisma.availability.deleteMany({
      where: {
        end: { lt: now }
      }
    });
    console.log(`🗑️  ${expiredSlots.count} horarios disponibles expirados eliminados`);

    // Eliminar citas antiguas (>7 días) de todos los usuarios
    const oldAppointments = await prisma.appointment.deleteMany({
      where: {
        date: { lt: sevenDaysAgo }
      }
    });
    console.log(`📅 ${oldAppointments.count} citas antiguas eliminadas (>7 días)`);

    // Estadísticas finales
    const stats = {
      users: await prisma.user.count(),
      tutors: await prisma.tutor.count(),
      pets: await prisma.pet.count(),
      medicalRecords: await prisma.medicalRecord.count(),
      prescriptions: await prisma.prescription.count(),
      appointments: await prisma.appointment.count(),
      availability: await prisma.availability.count()
    };

    console.log(`\n📊 ESTADÍSTICAS FINALES:`);
    console.log(`   👤 Usuarios: ${stats.users}`);
    console.log(`   👥 Tutores: ${stats.tutors}`);
    console.log(`   🐕 Mascotas: ${stats.pets}`);
    console.log(`   📋 Registros médicos: ${stats.medicalRecords} (CONSERVADOS)`);
    console.log(`   💊 Recetas médicas: ${stats.prescriptions} (CONSERVADAS)`);
    console.log(`   📅 Citas activas: ${stats.appointments}`);
    console.log(`   ⏰ Disponibilidad futura: ${stats.availability}`);

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {  
  cleanupProfessionalsConservingHistory()
    .then(() => {
      console.log('\n🎉 Limpieza conservadora completada exitosamente');
      console.log('💊 Historial médico y recetas médicas conservados de por vida');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la limpieza conservadora:', error);
      process.exit(1);
    });
}

export { cleanupProfessionalsConservingHistory };