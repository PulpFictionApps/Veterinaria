import { sendAppointmentConfirmation } from './appointment-confirmation-service.js';

async function testAppointmentConfirmation() {
  console.log('🧪 Iniciando test de confirmación automática de citas...\n');

  try {
    // Test con cita existente (ID 1 si existe)
    const appointmentId = 1;
    
    console.log(`📧 Enviando confirmación para cita ID: ${appointmentId}`);
    
    await sendAppointmentConfirmation(appointmentId);
    
    console.log('\n✅ Test completado exitosamente');
    console.log('📧 Se enviaron emails de confirmación al profesional y cliente');
    
  } catch (error) {
    console.error('\n❌ Error en el test:', error.message);
    
    if (error.message.includes('Appointment not found')) {
      console.log('\n💡 No se encontró una cita con ID 1');
      console.log('   Puedes probar creando una cita desde el frontend y verificar los logs del backend');
    }
  }
}

testAppointmentConfirmation();