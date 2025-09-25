import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

console.log('Testing PDF generation...');

try {
  // Simulate production environment
  process.env.VERCEL = 'true';
  
  const doc = new PDFDocument({ margin: 50 });
  const fileName = `test_prescription_${Date.now()}.pdf`;
  const tmpDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'tmp');
  const outPath = path.join(tmpDir, fileName);
  
  console.log('Output path:', outPath);
  console.log('Temp dir exists:', fs.existsSync(tmpDir));
  
  // Test if we can create tmp directory locally
  if (!process.env.VERCEL) {
    await fs.promises.mkdir(tmpDir, { recursive: true });
  }
  
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);
  
  // Add simple content
  doc.fontSize(16).text('Test Prescription PDF', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('This is a test PDF generation');
  doc.text('Patient: Test Pet');
  doc.text('Medication: Test Medicine');
  doc.text('Dosage: 1 tablet');
  
  doc.end();
  
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
    setTimeout(() => reject(new Error('Timeout')), 10000);
  });
  
  console.log('✅ PDF generated successfully!');
  console.log('File exists:', fs.existsSync(outPath));
  console.log('File size:', fs.statSync(outPath).size, 'bytes');
  
} catch (error) {
  console.error('❌ PDF generation failed:', error);
}