// Test manual del sistema de emails
import { sendAppointmentConfirmation } from './appointment-confirmation-service.js';

async function testManualEmail() {
  console.log('🧪 TESTING MANUAL DE ENVÍO DE EMAILS');
  console.log('='.repeat(50));
  
  // Probar con la cita más reciente (ID 21)
  console.log('📧 Enviando confirmación manual para cita ID: 21');
  
  try {
    const result = await sendAppointmentConfirmation(21);
    if (result) {
      console.log('✅ ¡Emails enviados exitosamente!');
    } else {
      console.log('❌ Error enviando emails');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testManualEmail();