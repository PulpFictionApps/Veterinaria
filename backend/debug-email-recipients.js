// Script para debugging de destinatarios de emails
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function debugEmailRecipients() {
  console.log('🔍 DEBUGGING DE DESTINATARIOS DE EMAILS');
  console.log('='.repeat(50));
  
  try {
    // Buscar las últimas 3 citas creadas
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
            clinicName: true,
            professionalTitle: true
          }
        }
      }
    });

    console.log(`\n📊 Analizando ${recentAppointments.length} citas recientes:\n`);

    recentAppointments.forEach((appointment, index) => {
      const { pet, tutor, user: professional } = appointment;
      
      console.log(`${index + 1}. CITA ID: ${appointment.id}`);
      console.log(`   📅 Fecha: ${new Date(appointment.date).toLocaleString('es-CL')}`);
      console.log(`   🐾 Mascota: ${pet.name}`);
      console.log(`   👤 Cliente: ${tutor.name}`);
      console.log(`   📧 Email Cliente: ${tutor.email}`);
      console.log(`   👨‍⚕️ Profesional: ${professional.fullName}`);
      console.log(`   📧 Email Profesional: ${professional.email}`);
      console.log(`   ⚠️  ¿Emails iguales?: ${tutor.email === professional.email ? 'SÍ ❌' : 'NO ✅'}`);
      console.log('   ' + '-'.repeat(40));
    });

    // Verificar si el email del profesional coincide con el del cliente
    const problemCases = recentAppointments.filter(app => 
      app.tutor.email === app.user.email
    );

    if (problemCases.length > 0) {
      console.log(`\n🚨 PROBLEMA DETECTADO:`);
      console.log(`   ${problemCases.length} cita(s) tienen el mismo email para cliente y profesional`);
      console.log(`   Esto explica por qué ambos emails llegan al mismo destinatario`);
      console.log(`\n💡 SOLUCIONES:`);
      console.log(`   1. El cliente debe usar un email diferente al del profesional`);
      console.log(`   2. O verificar que no haya confusión en el formulario público`);
    } else {
      console.log(`\n✅ No se detectaron problemas de emails duplicados`);
      console.log(`   Los emails del cliente y profesional son diferentes`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugEmailRecipients();