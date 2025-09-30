import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserHistory() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        clinicName: true,
        clinicAddress: true,
        contactEmail: true,
        contactPhone: true,
        appointmentInstructions: true,
        createdAt: true
      }
    });
    
    console.log('👥 TODOS LOS USUARIOS EN LA BASE DE DATOS:');
    console.log('='.repeat(50));
    
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Nombre: ${user.fullName || 'No configurado'}`);
      console.log(`Clínica: ${user.clinicName || 'No configurado'}`);
      console.log(`Dirección: ${user.clinicAddress || 'No configurado'}`);
      console.log(`Email contacto: ${user.contactEmail || 'No configurado'}`);
      console.log(`Teléfono: ${user.contactPhone || 'No configurado'}`);
      console.log(`Creado: ${user.createdAt}`);
      
      if (user.appointmentInstructions) {
        console.log(`Instrucciones: SÍ configuradas`);
        console.log(`Contenido: "${user.appointmentInstructions.substring(0, 100)}..."`);
      } else {
        console.log(`Instrucciones: Por defecto del schema`);
      }
      console.log('-'.repeat(30));
    });
    
    // Verificar si hay scripts que hayan insertado datos
    console.log('\n🔍 POSIBLES FUENTES DE ESTOS DATOS:');
    console.log('1. Scripts de migración de Prisma');
    console.log('2. Scripts de seed/testing que ejecutaste');
    console.log('3. Datos insertados durante pruebas anteriores');
    console.log('4. Valores por defecto del schema');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserHistory().catch(console.error);