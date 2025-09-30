// Script para investigar el usuario maria.gonzalez@veterinaria.cl
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function investigateUser() {
  console.log('🕵️ INVESTIGANDO USUARIO: maria.gonzalez@veterinaria.cl');
  console.log('='.repeat(60));
  
  try {
    const email = 'maria.gonzalez@veterinaria.cl';
    
    // 1. Buscar en Users (profesionales)
    console.log('\n1. BÚSQUEDA EN USERS (PROFESIONALES):');
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tutors: { take: 5 },
        appointments: { take: 5, orderBy: { createdAt: 'desc' } },
        availability: { take: 5, orderBy: { start: 'desc' } }
      }
    });

    if (user) {
      console.log(`   ✅ ENCONTRADO EN USERS:`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Nombre: ${user.fullName || 'No definido'}`);
      console.log(`      Clínica: ${user.clinicName || 'No definido'}`);
      console.log(`      Tipo cuenta: ${user.accountType}`);
      console.log(`      Fecha creación: ${user.createdAt.toLocaleString('es-CL')}`);
      console.log(`      Premium: ${user.isPremium ? 'Sí' : 'No'}`);
      console.log(`      Tutores asociados: ${user.tutors.length}`);
      console.log(`      Citas: ${user.appointments.length}`);
      console.log(`      Disponibilidad: ${user.availability.length}`);
    } else {
      console.log(`   ❌ NO encontrado en users`);
    }

    // 2. Buscar en Tutors (clientes)
    console.log('\n2. BÚSQUEDA EN TUTORS (CLIENTES):');
    const tutor = await prisma.tutor.findFirst({
      where: { email },
      include: {
        user: { select: { fullName: true, email: true } },
        pets: true,
        appointments: { take: 5, orderBy: { createdAt: 'desc' } }
      }
    });

    if (tutor) {
      console.log(`   ✅ ENCONTRADO EN TUTORS:`);
      console.log(`      ID: ${tutor.id}`);
      console.log(`      Nombre: ${tutor.name}`);
      console.log(`      Email: ${tutor.email}`);
      console.log(`      Teléfono: ${tutor.phone || 'No definido'}`);
      console.log(`      RUT: ${tutor.rut || 'No definido'}`);
      console.log(`      Profesional asociado: ${tutor.user.fullName} (${tutor.user.email})`);
      console.log(`      Mascotas: ${tutor.pets.length}`);
      console.log(`      Citas: ${tutor.appointments.length}`);
    } else {
      console.log(`   ❌ NO encontrado en tutors`);
    }

    // 3. Buscar todos los usuarios creados recientemente
    console.log('\n3. USUARIOS CREADOS RECIENTEMENTE:');
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        accountType: true
      }
    });

    console.log('   Últimos 10 usuarios creados:');
    recentUsers.forEach((u, index) => {
      const highlight = u.email === email ? ' ⭐ ESTE ES' : '';
      console.log(`      ${index + 1}. ${u.email} | ${u.fullName || 'Sin nombre'} | ${u.createdAt.toLocaleString('es-CL')}${highlight}`);
    });

    // 4. Verificar si hay scripts que podrían haber creado este usuario
    console.log('\n4. POSIBLES ORÍGENES:');
    console.log('   📁 Archivos que podrían haber creado usuarios:');
    console.log('      - Scripts de test (test-*.js)');
    console.log('      - Scripts de setup o seed');
    console.log('      - Migraciones de Prisma');
    console.log('      - Registros manuales desde el frontend');
    console.log('      - Datos de ejemplo/demo');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

investigateUser();