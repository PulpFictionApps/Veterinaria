import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000';

async function testPublicBooking() {
  console.log('🧪 Testing public booking system...\n');

  const userId = 13; // Use the actual user ID from database

  // Test 1: Check if availability endpoint exists
  try {
    console.log(`1. Testing availability endpoint for user ${userId}...`);
    const availRes = await fetch(`${API_BASE}/availability/public/${userId}`);
    if (!availRes.ok) {
      console.log('❌ Availability endpoint failed:', await availRes.text());
      return;
    }
    const slots = await availRes.json();
    console.log(`✅ Found ${slots.length} available slots`);
    
    if (slots.length === 0) {
      console.log('⚠️ No available slots found. Make sure professional has availability set.');
      return;
    }

    // Test 2: Try creating a public appointment
    console.log('\n2. Testing public appointment creation...');
    const testBooking = {
      professionalId: userId,
      slotId: slots[0].id,
      tutorName: 'Cliente Prueba Público',
      tutorEmail: 'cliente.publico@test.com',
      tutorPhone: '+56912345678',
      petName: 'Mascota Prueba Pública',
      petType: 'Perro',
      reason: 'Consulta de prueba desde reserva pública',
      consultationTypeId: 1
    };

    const bookRes = await fetch(`${API_BASE}/appointments/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testBooking)
    });

    if (!bookRes.ok) {
      const errorText = await bookRes.text();
      console.log('❌ Public booking failed:', errorText);
      return;
    }

    const appointment = await bookRes.json();
    console.log('✅ Public appointment created successfully:', {
      id: appointment.id,
      date: appointment.date,
      tutor: appointment.tutor?.name,
      pet: appointment.pet?.name,
      professionalId: appointment.userId
    });

    console.log('\n🎉 Public booking system is working correctly!');
    console.log(`🔗 Test the public form at: http://localhost:3001/book/${userId}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPublicBooking();