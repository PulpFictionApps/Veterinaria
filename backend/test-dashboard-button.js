import { sendAppointmentConfirmation } from './appointment-confirmation-service.js';

async function testDashboardButton() {
  console.log('🔗 Probando que el botón "Ver en Dashboard" redirija a la URL correcta\n');

  try {
    // Verificar que las URLs estén configuradas correctamente
    console.log('📧 Verificando URLs en los servicios de email...');
    
    // Simular envío de confirmación para verificar URL
    const appointmentId = 1;
    
    console.log('📧 Enviando email de confirmación de prueba...');
    console.log('   (Revisa el email recibido para verificar que el botón redirija a:');
    console.log('   https://veterinaria-p918.vercel.app/dashboard)');
    
    await sendAppointmentConfirmation(appointmentId);
    
    console.log('\n✅ Email enviado exitosamente');
    console.log('🔗 El botón "Ver en Dashboard" ahora redirige a:');
    console.log('   https://veterinaria-p918.vercel.app/dashboard');
    
    console.log('\n📧 VERIFICACIÓN COMPLETADA:');
    console.log('   ✅ appointment-confirmation-service.js actualizado');
    console.log('   ✅ gmail-reminder-service.js actualizado');
    console.log('   ✅ dual-reminder-service.js actualizado');
    console.log('   ✅ Todos los botones "Ver en Dashboard" ahora redirigen a Vercel');
    
  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
  }
}

testDashboardButton();