// Test completo del sistema de recordatorios
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

async function testEmails() {
  console.log('🧪 Iniciando test completo de emails...\n');
  
  // Test 1: Email de recordatorio 24h
  console.log('📧 Test 1: Recordatorio de 24 horas');
  try {
    const result24h = await sendEmailReminder(testAppointment, '24h');
    console.log('✅ Recordatorio 24h:', result24h ? 'Enviado' : 'Error');
  } catch (error) {
    console.error('❌ Error 24h:', error.message);
  }
  
  console.log('\n⏳ Esperando 2 segundos...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Email de recordatorio 1h
  console.log('📧 Test 2: Recordatorio de 1 hora');
  try {
    const appointmentIn1h = {
      ...testAppointment,
      date: new Date(Date.now() + 60 * 60 * 1000) // En 1 hora
    };
    const result1h = await sendEmailReminder(appointmentIn1h, '1h');
    console.log('✅ Recordatorio 1h:', result1h ? 'Enviado' : 'Error');
  } catch (error) {
    console.error('❌ Error 1h:', error.message);
  }
  
  console.log('\n🎉 Test completado! Revisa tu bandeja de entrada.');
}

testEmails();