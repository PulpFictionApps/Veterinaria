// ⚠️  SCRIPT DESTRUCTIVO - ELIMINA TODO INCLUYENDO HISTORIAL MÉDICO
// Para conservar historial médico y recetas, usar: cleanup-professionals-conservative.js
// 
// Script para eliminar usuarios profesionales y TODOS sus datos relacionados
// ELIMINA: historial médico, recetas, mascotas, tutores, citas, disponibilidad
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function cleanupProfessionals() {
  console.log('🧹 LIMPIEZA COMPLETA DE USUARIOS PROFESIONALES');
  console.log('='.repeat(60));
  
  const usersToDelete = [
    'maria.gonzalez@veterinaria.cl',
    'benguriadonosorafael@gmail.com'
  ];
  
  try {
    for (const email of usersToDelete) {
      console.log(`\n🔍 Analizando usuario: ${email}`);
      
      // Buscar el usuario
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          tutors: { include: { pets: true, appointments: true } },
          appointments: true,
          availability: true,
          consultationTypes: true,
          prescriptions: true
        }
      });
      
      if (!user) {
        console.log(`   ❌ Usuario ${email} no encontrado`);
        continue;
      }
      
      console.log(`   ✅ Usuario encontrado: ${user.fullName} (ID: ${user.id})`);
      console.log(`   📊 Datos a eliminar:`);
      console.log(`      - Tutores: ${user.tutors.length}`);
      console.log(`      - Mascotas: ${user.tutors.reduce((sum, t) => sum + t.pets.length, 0)}`);
      console.log(`      - Citas: ${user.appointments.length}`);
      console.log(`      - Disponibilidad: ${user.availability.length}`);
      console.log(`      - Tipos consulta: ${user.consultationTypes.length}`);
      console.log(`      - Prescripciones: ${user.prescriptions.length}`);
      
      // Eliminar en orden correcto para evitar errores de foreign key
      await prisma.$transaction(async (tx) => {
        console.log(`   🗑️  Eliminando datos relacionados...`);
        
        // 1. Eliminar prescripciones
        if (user.prescriptions.length > 0) {
          await tx.prescription.deleteMany({
            where: { userId: user.id }
          });
          console.log(`      ✅ ${user.prescriptions.length} prescripciones eliminadas`);
        }
        
        // 2. Eliminar citas
        if (user.appointments.length > 0) {
          await tx.appointment.deleteMany({
            where: { userId: user.id }
          });
          console.log(`      ✅ ${user.appointments.length} citas eliminadas`);
        }
        
        // 3. Eliminar disponibilidad
        if (user.availability.length > 0) {
          await tx.availability.deleteMany({
            where: { userId: user.id }
          });
          console.log(`      ✅ ${user.availability.length} slots de disponibilidad eliminados`);
        }
        
        // 4. Eliminar tipos de consulta
        if (user.consultationTypes.length > 0) {
          await tx.consultationType.deleteMany({
            where: { userId: user.id }
          });
          console.log(`      ✅ ${user.consultationTypes.length} tipos de consulta eliminados`);
        }
        
        // 5. Eliminar registros médicos y mascotas de cada tutor
        for (const tutor of user.tutors) {
          if (tutor.pets.length > 0) {
            // Primero eliminar registros médicos de las mascotas
            for (const pet of tutor.pets) {
              await tx.medicalRecord.deleteMany({
                where: { petId: pet.id }
              });
            }
            
            // Luego eliminar las mascotas
            await tx.pet.deleteMany({
              where: { tutorId: tutor.id }
            });
            console.log(`      ✅ ${tutor.pets.length} mascotas del tutor ${tutor.name} eliminadas (con registros médicos)`);
          }
        }
        
        // 6. Eliminar tutores
        if (user.tutors.length > 0) {
          await tx.tutor.deleteMany({
            where: { userId: user.id }
          });
          console.log(`      ✅ ${user.tutors.length} tutores eliminados`);
        }
        
        // 7. Finalmente eliminar el usuario
        await tx.user.delete({
          where: { id: user.id }
        });
        console.log(`      ✅ Usuario ${user.fullName} eliminado completamente`);
      });
      
      console.log(`   🎉 ¡Limpieza completada para ${email}!`);
    }
    
    console.log(`\n✅ LIMPIEZA COMPLETA EXITOSA`);
    console.log(`   Se eliminaron ${usersToDelete.length} usuarios profesionales y todos sus datos`);
    
    // Verificar usuarios restantes
    console.log(`\n📊 USUARIOS RESTANTES:`);
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        accountType: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (remainingUsers.length > 0) {
      remainingUsers.forEach((u, index) => {
        console.log(`   ${index + 1}. ${u.email} | ${u.fullName || 'Sin nombre'} | ${u.accountType} | ${u.createdAt.toLocaleString('es-CL')}`);
      });
    } else {
      console.log(`   🏜️  No quedan usuarios en la base de datos`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupProfessionals();