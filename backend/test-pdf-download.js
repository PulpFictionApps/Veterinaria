import { uploadPDF, getPublicUrl } from './src/lib/supabaseStorage.js';
import fetch from 'node-fetch';

async function testSupabaseAccess() {
  console.log('🔍 Diagnosticando problema de descarga PDF...\n');
  
  try {
    // 1. Crear y subir un PDF de prueba
    console.log('📄 Creando PDF de prueba...');
    const testPdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT /F1 12 Tf 72 720 Td (Test PDF Content) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000228 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref
290
%%EOF`;

    const pdfBuffer = Buffer.from(testPdfContent);
    console.log('✅ PDF creado');
    
    // 2. Subir a Supabase
    console.log('⬆️  Subiendo a Supabase...');
    const uploadResult = await uploadPDF(pdfBuffer, 'diagnostic-test.pdf');
    console.log('✅ Subido exitosamente:');
    console.log(`   URL: ${uploadResult.url}`);
    console.log(`   Path: ${uploadResult.path}`);
    
    // 3. Probar acceso directo a la URL
    console.log('\n🌐 Probando acceso directo a URL...');
    const directResponse = await fetch(uploadResult.url);
    console.log(`   Status: ${directResponse.status} ${directResponse.statusText}`);
    console.log(`   Content-Type: ${directResponse.headers.get('content-type')}`);
    console.log(`   Content-Length: ${directResponse.headers.get('content-length')}`);
    
    if (directResponse.ok) {
      const content = await directResponse.buffer();
      console.log(`   ✅ PDF descargado correctamente (${content.length} bytes)`);
    } else {
      console.log('   ❌ Error al acceder directamente');
    }
    
    // 4. Probar URL pública generada
    console.log('\n🔗 Probando URL pública generada...');
    const publicUrl = getPublicUrl(uploadResult.path);
    console.log(`   Public URL: ${publicUrl}`);
    
    const publicResponse = await fetch(publicUrl);
    console.log(`   Status: ${publicResponse.status} ${publicResponse.statusText}`);
    
    if (publicResponse.ok) {
      const content = await publicResponse.buffer();
      console.log(`   ✅ Acceso por URL pública exitoso (${content.length} bytes)`);
    } else {
      console.log('   ❌ Error al acceder por URL pública');
      console.log('   🔍 Posible causa: Bucket no configurado como público');
      console.log('   💡 Solución: Ve a Supabase Dashboard > Storage > Bucket "Prescriptions" > Hacer público');
    }
    
    // 5. Verificar si las URLs son diferentes
    if (uploadResult.url !== publicUrl) {
      console.log('\n⚠️  Las URLs son diferentes:');
      console.log(`   Upload URL: ${uploadResult.url}`);
      console.log(`   Public URL: ${publicUrl}`);
    }
    
    // 6. Limpiar archivo de prueba
    console.log('\n🧹 Limpiando archivo de prueba...');
    const { deletePDF } = await import('./src/lib/supabaseStorage.js');
    const deleted = await deletePDF(uploadResult.path);
    console.log(deleted ? '✅ Archivo limpiado' : '⚠️  No se pudo limpiar');
    
  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSupabaseAccess();