// Test para verificar la creación de disponibilidad sin duplicados
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000';

// Simular datos de prueba
const testUserId = 7; // Ajusta según tu usuario
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsImVtYWlsIjoicmFmYWVsQGFkbWluLmNvbSIsImlhdCI6MTczMzc2NzQ5MCwiZXhwIjoxNzMzODUzODkwfQ.zI3LTKT_-W8YLsVQ_t2RKvfxRWIjYYvWOKYmM3M-c-w'; // Necesitarás un token válido

async function testAvailabilityCreation() {
  console.log('🧪 Probando creación de disponibilidad...\n');
  
  // Crear un horario de prueba para mañana de 9:00 a 10:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  const startTime = `${dateStr}T09:00:00.000Z`;
  const endTime = `${dateStr}T10:00:00.000Z`;
  
  console.log('📅 Creando disponibilidad para:');
  console.log(`   Inicio: ${startTime}`);
  console.log(`   Fin: ${endTime}\n`);
  
  try {
    // Primera llamada - debería crear los slots
    console.log('🔄 Primera llamada (crear slots)...');
    const response1 = await fetch(`${API_BASE}/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        start: startTime,
        end: endTime
      })
    });
    
    const result1 = await response1.json();
    console.log('Resultado 1:', JSON.stringify(result1, null, 2));
    
    // Segunda llamada - debería detectar duplicados
    console.log('\n🔄 Segunda llamada (detectar duplicados)...');
    const response2 = await fetch(`${API_BASE}/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        start: startTime,
        end: endTime
      })
    });
    
    const result2 = await response2.json();
    console.log('Resultado 2:', JSON.stringify(result2, null, 2));
    
    console.log('\n✅ Prueba completada');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testAvailabilityCreation();