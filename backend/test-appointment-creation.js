import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function testAppointmentCreation() {
  console.log('🧪 PRUEBA DE CREACIÓN DE CITA CON ENVÍO AUTOMÁTICO');
  console.log('='.repeat(60));
  
  try {
    // Buscar datos necesarios
    const professional = await prisma.user.findFirst();
    const tutor = await prisma.tutor.findFirst({
      where: { email: { not: null } },
      include: { pets: true }
    });
    const availableSlot = await prisma.availability.findFirst({
      where: { start: { gt: new Date() } }
    });
    
    if (!professional || !tutor || !tutor.pets[0] || !availableSlot) {
      console.log('❌ No hay datos suficientes para la prueba');
      return;
    }
    
    console.log(`👨‍⚕️ Profesional: ${professional.fullName} (${professional.email})`);
    console.log(`👤 Cliente: ${tutor.name} (${tutor.email})`);
    console.log(`🐾 Mascota: ${tutor.pets[0].name}`);
    console.log(`📅 Slot: ${availableSlot.start}`);
    
    // Crear cita directamente usando la API
    console.log('\n📤 Enviando POST a /appointments...');
    
    const appointmentData = {
      petId: tutor.pets[0].id,
      tutorId: tutor.id,
      date: availableSlot.start.toISOString(),
      reason: 'Prueba de envío automático de emails',
      slotId: availableSlot.id
    };
    
    console.log('📝 Datos de la cita:', appointmentData);
    
    // Hacer la llamada a la API local
    const response = await fetch('http://localhost:4000/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${generateTestToken(professional.id)}`
      },
      body: JSON.stringify(appointmentData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Cita creada exitosamente con ID: ${result.id}`);
      console.log('📧 Revisa los logs del servidor para ver si se enviaron los emails automáticamente');
      console.log(`🔍 Deberías ver mensajes como "[CONFIRMACIÓN] Iniciando envío para cita ID: ${result.id}"`);
    } else {
      const error = await response.text();
      console.log(`❌ Error en la API: ${response.status} - ${error}`);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Generar un token JWT simple para la prueba
function generateTestToken(userId) {
  // Token simplificado para prueba local
  const payload = JSON.stringify({ id: userId, iat: Math.floor(Date.now() / 1000) });
  return Buffer.from(payload).toString('base64');
}

testAppointmentCreation().catch(console.error);