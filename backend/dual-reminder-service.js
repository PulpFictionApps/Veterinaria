import { PrismaClient } from "@prisma/client";
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Configuración de email usando Resend
const EMAIL_API_KEY = process.env.EMAIL_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

console.log('🚀 Sistema de Recordatorios DUALES cargado - Profesional + Cliente');

// Función para enviar recordatorio DUAL (profesional + cliente)
async function sendDualEmailReminder(appointment, reminderType) {
  const { pet, tutor, user: professional } = appointment;
  
  console.log(`📧 Enviando recordatorio ${reminderType} DUAL para cita: ${pet.name}`);
  
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
  const professionalSubject = `👨‍⚕️ Recordatorio: Cita ${timeLabel} - ${pet.name} (${tutor.name})`;
  const professionalHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 Vetrium - Panel Profesional</h1>
        <p style="color: white; margin: 5px 0 0 0;">Recordatorio de cita programada</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">Hola Dr/a ${professional.fullName || 'Profesional'},</h2>
        
        <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #2c5aa0; font-size: 18px;">
            <strong>📅 Tienes una cita ${timeLabel}</strong>
          </p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">📋 Detalles de la Cita:</h3>
          <p style="margin: 5px 0; color: #666;"><strong>🐾 Mascota:</strong> ${pet.name}</p>
          <p style="margin: 5px 0; color: #666;"><strong>👤 Cliente:</strong> ${tutor.name}</p>
          <p style="margin: 5px 0; color: #666;"><strong>📞 Teléfono:</strong> ${tutor.phone || 'No registrado'}</p>
          <p style="margin: 5px 0; color: #666;"><strong>📧 Email:</strong> ${tutor.email}</p>
          <p style="margin: 5px 0; color: #666;"><strong>📅 Fecha:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0; color: #666;"><strong>🕒 Hora:</strong> ${formattedTime}</p>
          <p style="margin: 5px 0; color: #666;"><strong>📝 Motivo:</strong> ${appointment.reason}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://veterinaria-p918.vercel.app/dashboard" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            🖥️ Ver en Dashboard
          </a>
        </div>
      </div>
    </div>
  `;

  // EMAIL PARA EL CLIENTE
  const clientSubject = `🐾 Recordatorio: Cita veterinaria ${timeLabel} - ${pet.name}`;
  const clientHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🐾 Vetrium</h1>
        <p style="color: white; margin: 5px 0 0 0;">Recordatorio de cita veterinaria</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333;">¡Hola ${tutor.name}!</h2>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
          <p style="margin: 0; color: #856404; font-size: 18px; text-align: center;">
            <strong>🕒 La cita de ${pet.name} es ${timeLabel}</strong>
          </p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">📋 Detalles de la Cita:</h3>
          <p style="margin: 5px 0; color: #666;"><strong>🐾 Mascota:</strong> ${pet.name}</p>
          <p style="margin: 5px 0; color: #666;"><strong>📅 Fecha:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0; color: #666;"><strong>🕒 Hora:</strong> ${formattedTime}</p>
          <p style="margin: 5px 0; color: #666;"><strong>📝 Motivo:</strong> ${appointment.reason}</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #2d5a2d;">💡 Recordatorios importantes:</h4>
          <ul style="margin: 0; color: #4a5a4a;">
            <li>Llega 10 minutos antes de tu cita</li>
            <li>Trae la cartilla de vacunación de ${pet.name}</li>
            <li>Si necesitas cancelar, avísanos con anticipación</li>
          </ul>
        </div>
        
        <p style="color: #666; text-align: center; margin: 30px 0;">
          ¡Esperamos ver a ${pet.name} pronto! 🐾❤️
        </p>
      </div>
    </div>
  `;

  let successCount = 0;

  try {
    // Enviar email al PROFESIONAL
    console.log(`👨‍⚕️ Enviando a profesional: ${professional.email}`);
    const professionalResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [professional.email],
        subject: professionalSubject,
        html: professionalHtml
      })
    });

    if (professionalResponse.ok) {
      const result = await professionalResponse.json();
      console.log(`✅ Email enviado al profesional - ID: ${result.id}`);
      successCount++;
    } else {
      const error = await professionalResponse.json();
      console.log(`❌ Error enviando email al profesional: ${error.message}`);
    }

    // Enviar email al CLIENTE (solo si el plan permite o si es el email registrado)
    console.log(`👤 Enviando a cliente: ${tutor.email}`);
    const clientResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [tutor.email],
        subject: clientSubject,
        html: clientHtml
      })
    });

    if (clientResponse.ok) {
      const result = await clientResponse.json();
      console.log(`✅ Email enviado al cliente - ID: ${result.id}`);
      successCount++;
    } else {
      const error = await clientResponse.json();
      console.log(`❌ Error enviando email al cliente: ${error.message}`);
    }

    return successCount > 0; // True si al menos uno se envió exitosamente

  } catch (error) {
    console.error(`❌ Error enviando recordatorios duales: ${error.message}`);
    return false;
  }
}

// Procesar recordatorios de 24 horas
async function process24HourReminders() {
  console.log('🔍 Buscando citas para recordatorio de 24 horas...');
  
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
    const success = await sendDualEmailReminder(appointment, '24h');
    
    if (success) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          reminder24hSent: true,
          reminder24hSentAt: new Date()
        }
      });
      console.log(`✅ Recordatorio 24h procesado para ${appointment.tutor.name} - ${appointment.pet.name}`);
    }
  }
}

// Procesar recordatorios de 1 hora
async function process1HourReminders() {
  console.log('🔍 Buscando citas para recordatorio de 1 hora...');
  
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
    const success = await sendDualEmailReminder(appointment, '1h');
    
    if (success) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          reminder1hSent: true,
          reminder1hSentAt: new Date()
        }
      });
      console.log(`✅ Recordatorio 1h procesado para ${appointment.tutor.name} - ${appointment.pet.name}`);
    }
  }
}

// Función principal para procesar todos los recordatorios
async function processReminders() {
  console.log('🚀 Iniciando procesamiento de recordatorios DUALES...');
  
  await process24HourReminders();
  await process1HourReminders();
  
  console.log('✅ Procesamiento de recordatorios DUALES completado');
}

export { sendDualEmailReminder, processReminders, prisma };