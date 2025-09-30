// Script para debuggear la creación de citas públicas y clientes
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function debugPublicAppointmentCreation() {
  console.log('🔍 DEBUGGING - CREACIÓN DE CITAS PÚBLICAS');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar las últimas 3 citas creadas
    console.log('\n1. ÚLTIMAS CITAS CREADAS:');
    const recentAppointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        pet: true,
        tutor: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            clinicName: true
          }
        }
      }
    });

    if (recentAppointments.length === 0) {
      console.log('   ❌ No hay citas recientes');
      return;
    }

    recentAppointments.forEach((appointment, index) => {
      const { pet, tutor, user: professional } = appointment;
      
      console.log(`\n   CITA ${index + 1}:`);
      console.log(`   📅 ID: ${appointment.id} - ${new Date(appointment.date).toLocaleString('es-CL')}`);
      console.log(`   🐾 Mascota: ${pet.name} (${pet.type})`);
      console.log(`   👤 Cliente: ${tutor.name}`);
      console.log(`   📧 Email Cliente: ${tutor.email || 'NO DEFINIDO ❌'}`);
      console.log(`   📞 Teléfono Cliente: ${tutor.phone || 'NO DEFINIDO ❌'}`);
      console.log(`   👨‍⚕️ Profesional: ${professional.fullName} (${professional.email})`);
      console.log(`   ⚠️  Email Cliente == Email Profesional: ${(tutor.email === professional.email) ? 'SÍ ❌' : 'NO ✅'}`);
      
      if (!tutor.email) {
        console.log(`   🚨 PROBLEMA: Cliente sin email - no puede recibir confirmaciones`);
      }
      
      console.log('   ' + '-'.repeat(40));
    });

    // 2. Verificar si hay tutores recientes sin email
    console.log('\n2. TUTORES RECIENTES SIN EMAIL:');
    const tutorsWithoutEmail = await prisma.tutor.findMany({
      where: { email: null },
      orderBy: { id: 'desc' },
      take: 5,
      include: {
        user: { select: { fullName: true, email: true } }
      }
    });

    if (tutorsWithoutEmail.length > 0) {
      console.log(`   🚨 ENCONTRADOS ${tutorsWithoutEmail.length} tutores sin email:`);
      tutorsWithoutEmail.forEach(tutor => {
        console.log(`      ID: ${tutor.id} | Nombre: ${tutor.name} | Profesional: ${tutor.user.fullName}`);
      });
    } else {
      console.log('   ✅ Todos los tutores recientes tienen email');
    }

    // 3. Verificar proceso de búsqueda de tutores existentes
    console.log('\n3. TESTING BÚSQUEDA DE TUTORES:');
    const testEmail = 'rafaelalbertobenguria@gmail.com';
    const professionalId = 1; // Asumiendo que existe
    
    console.log(`   Buscando tutor con email: ${testEmail} para profesional ID: ${professionalId}`);
    
    const existingTutor = await prisma.tutor.findFirst({
      where: {
        userId: professionalId,
        OR: [
          { email: testEmail },
          { phone: null } // Para probar que no coincida con teléfono vacío
        ]
      }
    });

    if (existingTutor) {
      console.log(`   ✅ Tutor existente encontrado: ${existingTutor.name} (${existingTutor.email})`);
    } else {
      console.log(`   ❌ No se encontró tutor existente con ese email`);
      console.log(`   💡 Se debería crear un nuevo tutor con ese email`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugPublicAppointmentCreation();