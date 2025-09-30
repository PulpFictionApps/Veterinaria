// Script para probar las nuevas validaciones del formulario público
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function testValidations() {
  console.log('🧪 TESTING DE NUEVAS VALIDACIONES');
  console.log('='.repeat(50));
  
  try {
    // Verificar usuarios disponibles para testing
    const users = await prisma.user.findMany({
      select: { id: true, email: true, fullName: true },
      orderBy: { id: 'asc' }
    });
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos para testing');
      return;
    }
    
    console.log('\n📊 USUARIOS DISPONIBLES:');
    users.forEach(user => {
      console.log(`   ${user.id}. ${user.fullName} (${user.email})`);
    });
    
    const testUserId = users[0].id;
    console.log(`\n🎯 Usando usuario ID ${testUserId} para las pruebas`);
    
    // Test 1: Crear tutor con datos completos
    console.log('\n🧪 TEST 1: Crear tutor con datos completos');
    const newTutor = await prisma.tutor.create({
      data: {
        name: 'Cliente Test',
        email: 'cliente.test@example.com',
        phone: '+56912345678',
        rut: '12345678-9',
        address: 'Dirección Test 123',
        userId: testUserId
      }
    });
    console.log(`   ✅ Tutor creado: ID ${newTutor.id}`);
    
    // Test 2: Intentar crear tutor con teléfono duplicado
    console.log('\n🧪 TEST 2: Intentar crear tutor con teléfono duplicado');
    try {
      await prisma.tutor.create({
        data: {
          name: 'Cliente Test 2',
          email: 'cliente.test2@example.com',
          phone: '+56912345678', // Mismo teléfono
          rut: '98765432-1',
          address: 'Otra Dirección 456',
          userId: testUserId
        }
      });
      console.log('   ❌ ERROR: Debería haber fallado por teléfono duplicado');
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('   ✅ Correcto: Prisma detectó duplicado');
      } else {
        console.log(`   ℹ️  Error diferente: ${error.message}`);
      }
    }
    
    // Test 3: Crear mascota con datos completos
    console.log('\n🧪 TEST 3: Crear mascota con datos completos');
    const newPet = await prisma.pet.create({
      data: {
        name: 'Mascota Test',
        type: 'Perro',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25.5,
        sex: 'Macho',
        reproductiveStatus: 'Castrado',
        birthDate: new Date('2022-01-15'),
        tutorId: newTutor.id
      }
    });
    console.log(`   ✅ Mascota creada: ID ${newPet.id}`);
    console.log(`   📝 Datos: ${newPet.name}, ${newPet.type}, ${newPet.breed}, ${newPet.age} años, ${newPet.weight}kg, ${newPet.sex}, ${newPet.reproductiveStatus}`);
    
    // Test 4: Verificar estructura de datos
    console.log('\n🧪 TEST 4: Verificar estructura completa');
    const completeTutor = await prisma.tutor.findUnique({
      where: { id: newTutor.id },
      include: { pets: true }
    });
    
    console.log('   📊 TUTOR COMPLETO:');
    console.log(`      Nombre: ${completeTutor.name}`);
    console.log(`      Email: ${completeTutor.email}`);
    console.log(`      Teléfono: ${completeTutor.phone}`);
    console.log(`      RUT: ${completeTutor.rut}`);
    console.log(`      Dirección: ${completeTutor.address}`);
    console.log(`      Mascotas: ${completeTutor.pets.length}`);
    
    if (completeTutor.pets.length > 0) {
      const pet = completeTutor.pets[0];
      console.log('   🐾 MASCOTA:');
      console.log(`      Nombre: ${pet.name}`);
      console.log(`      Tipo: ${pet.type}`);
      console.log(`      Raza: ${pet.breed}`);
      console.log(`      Edad: ${pet.age} años`);
      console.log(`      Peso: ${pet.weight}kg`);
      console.log(`      Sexo: ${pet.sex}`);
      console.log(`      Estado reproductivo: ${pet.reproductiveStatus}`);
      console.log(`      Fecha nacimiento: ${pet.birthDate.toLocaleDateString('es-CL')}`);
    }
    
    console.log('\n✅ TODOS LOS TESTS COMPLETADOS');
    
  } catch (error) {
    console.error('❌ Error en testing:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testValidations();