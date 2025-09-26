import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserAndAvailability() {
  try {
    console.log('📊 Checking database state...\n');

    // Check all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true
      },
      take: 5
    });

    console.log(`👥 Found ${users.length} users in database:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Name: ${user.fullName || 'N/A'}, Email: ${user.email}`);
    });

    if (users.length === 0) {
      console.log('\n⚠️  No users found. You need to register a user first.');
      return;
    }

    const testUserId = users[0].id;
    console.log(`\n🧪 Using user ${testUserId} for testing...`);

    // Check availability for first user
    const availability = await prisma.availability.findMany({
      where: { userId: testUserId },
      orderBy: { start: 'asc' }
    });

    console.log(`\n📅 Found ${availability.length} availability slots for user ${testUserId}:`);
    availability.forEach(slot => {
      console.log(`- ${new Date(slot.start).toLocaleString()} to ${new Date(slot.end).toLocaleString()}`);
    });

    if (availability.length === 0) {
      console.log('\n⚠️  No availability slots found. Creating some test slots...');
      
      // Create some availability for testing
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      const slot1End = new Date(tomorrow);
      slot1End.setHours(11, 0, 0, 0);
      
      const slot2Start = new Date(tomorrow);
      slot2Start.setHours(14, 0, 0, 0);
      
      const slot2End = new Date(tomorrow);
      slot2End.setHours(15, 0, 0, 0);

      await prisma.availability.createMany({
        data: [
          {
            userId: testUserId,
            start: tomorrow,
            end: slot1End
          },
          {
            userId: testUserId,
            start: slot2Start,
            end: slot2End
          }
        ]
      });
      
      console.log('✅ Created test availability slots for tomorrow');
    }

    // Check consultation types
    const consultationTypes = await prisma.consultationType.findMany({
      where: { userId: testUserId }
    });

    console.log(`\n💼 Found ${consultationTypes.length} consultation types for user ${testUserId}:`);
    consultationTypes.forEach(type => {
      console.log(`- ${type.name}: $${type.price/100}`);
    });

    if (consultationTypes.length === 0) {
      console.log('\n⚠️  No consultation types found. Creating test consultation type...');
      
      await prisma.consultationType.create({
        data: {
          userId: testUserId,
          name: 'Consulta General',
          price: 2500000, // $25,000 in cents
          description: 'Consulta veterinaria general'
        }
      });
      
      console.log('✅ Created test consultation type');
    }

    // Check recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      where: { userId: testUserId },
      include: {
        pet: true,
        tutor: true
      },
      orderBy: { date: 'desc' },
      take: 5
    });

    console.log(`\n📋 Found ${recentAppointments.length} recent appointments for user ${testUserId}:`);
    recentAppointments.forEach(apt => {
      console.log(`- ${new Date(apt.date).toLocaleString()}: ${apt.pet?.name || 'Unknown pet'} (${apt.tutor?.name || 'Unknown tutor'})`);
    });

    console.log(`\n🎯 Database ready! Test with user ID: ${testUserId}`);
    console.log(`📊 Public booking URL: http://localhost:3001/book/${testUserId}`);

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserAndAvailability();