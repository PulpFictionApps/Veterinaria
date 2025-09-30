import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRecentAppointments() {
  console.log('🔍 VERIFICANDO CITAS RECIENTES PARA DIAGNÓSTICO');
  console.log('='.repeat(50));
  
  try {
    // Buscar las citas más recientes (últimas 10 minutos)
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // Últimos 10 minutos
        }
      },
      include: {
        tutor: true,
        pet: true,
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📋 Encontradas ${recentAppointments.length} citas en los últimos 10 minutos`);
    
    if (recentAppointments.length === 0) {
      console.log('\n⚠️  No hay citas recientes. Verifica que hayas creado una cita recientemente.');
      
      // Mostrar las 3 citas más recientes
      const lastAppointments = await prisma.appointment.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { tutor: true, pet: true }
      });
      
      console.log('\n📅 ÚLTIMAS 3 CITAS EN EL SISTEMA:');
      lastAppointments.forEach(apt => {
        console.log(`- ID: ${apt.id} | ${apt.tutor.name} | ${apt.pet.name} | Creada: ${apt.createdAt.toLocaleString()}`);
      });
    } else {
      console.log('\n📧 CITAS RECIENTES QUE DEBERÍAN HABER ENVIADO EMAIL:');
      recentAppointments.forEach(apt => {
        console.log(`- ID: ${apt.id} | Cliente: ${apt.tutor.name} (${apt.tutor.email}) | Mascota: ${apt.pet.name}`);
        console.log(`  Profesional: ${apt.user.fullName} (${apt.user.email})`);
        console.log(`  Creada: ${apt.createdAt.toLocaleString()}`);
        console.log('  ---');
      });
      
      console.log('\n🎯 DIAGNÓSTICO:');
      console.log('Si estas citas NO enviaron emails automáticamente, hay un problema con:');
      console.log('1. La integración en la ruta POST /appointments');
      console.log('2. La función sendAppointmentConfirmation');
      console.log('3. El transporter de Gmail');
    }
    
    // Verificar configuración del servidor
    console.log('\n🔧 VERIFICACIÓN DEL SISTEMA:');
    console.log(`Gmail User: ${process.env.GMAIL_USER ? '✅' : '❌'}`);
    console.log(`Gmail Password: ${process.env.GMAIL_APP_PASSWORD ? '✅' : '❌'}`);
    
    // Probar manualmente el envío de la cita más reciente
    if (recentAppointments.length > 0) {
      const mostRecent = recentAppointments[0];
      console.log(`\n🧪 ¿Quieres probar manualmente el envío para la cita ID ${mostRecent.id}?`);
      console.log('Ejecuta: node test-email-confirmation.js');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentAppointments().catch(console.error);