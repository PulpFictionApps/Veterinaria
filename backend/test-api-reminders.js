// Test usando endpoints de la API
const API_BASE = 'http://localhost:4000/api';

// Necesitas un token de usuario real para esto
const TEST_TOKEN = 'TU_TOKEN_AQUI'; // Obtener desde login

async function testReminderAPI() {
  console.log('🧪 Testeando API de recordatorios...\n');
  
  try {
    // Test procesamiento manual de recordatorios
    console.log('📧 Ejecutando procesamiento manual de recordatorios...');
    const response = await fetch(`${API_BASE}/reminders/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Procesamiento exitoso:', result);
    } else {
      console.error('❌ Error en API:', response.status, await response.text());
    }
    
    // Test estado de recordatorios
    console.log('\n📊 Obteniendo estado de recordatorios...');
    const statusResponse = await fetch(`${API_BASE}/reminders/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log('✅ Estado de recordatorios:', JSON.stringify(status, null, 2));
    } else {
      console.error('❌ Error obteniendo estado:', statusResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error en test de API:', error.message);
  }
}

console.log('⚠️  Para usar este test:');
console.log('1. Inicia el backend: npm start');
console.log('2. Obtén un token haciendo login en el frontend');
console.log('3. Reemplaza TEST_TOKEN con tu token real');
console.log('4. Ejecuta: node test-api-reminders.js\n');

// testReminderAPI();