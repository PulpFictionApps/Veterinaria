// Test simple de conexión Gmail
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const CLINIC_NAME = process.env.CLINIC_NAME;

console.log('🧪 Test de Conexión Gmail SMTP');
console.log('==============================\n');
console.log(`📧 Email: ${GMAIL_USER}`);
console.log(`🔑 Contraseña configurada: ${GMAIL_APP_PASSWORD ? 'SÍ' : 'NO'}`);
console.log(`🏥 Clínica: ${CLINIC_NAME}\n`);

async function testGmailConnection() {
  try {
    // Crear transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
      }
    });

    console.log('🔄 Verificando conexión con Gmail...');
    
    // Verificar conexión
    await transporter.verify();
    console.log('✅ Conexión Gmail exitosa!\n');

    // Enviar email de prueba
    console.log('📧 Enviando email de prueba...');
    
    const info = await transporter.sendMail({
      from: `${CLINIC_NAME} <${GMAIL_USER}>`,
      to: GMAIL_USER, // Enviar a ti mismo como prueba
      subject: '✅ Test de Conexión - Sistema Veterinario',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎉 ¡Conexión Exitosa!</h1>
            <p style="color: white; margin: 5px 0 0 0;">Sistema de recordatorios funcionando</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">✅ Gmail SMTP Configurado Correctamente</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">📋 Configuración:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>📧 Email:</strong> ${GMAIL_USER}</p>
              <p style="margin: 5px 0; color: #666;"><strong>🏥 Clínica:</strong> ${CLINIC_NAME}</p>
              <p style="margin: 5px 0; color: #666;"><strong>🕒 Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #2d5a2d;">🎯 ¿Qué significa esto?</h4>
              <ul style="margin: 10px 0; color: #4a5a4a; padding-left: 20px;">
                <li>✅ Puedes enviar emails desde ${GMAIL_USER}</li>
                <li>✅ Los recordatorios llegarán a profesionales y clientes</li>
                <li>✅ No necesitas dominio personalizado</li>
                <li>✅ Los clientes pueden responder directamente</li>
                <li>✅ Sistema completamente GRATIS</li>
              </ul>
            </div>
            
            <p style="color: #666; text-align: center; margin: 30px 0;">
              🚀 ¡Tu sistema de recordatorios está listo! 🐾
            </p>
          </div>
        </div>
      `
    });

    console.log('✅ Email de prueba enviado exitosamente!');
    console.log(`📧 Message ID: ${info.messageId}\n`);
    
    console.log('🎉 ¡GMAIL SMTP CONFIGURADO CORRECTAMENTE!');
    console.log('📬 Revisa tu bandeja de entrada en myvetagenda@gmail.com');
    
    return true;

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verifica que la contraseña de aplicación sea correcta');
      console.log('   2. Asegúrate de tener activada la verificación en 2 pasos');
      console.log('   3. Genera una nueva contraseña de aplicación');
    }
    
    return false;
  }
}

testGmailConnection();