import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function createTestAppointment() {
  console.log('🧪 CREANDO CITA DE PRUEBA PARA VERIFICAR ENVÍO AUTOMÁTICO');
  console.log('='.repeat(60));
  
  try {
    // 1. Buscar un tutor existente
    const tutor = await prisma.tutor.findFirst({
      where: { email: { not: null } }
    });
    
    if (!tutor) {
      console.log('❌ No se encontró ningún tutor con email');
      return;
    }
    
    // 2. Buscar una mascota del tutor
    const pet = await prisma.pet.findFirst({
      where: { tutorId: tutor.id }
    });
    
    if (!pet) {
      console.log('❌ No se encontró ninguna mascota para el tutor');
      return;
    }
    
    // 3. Buscar disponibilidad futura
    const futureSlot = await prisma.availability.findFirst({
      where: {
        start: { gt: new Date() }
      },
      orderBy: { start: 'asc' }
    });
    
    if (!futureSlot) {
      console.log('❌ No hay disponibilidad futura');
      return;
    }
    
    console.log(`📋 Datos para la cita:`);
    console.log(`   Cliente: ${tutor.name} (${tutor.email})`);
    console.log(`   Mascota: ${pet.name}`);
    console.log(`   Fecha: ${futureSlot.start}`);
    console.log(`   Profesional ID: ${futureSlot.userId}`);
    
    // 4. Crear la cita usando la API del backend
    const appointmentData = {
      petId: pet.id,
      tutorId: tutor.id,
      date: futureSlot.start.toISOString(),
      reason: 'Cita de prueba para verificar envío automático de emails',
      slotId: futureSlot.id
    };
    
    console.log('\n📤 Enviando solicitud a la API...');
    
    // Simular token JWT para la prueba (en un caso real vendría del login)
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzI3NjU1MjAwfQ.sometoken';
    
    const response = await fetch('http://localhost:4000/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify(appointmentData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Cita creada exitosamente con ID: ${result.id}`);
      console.log(`📧 El email de confirmación debería haberse enviado automáticamente`);
      console.log(`   Revisa la bandeja de entrada de: ${tutor.email}`);
    } else {
      const error = await response.json();
      console.log(`❌ Error creando cita: ${error.error}`);
      
      if (response.status === 401) {
        console.log('\n💡 Error de autenticación. Creando cita directamente en la base de datos...');
        
        // Crear cita directamente si hay problema de token
        const appointment = await prisma.appointment.create({
          data: {
            petId: pet.id,
            tutorId: tutor.id,
            userId: futureSlot.userId,
            date: futureSlot.start,
            reason: 'Cita de prueba para verificar envío automático de emails',
            status: 'scheduled'
          }
        });
        
        // Eliminar el slot de disponibilidad
        await prisma.availability.delete({
          where: { id: futureSlot.id }
        });
        
        console.log(`✅ Cita creada directamente con ID: ${appointment.id}`);
        console.log(`⚠️  NOTA: El envío automático solo funciona cuando se crea a través de la API`);
        
        // Probar envío manual
        const { sendAppointmentConfirmation } = await import('./appointment-confirmation-service.js');
        await sendAppointmentConfirmation(appointment.id);
        console.log(`📧 Email de confirmación enviado manualmente`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAppointment().catch(console.error);