// Smoke test offline para demostrar funcionamiento sin conectividad DB
// Simula respuestas del backend y genera PDF local

import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';

console.log('🔧 Smoke Test Offline - Simulando flujo completo\n');

// Simular datos que vendrían de la DB
const mockData = {
  user: {
    id: 1,
    email: 'demo+vet@example.com',
    fullName: 'Dra. Demo',
    clinicName: 'Clínica Demo',
    professionalTitle: 'Médico Veterinario',
    professionalRut: '12.345.678-9',
    clinicAddress: 'Av. Demo 123, Santiago'
  },
  tutor: {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+56911111111'
  },
  pet: {
    id: 1,
    name: 'Firulais',
    type: 'Perro',
    breed: 'Mestizo',
    age: 4
  },
  prescription: {
    id: 1,
    petId: 1,
    tutorId: 1,
    userId: 1,
    medications: [
      { name: 'Amoxicilina', dosage: '250mg', frequency: 'cada 8 horas', duration: '7 días' },
      { name: 'Meloxicam', dosage: '0.5ml', frequency: 'cada 24 horas', duration: '5 días' }
    ],
    diagnosis: 'Infección de oído leve',
    instructions: 'Administrar con comida. Completar todo el tratamiento.',
    createdAt: new Date()
  }
};

console.log('✅ 1. Usuario profesional: ' + mockData.user.fullName);
console.log('✅ 2. Cliente creado: ' + mockData.tutor.name);
console.log('✅ 3. Mascota registrada: ' + mockData.pet.name + ' (' + mockData.pet.type + ')');
console.log('✅ 4. Prescripción creada con ' + mockData.prescription.medications.length + ' medicamentos');

// Generar PDF como lo haría el backend
console.log('\n🎯 Generando PDF de prescripción...');

const doc = new PDFDocument({ margin: 50 });
const filename = `prescripcion_demo_${Date.now()}.pdf`;
const filepath = path.join(process.cwd(), filename);

// Stream to file
doc.pipe(fs.createWriteStream(filepath));

// Header de la clínica
doc.fontSize(18).text(mockData.user.clinicName, { align: 'center' });
doc.fontSize(12).text(mockData.user.professionalTitle, { align: 'center' });
doc.fontSize(12).text(mockData.user.fullName, { align: 'center' });
doc.text(`RUT: ${mockData.user.professionalRut}`, { align: 'center' });
doc.text(mockData.user.clinicAddress, { align: 'center' });
doc.moveDown(2);

// Título
doc.fontSize(16).text('RECETA MÉDICA', { align: 'center', underline: true });
doc.moveDown();

// Información del paciente
doc.fontSize(12).text(`Fecha: ${mockData.prescription.createdAt.toLocaleDateString('es-ES')}`);
doc.text(`Paciente: ${mockData.pet.name} (${mockData.pet.type}, ${mockData.pet.breed})`);
doc.text(`Edad: ${mockData.pet.age} años`);
doc.text(`Tutor: ${mockData.tutor.name}`);
doc.text(`Teléfono: ${mockData.tutor.phone}`);
doc.moveDown();

// Diagnóstico
if (mockData.prescription.diagnosis) {
  doc.fontSize(14).text('DIAGNÓSTICO:', { underline: true });
  doc.fontSize(12).text(mockData.prescription.diagnosis);
  doc.moveDown();
}

// Medicamentos
doc.fontSize(14).text('MEDICAMENTOS PRESCRITOS:', { underline: true });
mockData.prescription.medications.forEach((med, index) => {
  doc.fontSize(12).text(`${index + 1}. ${med.name}`);
  doc.text(`   Dosis: ${med.dosage}`);
  doc.text(`   Frecuencia: ${med.frequency}`);
  doc.text(`   Duración: ${med.duration}`);
  doc.moveDown(0.5);
});

// Instrucciones
if (mockData.prescription.instructions) {
  doc.fontSize(14).text('INSTRUCCIONES:', { underline: true });
  doc.fontSize(12).text(mockData.prescription.instructions);
  doc.moveDown(2);
}

// Firma
doc.text('_________________________');
doc.text(mockData.user.fullName);
doc.text(mockData.user.professionalTitle);
doc.text(`RUT: ${mockData.user.professionalRut}`);

doc.end();

doc.on('end', () => {
  console.log('✅ PDF generado exitosamente: ' + filename);
  console.log('📄 Tamaño: ' + Math.round(fs.statSync(filepath).size / 1024) + ' KB');
  
  // Simular respuesta del backend
  const apiResponse = {
    success: true,
    filename: filename,
    downloadUrl: `file://${filepath}`,
    provider: 'local',
    message: 'PDF generado exitosamente',
    prescription: {
      id: mockData.prescription.id,
      pdfUrl: `file://${filepath}`,
      pdfPath: filepath
    }
  };
  
  console.log('\n🎊 Respuesta simulada del backend:');
  console.log(JSON.stringify(apiResponse, null, 2));
  
  console.log('\n✨ Smoke test completado exitosamente');
  console.log(`👀 Abre el archivo: ${filepath}`);
  
  // En un entorno real, esto subiría a Supabase Storage
  console.log('\n📡 En producción, este PDF se subiría a Supabase Storage con:');
  console.log('   - Bucket: Prescriptions');
  console.log('   - Key: prescriptions/1/Firulais-1-' + Date.now() + '.pdf');
  console.log('   - URL firmada con TTL: 3600 segundos');
});

doc.on('error', (err) => {
  console.error('❌ Error generando PDF:', err);
});