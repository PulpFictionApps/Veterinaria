import 'dotenv/config';
import { sendAppointmentConfirmation } from './appointment-confirmation-service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEmailSystem() {
  console.log('🧪 PRUEBA DEL SISTEMA DE EMAILS DE CONFIRMACIÓN');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar configuración
    console.log('\n1️⃣ VERIFICANDO CONFIGURACIÓN:');
    console.log(`📧 GMAIL_USER: ${process.env.GMAIL_USER ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`🔑 GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅ Configurado' : '❌ No configurado'}`);
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log('❌ Variables de entorno faltantes. Verifica tu archivo .env');
      process.exit(1);
    }
    
    // 2. Buscar citas recientes
    console.log('\n2️⃣ BUSCANDO CITAS RECIENTES:');
    const recentAppointments = await prisma.appointment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        pet: true,
        tutor: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            clinicName: true,
            professionalTitle: true,
            contactEmail: true,
            contactPhone: true,
            appointmentInstructions: true
          }
        }
      }
    });
    
    console.log(`📋 Encontradas ${recentAppointments.length} citas recientes`);
    
    if (recentAppointments.length === 0) {
      console.log('❌ No hay citas para probar. Crea una cita primero.');
      process.exit(1);
    }
    
    // 3. Mostrar detalles de las citas
    console.log('\n3️⃣ CITAS DISPONIBLES PARA PRUEBA:');
    recentAppointments.forEach((appointment, index) => {
      console.log(`${index + 1}. ID: ${appointment.id} | Cliente: ${appointment.tutor.name} | Email: ${appointment.tutor.email} | Mascota: ${appointment.pet.name}`);
    });
    
    // 4. Probar envío con la cita más reciente
    const testAppointment = recentAppointments[0];
    console.log(`\n4️⃣ PROBANDO ENVÍO CON CITA ID: ${testAppointment.id}`);
    console.log(`📧 Cliente: ${testAppointment.tutor.name} (${testAppointment.tutor.email})`);
    console.log(`🐾 Mascota: ${testAppointment.pet.name}`);
    console.log(`👨‍⚕️ Profesional: ${testAppointment.user.fullName}`);
    
    // 5. Intentar envío
    console.log('\n5️⃣ ENVIANDO EMAIL DE PRUEBA...');
    await sendAppointmentConfirmation(testAppointment.id);
    
    console.log('\n✅ ¡PRUEBA COMPLETADA EXITOSAMENTE!');
    console.log('📧 Si no recibiste el email, verifica:');
    console.log('   - Carpeta de spam/correo no deseado');
    console.log('   - Dirección de email del cliente');
    console.log('   - Configuración de Gmail SMTP');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error('Tipo:', error.name);
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.message.includes('Authentication')) {
      console.log('\n💡 POSIBLES SOLUCIONES:');
      console.log('   - Verifica que la contraseña de aplicación de Gmail sea correcta');
      console.log('   - Asegúrate de que la verificación en 2 pasos esté habilitada');
      console.log('   - Regenera la contraseña de aplicación en tu cuenta de Google');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      console.log('\n💡 PROBLEMA DE CONEXIÓN:');
      console.log('   - Verifica tu conexión a internet');
      console.log('   - El puerto 587 de Gmail puede estar bloqueado');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar prueba
testEmailSystem().catch(console.error);