import 'dotenv/config';

console.log('🔍 Verificando configuración de Supabase...');
console.log('');
console.log('Variables de entorno:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No encontrada');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ No encontrada');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No encontrada');
console.log('');

// Test básico de conexión HTTP a Supabase
async function testSupabaseConnection() {
  try {
    console.log('🔗 Probando conexión HTTP a Supabase...');
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Conexión HTTP a Supabase: OK');
    } else {
      console.log('❌ Conexión HTTP falló:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Error de conexión HTTP:', error.message);
  }
}

testSupabaseConnection();