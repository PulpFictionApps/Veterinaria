import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in the database`);
    
    const petCount = await prisma.pet.count();
    console.log(`🐾 Found ${petCount} pets in the database`);
    
    const appointmentCount = await prisma.appointment.count();
    console.log(`� Found ${appointmentCount} appointments in the database`);
    
    console.log('🎉 All database operations working correctly!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Connection closed');
  }
}

testConnection();