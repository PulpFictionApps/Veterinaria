/**
 * PRUEBAS SIMPLES DEL SISTEMA DE HORARIOS - CHILE
 * Solo pruebas, sin inicialización de servidor
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsImVtYWlsIjoicmFmYWVsQGFkbWluLmNvbSIsImlhdCI6MTczMzc2NzQ5MCwiZXhwIjoxNzMzODUzODkwfQ.zI3LTKT_-W8YLsVQ_t2RKvfxRWIjYYvWOKYmM3M-c-w';

async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS SIMPLES DEL SISTEMA DE HORARIOS');
  console.log();

  try {
    // 1. Verificar conectividad básica
    console.log('1️⃣ PRUEBA: Conectividad básica');
    const healthResponse = await fetch(`${BASE_URL}/availability/7`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (healthResponse.ok) {
      console.log('✅ Servidor responde correctamente');
      const availabilityData = await healthResponse.json();
      console.log(`   📊 Slots disponibles actuales: ${availabilityData.length}`);
    } else {
      console.log(`❌ Error de conectividad: ${healthResponse.status}`);
      return;
    }

    console.log();

    // 2. Crear disponibilidad en horario chileno
    console.log('2️⃣ PRUEBA: Crear disponibilidad - 09:00 a 10:00 AM Chile (mañana)');
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Mañana
    
    const startTime = new Date(testDate);
    startTime.setHours(9, 0, 0, 0);
    
    const endTime = new Date(testDate);
    endTime.setHours(10, 0, 0, 0);
    
    console.log(`   📅 Creando slots para: ${testDate.toLocaleDateString('es-CL')}`);
    console.log(`   🕘 Horario: ${startTime.toLocaleTimeString('es-CL')} - ${endTime.toLocaleTimeString('es-CL')}`);
    console.log(`   📤 Enviando: start="${startTime.toISOString()}", end="${endTime.toISOString()}"`);

    const createResponse = await fetch(`${BASE_URL}/availability`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        start: startTime.toISOString(),
        end: endTime.toISOString()
      })
    });

    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log(`✅ Creados ${created.availability?.length || 0} slots correctamente`);
      
      if (created.availability && created.availability.length > 0) {
        const firstSlot = created.availability[0];
        const storedStart = new Date(firstSlot.start);
        const storedEnd = new Date(firstSlot.end);
        
        console.log(`   🎯 Primer slot almacenado:`);
        console.log(`      📊 Base de datos: ${storedStart.toISOString()} - ${storedEnd.toISOString()}`);
        console.log(`      🇨🇱 Hora Chile: ${storedStart.toLocaleString('es-CL', {timeZone: 'America/Santiago'})} - ${storedEnd.toLocaleString('es-CL', {timeZone: 'America/Santiago'})}`);
        
        // Verificar que la hora almacenada corresponde a las 9:00 AM Chile
        const chileHour = storedStart.toLocaleString('es-CL', {
          timeZone: 'America/Santiago',
          hour: '2-digit',
          hour12: false
        });
        
        if (chileHour === '09') {
          console.log('✅ CORRECTO: El slot se almacenó para las 9:00 AM hora Chile');
        } else {
          console.log(`❌ ERROR: El slot se almacenó para las ${chileHour}:00, NO para las 9:00 AM Chile`);
        }
      }
    } else {
      const errorText = await createResponse.text();
      console.log(`❌ Error creando disponibilidad: ${createResponse.status}`);
      console.log(`   📝 Respuesta: ${errorText}`);
    }

    console.log();

    // 3. Verificar disponibilidad pública
    console.log('3️⃣ PRUEBA: Consultar disponibilidad pública');
    const publicResponse = await fetch(`${BASE_URL}/availability/public/7`);
    
    if (publicResponse.ok) {
      const publicSlots = await publicResponse.json();
      console.log(`✅ API pública responde: ${publicSlots.length} slots disponibles`);
      
      if (publicSlots.length > 0) {
        const firstPublicSlot = publicSlots[0];
        console.log(`   🎯 Primer slot público:`);
        console.log(`      📊 Raw: ${firstPublicSlot.start} - ${firstPublicSlot.end}`);
        
        const publicStart = new Date(firstPublicSlot.start);
        const publicChileTime = publicStart.toLocaleString('es-CL', {
          timeZone: 'America/Santiago',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        console.log(`      🇨🇱 Vista usuario: ${publicChileTime}`);
      }
    } else {
      console.log(`❌ Error consultando API pública: ${publicResponse.status}`);
    }

    console.log();
    console.log('🎉 PRUEBAS COMPLETADAS');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar pruebas
runTests();