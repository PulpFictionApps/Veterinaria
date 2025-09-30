import fetch from 'node-fetch';

async function testPublicAppointmentWithConfirmation() {
  console.log('🧪 Probando creación de cita pública con confirmación automática...\n');

  const API_BASE = 'http://localhost:4000';
  
  // Datos de prueba para la cita
  const appointmentData = {
    clientName: 'Juan Pérez Test',
    clientPhone: '+56987654321',
    clientEmail: 'benguriadonosorafael@gmail.com', // Usamos tu email para la prueba
    petName: 'Firulais Test',
    petType: 'Perro',
    petBreed: 'Labrador',
    petAge: 3,
    professionalId: 1, // Rafael Benguria
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
    notes: 'Cita de prueba para verificar confirmación automática'
  };

  try {
    console.log('📅 Creando cita pública...');
    console.log(`   Cliente: ${appointmentData.clientName}`);
    console.log(`   Email: ${appointmentData.clientEmail}`);
    console.log(`   Mascota: ${appointmentData.petName}`);
    console.log(`   Fecha: ${new Date(appointmentData.date).toLocaleString()}`);
    
    const response = await fetch(`${API_BASE}/appointments/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Cita creada exitosamente!');
      console.log(`   ID de cita: ${result.id}`);
      console.log('\n⏳ Esperando que se envíe la confirmación automática...');
      console.log('   (Revisa los logs del backend para ver el envío de emails)');
      
      // Esperar un poco para que se procese la confirmación
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('\n🎉 Test completado');
      console.log('📧 La confirmación automática debería haberse enviado a:');
      console.log(`   - Profesional: myvetagenda@gmail.com`);
      console.log(`   - Cliente: ${appointmentData.clientEmail}`);
      
    } else {
      console.error('\n❌ Error creando cita:', result);
    }

  } catch (error) {
    console.error('\n❌ Error en el test:', error.message);
  }
}

testPublicAppointmentWithConfirmation();