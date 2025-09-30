// Test simple de conexión con Resend API
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_API_KEY = process.env.EMAIL_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

console.log('🔑 API Key configurada:', EMAIL_API_KEY ? 'SÍ' : 'NO');
console.log('📧 Email From:', EMAIL_FROM);

async function testResendConnection() {
  try {
    console.log('\n🧪 Probando conexión con Resend API...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: ['benguriadonosorafael@gmail.com'],
        subject: 'Test de Conexión - Sistema Veterinario',
        html: `
          <h2>✅ Test de Conexión Exitoso</h2>
          <p>El sistema de recordatorios por email está funcionando correctamente.</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
        `
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email enviado exitosamente!');
      console.log('📧 ID del email:', result.id);
      console.log('📬 Revisa tu bandeja de entrada: benguriadonosorafael@gmail.com');
    } else {
      console.log('❌ Error en la API:', result);
      console.log('🔍 Status:', response.status);
      console.log('💡 Posibles causas:');
      console.log('   - API key inválida o expirada');
      console.log('   - Límite de emails alcanzado');
      console.log('   - Email no verificado en Resend');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testResendConnection();