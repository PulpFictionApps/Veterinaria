// Configuración para usar Gmail como email de respuesta
import { PrismaClient } from "@prisma/client";
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Configuración de email usando Resend
const EMAIL_API_KEY = process.env.EMAIL_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// Gmail para recibir respuestas y contacto
const CLINIC_GMAIL = 'vetconnect@gmail.com'; // Tu Gmail para la clínica
const CLINIC_NAME = 'VetConnect - Clínica Veterinaria';

console.log('🚀 Sistema con Gmail de respuesta configurado');

// Función para enviar email con Gmail como reply-to
async function sendEmailWithGmailReply(to, subject, htmlContent) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${CLINIC_NAME} <${EMAIL_FROM}>`, // Enviado desde Resend
        to: [to],
        reply_to: CLINIC_GMAIL, // Respuestas van a tu Gmail
        subject: subject,
        html: htmlContent
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Email enviado - ID: ${result.id}`);
      console.log(`📧 Desde: ${EMAIL_FROM}`);
      console.log(`📬 Respuestas a: ${CLINIC_GMAIL}`);
      return true;
    } else {
      const error = await response.json();
      console.log(`❌ Error: ${error.message}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error enviando email: ${error.message}`);
    return false;
  }
}

export { sendEmailWithGmailReply, CLINIC_GMAIL, CLINIC_NAME, prisma };