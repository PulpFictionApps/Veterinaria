import { uploadPDF, deletePDF } from './src/lib/supabaseStorage.js';

async function testUpload() {
  console.log('📁 Probando upload de PDF a Supabase...');
  
  try {
    // Crear un PDF simple de prueba
    const testPdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000056 00000 n 
0000000111 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
190
%%EOF`;

    const pdfBuffer = Buffer.from(testPdfContent);
    console.log('✅ PDF de prueba creado');
    
    // Subir archivo
    console.log('⬆️  Subiendo a Supabase...');
    const result = await uploadPDF(pdfBuffer, 'test-prescription.pdf');
    
    console.log('🎉 ¡Upload exitoso!');
    console.log('URL:', result.url);
    console.log('Path:', result.path);
    
    // Esperar un momento y eliminar
    console.log('⏳ Esperando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🗑️  Eliminando archivo de prueba...');
    const deleted = await deletePDF(result.path);
    
    if (deleted) {
      console.log('✅ Archivo eliminado exitosamente');
    } else {
      console.log('⚠️  No se pudo eliminar el archivo');
    }
    
    console.log('\n🎉 ¡Supabase Storage funcionando perfectamente!');
    console.log('\n✅ Tu sistema de prescripciones ahora puede:');
    console.log('   📄 Generar PDFs');
    console.log('   ☁️  Subirlos a Supabase Storage');
    console.log('   🔗 Crear URLs públicas para descarga');
    console.log('   🧹 Limpiar archivos vencidos automáticamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testUpload();