import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProfessionalData() {
  console.log('🔍 VERIFICANDO DATOS DEL PROFESIONAL EN LA BASE DE DATOS');
  console.log('='.repeat(60));
  
  try {
    // Buscar el profesional principal (usuario ID 1)
    const professional = await prisma.user.findUnique({
      where: { id: 1 },
      select: {
        id: true,
        email: true,
        fullName: true,
        clinicName: true,
        professionalTitle: true,
        clinicAddress: true,
        professionalPhone: true,
        contactEmail: true,
        contactPhone: true,
        appointmentInstructions: true
      }
    });
    
    if (!professional) {
      console.log('❌ No se encontró el profesional con ID 1');
      return;
    }
    
    console.log('\n📋 DATOS ACTUALES DEL PROFESIONAL:');
    console.log(`ID: ${professional.id}`);
    console.log(`Nombre completo: ${professional.fullName || '❌ No configurado'}`);
    console.log(`Email principal: ${professional.email || '❌ No configurado'}`);
    console.log(`Nombre de clínica: ${professional.clinicName || '❌ No configurado'}`);
    console.log(`Título profesional: ${professional.professionalTitle || '❌ No configurado'}`);
    console.log(`Dirección clínica: ${professional.clinicAddress || '❌ No configurado'}`);
    console.log(`Teléfono profesional: ${professional.professionalPhone || '❌ No configurado'}`);
    console.log(`Email de contacto: ${professional.contactEmail || '❌ No configurado (usará email principal)'}`);
    console.log(`Teléfono de contacto: ${professional.contactPhone || '❌ No configurado'}`);
    
    console.log('\n📧 DATOS QUE SE USARÁN EN LOS EMAILS:');
    console.log(`Nombre en el encabezado: "${professional.clinicName || professional.fullName || 'Clínica Veterinaria'}"`);
    console.log(`Remitente (From): "${professional.clinicName || professional.fullName || 'Clínica Veterinaria'} <myvetagenda@gmail.com>"`);
    
    console.log('\n📝 INSTRUCCIONES PERSONALIZADAS:');
    if (professional.appointmentInstructions) {
      const instructions = professional.appointmentInstructions.split('\n');
      instructions.forEach(instruction => {
        console.log(`- ${instruction}`);
      });
    } else {
      console.log('❌ No hay instrucciones personalizadas (usará las por defecto)');
    }
    
    console.log('\n💡 RECOMENDACIONES:');
    if (!professional.clinicName) {
      console.log('⚠️  Configura el nombre de tu clínica en Ajustes para personalizar los emails');
    }
    if (!professional.contactEmail && !professional.contactPhone) {
      console.log('⚠️  Configura información de contacto en Ajustes para que aparezca en los emails');
    }
    if (!professional.clinicAddress) {
      console.log('⚠️  Configura la dirección de tu clínica en Ajustes');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfessionalData().catch(console.error);