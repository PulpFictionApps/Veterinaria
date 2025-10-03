import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Configuración Gmail SMTP
const GMAIL_USER = process.env.GMAIL_USER; // vetconnect@gmail.com
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD; // Contraseña de aplicación
const CLINIC_NAME = process.env.CLINIC_NAME || 'Vetrium - Clínica Veterinaria';

console.log('📧 Sistema Gmail SMTP cargado');
console.log(`✉️  Email: ${GMAIL_USER}`);

// Configurar transporter de Gmail
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

// Función para enviar email con Gmail
async function sendGmailReminder(appointment, reminderType) {
  const { pet, tutor, user: professional } = appointment;
  
  console.log(`📧 Enviando recordatorio ${reminderType} DUAL vía Gmail para: ${pet.name}`);
  
  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = appointmentDate.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const timeLabel = reminderType === '24h' ? 'mañana' : 'en 1 hora';
  const urgencyColor = reminderType === '24h' ? '#667eea' : '#ff6b6b';

  // EMAIL PARA EL PROFESIONAL
  const professionalSubject = `👨‍⚕️ ${CLINIC_NAME} - Recordatorio: Cita ${timeLabel} - ${pet.name} (${tutor.name})`;
  const professionalHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 ${CLINIC_NAME}</h1>
        <p style="color: white; margin: 5px 0 0 0;">Panel Profesional - Recordatorio de Cita</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Hola Dr/a ${professional.fullName || 'Profesional'},</h2>
        
        <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #2c5aa0; font-size: 18px;">
            <strong>📅 Tienes una cita ${timeLabel}</strong>
          </p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 15px 0; color: #333;">📋 Detalles de la Cita:</h3>
          <table style="width: 100%; color: #666;">
            <tr><td style="padding: 5px 0;"><strong>🐾 Mascota:</strong></td><td>${pet.name} (${pet.type})</td></tr>
            <tr><td style="padding: 5px 0;"><strong>👤 Cliente:</strong></td><td>${tutor.name}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>📞 Teléfono:</strong></td><td>${tutor.phone || 'No registrado'}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>📧 Email:</strong></td><td>${tutor.email}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>📅 Fecha:</strong></td><td>${formattedDate}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>🕒 Hora:</strong></td><td>${formattedTime}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>📝 Motivo:</strong></td><td>${appointment.reason}</td></tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://veterinaria-p918.vercel.app/dashboard" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            🖥️ Ver en Dashboard
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>📧 Email enviado desde: ${GMAIL_USER}</p>
          <p>🏥 ${CLINIC_NAME}</p>
        </div>
      </div>
    </div>
  `;

  // EMAIL PARA EL CLIENTE
  const clientSubject = `🐾 ${CLINIC_NAME} - Recordatorio: Cita veterinaria ${timeLabel} - ${pet.name}`;
  const clientHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🐾 ${CLINIC_NAME}</h1>
        <p style="color: white; margin: 5px 0 0 0;">Recordatorio de cita veterinaria</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">¡Hola ${tutor.name}!</h2>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
          <p style="margin: 0; color: #856404; font-size: 18px; text-align: center;">
            <strong>🕒 La cita de ${pet.name} es ${timeLabel}</strong>
          </p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 15px 0; color: #333;">📋 Detalles de la Cita:</h3>
          <table style="width: 100%; color: #666;">
            <tr><td style="padding: 5px 0;"><strong>🐾 Mascota:</strong></td><td>${pet.name}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>📅 Fecha:</strong></td><td>${formattedDate}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>🕒 Hora:</strong></td><td>${formattedTime}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>📝 Motivo:</strong></td><td>${appointment.reason}</td></tr>
          </table>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #2d5a2d;">💡 Recordatorios importantes:</h4>
          <ul style="margin: 10px 0; color: #4a5a4a; padding-left: 20px;">
            <li>Llega 10 minutos antes de tu cita</li>
            <li>Trae la cartilla de vacunación de ${pet.name}</li>
            <li>Si necesitas cancelar, avísanos con anticipación</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666; font-size: 16px;">
            ¡Esperamos ver a ${pet.name} pronto! 🐾❤️
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>📧 Si tienes dudas, responde a este email</p>
          <p>🏥 ${CLINIC_NAME} - ${GMAIL_USER}</p>
        </div>
      </div>
    </div>
  `;

  let successCount = 0;

  try {
    // Enviar email al PROFESIONAL
    console.log(`👨‍⚕️ Enviando a profesional: ${professional.email}`);
    await gmailTransporter.sendMail({
      from: `${CLINIC_NAME} <${GMAIL_USER}>`,
      to: professional.email,
      subject: professionalSubject,
      html: professionalHtml
    });
    console.log(`✅ Email enviado al profesional exitosamente`);
    successCount++;

    // Pequeña pausa para evitar rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Enviar email al CLIENTE
    console.log(`👤 Enviando a cliente: ${tutor.email}`);
    await gmailTransporter.sendMail({
      from: `${CLINIC_NAME} <${GMAIL_USER}>`,
      to: tutor.email,
      subject: clientSubject,
      html: clientHtml
    });
    console.log(`✅ Email enviado al cliente exitosamente`);
    successCount++;

    return successCount > 0;

  } catch (error) {
    console.error(`❌ Error enviando emails: ${error.message}`);
    return false;
  }
}

// Procesar recordatorios de 24 horas con Gmail
async function processGmail24HourReminders() {
  console.log('🔍 Buscando citas para recordatorio de 24 horas (Gmail)...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  
  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: tomorrow,
        lt: dayAfterTomorrow
      },
      reminder24hSent: false,
      status: 'confirmed'
    },
    include: {
      pet: true,
      tutor: true,
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          clinicName: true,
          professionalTitle: true
        }
      }
    }
  });
  
  console.log(`📋 Encontradas ${appointments.length} citas para recordatorio de 24h`);
  
  for (const appointment of appointments) {
    const success = await sendGmailReminder(appointment, '24h');
    
    if (success) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          reminder24hSent: true,
          reminder24hSentAt: new Date()
        }
      });
      console.log(`✅ Recordatorio 24h Gmail procesado para ${appointment.tutor.name} - ${appointment.pet.name}`);
    }
    
    // Pausa entre emails para ser amigable con Gmail
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Procesar recordatorios de 1 hora con Gmail
async function processGmail1HourReminders() {
  console.log('🔍 Buscando citas para recordatorio de 1 hora (Gmail)...');
  
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: oneHourFromNow,
        lt: twoHoursFromNow
      },
      reminder1hSent: false,
      status: 'confirmed'
    },
    include: {
      pet: true,
      tutor: true,
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          clinicName: true,
          professionalTitle: true
        }
      }
    }
  });
  
  console.log(`📋 Encontradas ${appointments.length} citas para recordatorio de 1h`);
  
  for (const appointment of appointments) {
    const success = await sendGmailReminder(appointment, '1h');
    
    if (success) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          reminder1hSent: true,
          reminder1hSentAt: new Date()
        }
      });
      console.log(`✅ Recordatorio 1h Gmail procesado para ${appointment.tutor.name} - ${appointment.pet.name}`);
    }
    
    // Pausa entre emails para ser amigable con Gmail
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Función principal para procesar todos los recordatorios con Gmail
async function processGmailReminders() {
  console.log('🚀 Iniciando procesamiento de recordatorios con Gmail SMTP...');
  
  await processGmail24HourReminders();
  await processGmail1HourReminders();
  
  console.log('✅ Procesamiento de recordatorios Gmail completado');
}

export { sendGmailReminder, processGmailReminders, gmailTransporter, prisma };