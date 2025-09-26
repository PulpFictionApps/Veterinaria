// Script para diagnosticar problemas de conexión a base de datos en producción
import prisma from './lib/prisma.js';

console.log('🔍 Diagnóstico de conexión a base de datos...\n');

// Mostrar variables de entorno (censuradas)
console.log('📊 Variables de entorno:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 
  process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@') : 'NO CONFIGURADA');
console.log('DIRECT_URL:', process.env.DIRECT_URL ? 
  process.env.DIRECT_URL.replace(/:[^:@]+@/, ':***@') : 'NO CONFIGURADA');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL ? 'SÍ' : 'NO');
console.log('');

// Probar conexión a base de datos
async function testDatabaseConnection() {
  console.log('🔌 Probando conexión a base de datos...');
  
  try {
    // Test simple de conexión
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexión a BD exitosa:', result);
    
    // Test de consulta de usuario simple
    console.log('\n📋 Probando consulta de usuarios...');
    const userCount = await prisma.user.count();
    console.log('✅ Total usuarios en BD:', userCount);
    
    // Test de consulta específica que falla
    console.log('\n👤 Probando consulta de perfil (como en la app)...');
    const users = await prisma.user.findMany({
      take: 1,
      select: {
        id: true,
        email: true,
        fullName: true
      }
    });
    
    if (users.length > 0) {
      console.log('✅ Consulta de perfil exitosa. Usuario ejemplo:', {
        id: users[0].id,
        email: users[0].email,
        fullName: users[0].fullName
      });
    } else {
      console.log('⚠️  No hay usuarios en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión a BD:', error.message);
    console.error('Detalles del error:', {
      code: error.code,
      clientVersion: error.clientVersion,
      name: error.name
    });
    
    // Información adicional para debugging
    if (error.message.includes("Can't reach database server")) {
      console.log('\n🔍 Análisis del error:');
      console.log('- El servidor de BD no está accesible');
      console.log('- Verificar que la URL de BD sea correcta');
      console.log('- Verificar que las credenciales sean válidas');
      console.log('- El pooler de Supabase podría estar down');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();