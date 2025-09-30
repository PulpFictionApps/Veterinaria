// Test del servicio de email con Resend
import { sendEmailReminder } from './src/lib/reminderService.js';

// Datos de prueba
const testAppointment = {
  tutor: {
    name: 'Juan Pérez',
    email: 'test@example.com'  // Cambia por tu email real para probar
  },
  pet: {
    name: 'Max'
  },
  date: new Date(Date.now() + 24 * 60 * 60 * 1000) // Mañana
};

console.log('🧪 Probando envío de email de recordatorio...');

try {
  const result = await sendEmailReminder(testAppointment, '24h');
  console.log('📧 Resultado del test:', result ? '✅ Éxito' : '❌ Error');
} catch (error) {
  console.error('❌ Error en test:', error.message);
}

process.exit(0);