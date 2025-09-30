// Test con datos reales de la base de datos
import { PrismaClient } from '@prisma/client';
import { sendEmailReminder } from './src/lib/reminderService.js';

const prisma = new PrismaClient();

async function testWithRealData() {
  console.log('🔍 Buscando tus datos en la base de datos...\n');
  
  try {
    // Buscar tu usuario por email
    const user = await prisma.user.findFirst({
      where: { email: 'rafaelalbertobenguria@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ No se encontró tu usuario. ¿Estás registrado con ese email?');
      return;
    }
    
    console.log(`✅ Usuario encontrado: ${user.fullName || user.email}`);
    console.log(`📧 Email notifications: ${user.enableEmailReminders ? 'Habilitadas' : 'Deshabilitadas'}`);
    
    // Buscar clientes/tutores
    const tutors = await prisma.tutor.findMany({
      where: { userId: user.id },
      include: { pets: true }
    });
    
    console.log(`👥 Tutores registrados: ${tutors.length}`);
    
    if (tutors.length === 0) {
      console.log('⚠️  No tienes clientes registrados. Creando datos de prueba...');
      
      // Crear tutor de prueba
      const testTutor = await prisma.tutor.create({
        data: {
          name: 'Cliente de Prueba',
          email: 'rafaelalbertobenguria@gmail.com',
          phone: '+56912345678',
          userId: user.id
        }
      });
      
      // Crear mascota de prueba
      const testPet = await prisma.pet.create({
        data: {
          name: 'Luna',
          type: 'Perro',
          breed: 'Golden Retriever',
          age: 3,
          tutorId: testTutor.id
        }
      });
      
      console.log(`✅ Creado tutor: ${testTutor.name}`);
      console.log(`✅ Creada mascota: ${testPet.name}`);
      
      tutors.push({ ...testTutor, pets: [testPet] });
    }
    
    // Tomar el primer tutor y mascota para la prueba
    const tutor = tutors[0];
    const pet = tutor.pets[0] || { name: 'Mascota Sin Nombre' };
    
    console.log(`\n🧪 Probando email con datos reales:`);
    console.log(`   Tutor: ${tutor.name}`);
    console.log(`   Email: ${tutor.email}`);
    console.log(`   Mascota: ${pet.name}`);
    
    // Crear appointment de prueba
    const testAppointment = {
      tutor: {
        name: tutor.name,
        email: tutor.email
      },
      pet: {
        name: pet.name
      },
      date: new Date('2025-09-30T15:00:00'), // Mañana a las 15:00
      user: {
        enableEmailReminders: user.enableEmailReminders
      }
    };
    
    console.log(`\n📧 Enviando email de recordatorio de 24h...`);
    const result24h = await sendEmailReminder(testAppointment, '24h');
    console.log(`✅ Recordatorio 24h: ${result24h ? 'Enviado exitosamente' : 'Error al enviar'}`);
    
    console.log(`\n⏳ Esperando 3 segundos...\n`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`📧 Enviando email de recordatorio de 1h...`);
    const appointmentIn1h = {
      ...testAppointment,
      date: new Date(Date.now() + 60 * 60 * 1000) // En 1 hora
    };
    const result1h = await sendEmailReminder(appointmentIn1h, '1h');
    console.log(`✅ Recordatorio 1h: ${result1h ? 'Enviado exitosamente' : 'Error al enviar'}`);
    
    console.log(`\n🎉 Test completado!`);
    console.log(`📬 Revisa tu email: rafaelalbertobenguria@gmail.com`);
    console.log(`📂 También revisa la carpeta de spam por si acaso`);
    
  } catch (error) {
    console.error('❌ Error en test:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

console.log('🧪 Test de Emails con Datos Reales');
console.log('==================================\n');

testWithRealData();