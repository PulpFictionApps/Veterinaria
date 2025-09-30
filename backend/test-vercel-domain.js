// Test para verificar si podemos usar el dominio de Vercel
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_API_KEY = process.env.EMAIL_API_KEY;

async function testVercelDomain() {
  console.log('🧪 Probando envío desde dominio de Vercel...\n');

  try {
    // Intentar enviar desde diferentes variaciones
    const testEmails = [
      'noreply@veterinaria-p918.vercel.app',
      'citas@veterinaria-p918.vercel.app', 
      'sistema@veterinaria-p918.vercel.app'
    ];

    for (const fromEmail of testEmails) {
      console.log(`📧 Probando desde: ${fromEmail}`);
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${EMAIL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `VetConnect <${fromEmail}>`,
          to: ['benguriadonosorafael@gmail.com'],
          reply_to: 'vetconnect@gmail.com', // Tu Gmail para respuestas
          subject: `Test desde ${fromEmail}`,
          html: `
            <h2>✅ Test de Email</h2>
            <p><strong>Enviado desde:</strong> ${fromEmail}</p>
            <p><strong>Respuestas van a:</strong> vetconnect@gmail.com</p>
            <p>Si recibes este email, ¡el dominio funciona!</p>
          `
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ¡FUNCIONA! Email ID: ${result.id}`);
        console.log(`🎉 Puedes usar: ${fromEmail}\n`);
        return fromEmail; // Retorna el primer email que funcione
      } else {
        const error = await response.json();
        console.log(`❌ No funciona: ${error.message}\n`);
      }
      
      // Esperar 1 segundo entre requests (rate limit)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testVercelDomain();