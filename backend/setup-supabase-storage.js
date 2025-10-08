// Script para crear el bucket de Prescriptions en Supabase Storage
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createPrescriptionsBucket() {
  console.log('🔧 Creando bucket de Prescriptions...');
  
  try {
    // Crear el bucket
    const { data, error } = await supabase.storage.createBucket('Prescriptions', {
      public: true, // Hacer público para acceso a PDFs
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 50 * 1024 * 1024 // 50MB máximo por PDF
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ El bucket "Prescriptions" ya existe');
        return true;
      } else {
        console.error('❌ Error creando bucket:', error);
        return false;
      }
    }

    console.log('✅ Bucket "Prescriptions" creado exitosamente');
    console.log('📋 Configuración:');
    console.log('   - Público: Sí (PDFs accesibles)');
    console.log('   - Tipos permitidos: application/pdf');
    console.log('   - Tamaño máximo: 50MB');
    
    return true;
  } catch (error) {
    console.error('💥 Error fatal:', error);
    return false;
  }
}

async function testBucketAccess() {
  console.log('\n🧪 Probando acceso al bucket...');
  
  try {
    const { data, error } = await supabase.storage.from('Prescriptions').list();
    
    if (error) {
      console.error('❌ Error accediendo al bucket:', error);
      return false;
    }
    
    console.log('✅ Acceso al bucket exitoso');
    console.log(`📁 Archivos actuales: ${data?.length || 0}`);
    return true;
  } catch (error) {
    console.error('💥 Error probando acceso:', error);
    return false;
  }
}

async function setupSupabaseStorage() {
  console.log('🚀 CONFIGURANDO SUPABASE STORAGE PARA SISTEMA HÍBRIDO');
  console.log('=====================================================');
  console.log(`📍 Proyecto: ${supabaseUrl}`);
  console.log('💾 Base de datos principal: NEON');
  console.log('📁 Storage para PDFs: Supabase\n');

  const bucketCreated = await createPrescriptionsBucket();
  if (!bucketCreated) {
    console.log('\n❌ No se pudo configurar el storage. Verifica:');
    console.log('   1. SUPABASE_URL en .env');
    console.log('   2. SUPABASE_SERVICE_ROLE_KEY en .env');
    console.log('   3. Permisos en el proyecto Supabase');
    return;
  }

  const accessWorking = await testBucketAccess();
  if (!accessWorking) {
    console.log('\n⚠️ Bucket creado pero hay problemas de acceso');
    return;
  }

  console.log('\n🎉 ¡SUPABASE STORAGE CONFIGURADO CORRECTAMENTE!');
  console.log('✅ El sistema híbrido ya puede:');
  console.log('   - Subir PDFs a Supabase Storage');
  console.log('   - Cachear localmente para performance');
  console.log('   - Usar NEON solo para metadatos');
  console.log('\n🚀 ¡Listo para usar los endpoints híbridos!');
}

// Ejecutar configuración
setupSupabaseStorage().catch(console.error);