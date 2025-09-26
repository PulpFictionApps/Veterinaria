import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseAppointmentSystem() {
  try {
    console.log('🔍 Diagnosing appointment and consultation system...\n');

    const userId = 13; // Rafael's user ID
    
    // 1. Check appointments
    const appointments = await prisma.appointment.findMany({
      where: { userId: userId },
      include: {
        pet: true,
        tutor: true,
        consultationType: true
      },
      orderBy: { date: 'desc' },
      take: 10
    });

    console.log(`📋 Found ${appointments.length} appointments for user ${userId}:`);
    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. ID: ${apt.id}`);
      console.log(`   Date: ${apt.date.toLocaleString()}`);
      console.log(`   Pet: ${apt.pet.name} (${apt.pet.type})`);
      console.log(`   Tutor: ${apt.tutor.name}`);
      console.log(`   Reason: ${apt.reason}`);
      console.log(`   Consult URL: /dashboard/appointments/${apt.id}/consult`);
      console.log('   ---');
    });

    // 2. Check medical records
    const medicalRecords = await prisma.medicalRecord.findMany({
      include: {
        pet: {
          include: {
            tutor: true
          }
        }
      },
      where: {
        pet: {
          tutor: {
            userId: userId
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`\n📄 Found ${medicalRecords.length} medical records:`);
    medicalRecords.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id} - ${record.title}`);
      console.log(`   Pet: ${record.pet.name}`);
      console.log(`   Date: ${record.createdAt.toLocaleDateString()}`);
    });

    // 3. Check prescriptions
    const prescriptions = await prisma.prescription.findMany({
      include: {
        pet: {
          include: {
            tutor: true
          }
        }
      },
      where: {
        pet: {
          tutor: {
            userId: userId
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`\n💊 Found ${prescriptions.length} prescriptions:`);
    prescriptions.forEach((prescription, index) => {
      console.log(`${index + 1}. ID: ${prescription.id} - ${prescription.title}`);
      console.log(`   Pet: ${prescription.pet.name}`);
      console.log(`   Medication: ${prescription.medication}`);
    });

    // 4. Check consultation types
    const consultationTypes = await prisma.consultationType.findMany({
      where: { userId: userId }
    });

    console.log(`\n💼 Found ${consultationTypes.length} consultation types:`);
    consultationTypes.forEach((type, index) => {
      console.log(`${index + 1}. ID: ${type.id} - ${type.name}: $${type.price/100}`);
    });

    console.log('\n🎯 Next steps to test:');
    console.log('1. Go to: http://localhost:3001/dashboard/appointments');
    console.log('2. Click "Iniciar Consulta" on any appointment');
    console.log('3. Should open: /dashboard/appointments/{id}/consult');
    console.log('4. The consultation page should show all the appointment info');
    console.log('5. You should be able to create medical records and prescriptions');

    if (appointments.length > 0) {
      console.log(`\n🧪 Direct test URL: http://localhost:3001/dashboard/appointments/${appointments[0].id}/consult`);
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseAppointmentSystem();