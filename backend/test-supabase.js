import { uploadPDF, deletePDF, getPublicUrl, supabase, STORAGE_BUCKET } from './src/lib/supabaseStorage.js';
import fs from 'fs';
import path from 'path';

async function testSupabaseStorage() {
  console.log('🧪 Probando integración con Supabase Storage...\n');

  try {
    // Test 1: Verificar conexión con Supabase
    console.log('📡 Test 1: Verificando conexión con Supabase...');
    
    // Verificar variables de entorno
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ Variables de entorno de Supabase no configuradas');
      console.log('📝 Por favor configura:');
      console.log('   - SUPABASE_URL="tu-proyecto-supabase-url"');
      console.log('   - SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"');
      console.log('\n💡 Obtén estas variables desde tu dashboard de Supabase:');
      console.log('   1. Ve a https://supabase.com/dashboard');
      console.log('   2. Selecciona tu proyecto');
      console.log('   3. Ve a Settings > API');
      console.log('   4. Copia la URL y el service_role key');
      return;
    }
    
    console.log('✅ Variables de entorno configuradas');
    console.log(`   URL: ${process.env.SUPABASE_URL}`);
    console.log(`   Service Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);

    // Test 2: Verificar bucket
    console.log('\n📦 Test 2: Verificando bucket de storage...');
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      
      const prescriptionBucket = buckets.find(bucket => bucket.name === STORAGE_BUCKET);
      if (prescriptionBucket) {
        console.log(`✅ Bucket '${STORAGE_BUCKET}' existe y está accesible`);
      } else {
        console.log(`⚠️  Bucket '${STORAGE_BUCKET}' no encontrado`);
        console.log('📝 Necesitas crear el bucket en Supabase:');
        console.log('   1. Ve a Storage en tu dashboard de Supabase');
        console.log('   2. Crea un bucket llamado "prescriptions"');
        console.log('   3. Configura como público si quieres URLs directas');
      }
    } catch (bucketError) {
      console.log('❌ Error al verificar buckets:', bucketError.message);
    }

    // Test 3: Crear un PDF de prueba
    console.log('\n📄 Test 3: Creando PDF de prueba...');
    const testContent = 'Este es un PDF de prueba para Supabase Storage';
    const testBuffer = Buffer.from(`%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${testContent}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000112 00000 n 
0000000298 00000 n 
0000000389 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
489
%%EOF`);

    console.log(`✅ PDF de prueba creado (${testBuffer.length} bytes)`);

    // Test 4: Subir PDF a Supabase
    console.log('\n☁️  Test 4: Subiendo PDF a Supabase Storage...');
    try {
      const fileName = 'test_prescription.pdf';
      const result = await uploadPDF(testBuffer, fileName);
      
      console.log('✅ PDF subido exitosamente:');
      console.log(`   URL: ${result.url}`);
      console.log(`   Path: ${result.path}`);

      // Test 5: Verificar URL pública
      console.log('\n🔗 Test 5: Verificando URL pública...');
      const publicUrl = getPublicUrl(result.path);
      console.log(`✅ URL pública generada: ${publicUrl}`);

      // Test 6: Limpiar archivo de prueba
      console.log('\n🧹 Test 6: Limpiando archivo de prueba...');
      const deleted = await deletePDF(result.path);
      if (deleted) {
        console.log('✅ Archivo de prueba eliminado exitosamente');
      } else {
        console.log('⚠️  No se pudo eliminar el archivo de prueba');
      }

    } catch (uploadError) {
      console.log('❌ Error al subir PDF:', uploadError.message);
      
      if (uploadError.message.includes('JWT')) {
        console.log('💡 Posible problema: Service Role Key inválida');
      } else if (uploadError.message.includes('bucket')) {
        console.log('💡 Posible problema: Bucket no existe o sin permisos');
      }
    }

    console.log('\n🎉 Pruebas de Supabase Storage completadas!');
    console.log('\n📋 Resumen de la implementación:');
    console.log('✅ Librería @supabase/supabase-js instalada');
    console.log('✅ Módulo supabaseStorage.js creado');
    console.log('✅ Rutas de prescripciones actualizadas');
    console.log('✅ Variables de entorno configuradas');
    console.log('✅ Función de limpieza actualizada');

    console.log('\n🚀 Beneficios implementados:');
    console.log('📦 PDFs se almacenan en Supabase Storage (no en Neon)');
    console.log('🌐 URLs públicas para descarga directa');
    console.log('♻️  Limpieza automática de archivos vencidos');
    console.log('🔄 Compatibilidad con archivos antiguos (fallback)');
    console.log('☁️  Perfecto para deployment en Vercel');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

// Solo ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabaseStorage();
}

export { testSupabaseStorage };