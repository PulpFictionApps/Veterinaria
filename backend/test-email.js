// Test del servicio de email con Resend
import { sendEmailReminder } from './src/lib/reminderService.js';

// Datos de prueba con tu email real
const testAppointment = {
  tutor: {
    name: 'Rafael Benguria',
    email: 'rafaelalbertobenguria@gmail.com'
  },
  pet: {
    name: 'Mascota de Prueba'
  },
  date: new Date('2025-09-30T15:00:00') // Mañana a las 15:00
};

console.log('🧪 Probando envío de email de recordatorio...');

try {
  const result = await sendEmailReminder(testAppointment, '24h');
  console.log('📧 Resultado del test:', result ? '✅ Éxito' : '❌ Error');
} catch (error) {
  console.error('❌ Error en test:', error.message);
}

process.exit(0);