import { uploadPDF, supabase, STORAGE_BUCKET } from './src/lib/supabaseStorage.js';

async function testSupabaseDownload() {
  console.log('🔍 Probando descarga con cliente de Supabase...\n');
  
  try {
    // 1. Crear y subir PDF
    console.log('📄 Subiendo PDF de prueba...');
    const testPdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT /F1 12 Tf 72 720 Td (Download Test PDF) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000232 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref
294
%%EOF`;

    const pdfBuffer = Buffer.from(testPdfContent);
    const uploadResult = await uploadPDF(pdfBuffer, 'download-test.pdf');
    console.log('✅ PDF subido:');
    console.log(`   Path: ${uploadResult.path}`);
    
    // 2. Descargar usando cliente de Supabase
    console.log('\n⬇️  Descargando con cliente de Supabase...');
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(uploadResult.path);
    
    if (error) {
      console.log('❌ Error descargando:', error.message);
      return;
    }
    
    if (!data) {
      console.log('❌ No se recibieron datos');
      return;
    }
    
    console.log('✅ Descarga exitosa!');
    console.log(`   Tipo: ${data.type}`);
    console.log(`   Tamaño: ${data.size} bytes`);
    
    // 3. Verificar contenido
    const arrayBuffer = await data.arrayBuffer();
    const downloadedBuffer = Buffer.from(arrayBuffer);
    
    if (downloadedBuffer.length === pdfBuffer.length) {
      console.log('✅ Los tamaños coinciden');
    } else {
      console.log(`⚠️  Los tamaños no coinciden: original ${pdfBuffer.length}, descargado ${downloadedBuffer.length}`);
    }
    
    // 4. Limpiar
    console.log('\n🧹 Limpiando archivo...');
    const { deletePDF } = await import('./src/lib/supabaseStorage.js');
    const deleted = await deletePDF(uploadResult.path);
    console.log(deleted ? '✅ Limpiado' : '⚠️  Error limpiando');
    
    console.log('\n🎉 ¡El método de descarga directa funciona!');
    console.log('✅ Ahora las descargas de PDF deberían funcionar correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSupabaseDownload();