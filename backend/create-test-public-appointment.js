import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestPublicAppointment() {
  try {
    console.log('🧪 Creating a test public appointment...\n');

    const userId = 13; // Rafael's user ID
    
    // Get an available slot
    const availableSlot = await prisma.availability.findFirst({
      where: { userId: userId },
      orderBy: { start: 'asc' }
    });

    if (!availableSlot) {
      console.log('❌ No available slots found');
      return;
    }

    console.log('📅 Using slot:', {
      start: availableSlot.start,
      end: availableSlot.end
    });

    // Create or find tutor
    let tutor = await prisma.tutor.findFirst({
      where: {
        userId: userId,
        email: 'cliente.test@example.com'
      }
    });

    if (!tutor) {
      tutor = await prisma.tutor.create({
        data: {
          userId: userId,
          name: 'Cliente Test Público',
          email: 'cliente.test@example.com',
          phone: '+56912345678'
        }
      });
      console.log('✅ Created tutor:', tutor.name);
    } else {
      console.log('✅ Found existing tutor:', tutor.name);
    }

    // Create pet
    let pet = await prisma.pet.findFirst({
      where: {
        tutorId: tutor.id,
        name: 'Mascota Test Pública'
      }
    });

    if (!pet) {
      pet = await prisma.pet.create({
        data: {
          tutorId: tutor.id,
          name: 'Mascota Test Pública',
          type: 'Perro',
          breed: 'Labrador',
          age: 3,
          weight: 25.5
        }
      });
      console.log('✅ Created pet:', pet.name);
    } else {
      console.log('✅ Found existing pet:', pet.name);
    }

    // Get consultation type
    const consultationType = await prisma.consultationType.findFirst({
      where: { userId: userId }
    });

    if (!consultationType) {
      console.log('❌ No consultation type found');
      return;
    }

    // Create appointment (simulating public booking)
    const appointment = await prisma.$transaction(async (tx) => {
      // Create the appointment
      const newAppointment = await tx.appointment.create({
        data: {
          userId: userId,
          petId: pet.id,
          tutorId: tutor.id,
          date: availableSlot.start,
          reason: 'Consulta general creada desde reserva pública TEST',
          consultationTypeId: consultationType.id
        }
      });

      // Remove the availability slot
      await tx.availability.delete({
        where: { id: availableSlot.id }
      });

      // Return full appointment with relations
      return await tx.appointment.findUnique({
        where: { id: newAppointment.id },
        include: {
          pet: true,
          tutor: true,
          consultationType: true
        }
      });
    });

    console.log('🎉 Successfully created public appointment:', {
      id: appointment.id,
      date: appointment.date.toLocaleString(),
      pet: appointment.pet.name,
      tutor: appointment.tutor.name,
      reason: appointment.reason
    });

    console.log('\n✅ The appointment should now appear in the dashboard appointments list!');
    console.log('🔍 Check: http://localhost:3001/dashboard/appointments');

  } catch (error) {
    console.error('❌ Error creating test appointment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPublicAppointment();