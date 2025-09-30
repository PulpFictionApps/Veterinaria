import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Configuración Gmail SMTP (consistente con appointment-confirmation-service.js)
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const CLINIC_NAME = process.env.CLINIC_NAME || 'MyVetAgenda - Clínica Veterinaria';

// Configurar transporter de Gmail
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

console.log('📧 Sistema de Recordatorios Gmail cargado');

/**
 * Envía recordatorio por email usando Gmail SMTP
 */
async function sendEmailReminder(appointment, reminderType) {
  try {
    const { tutor, pet, date } = appointment;
    
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.log('⚠️  Credenciales de Gmail no configuradas - saltando Email');
      return false;
    }

    if (!tutor.email) {
      console.log(`⚠️  Cliente ${tutor.name} no tiene email configurado`);
      return false;
    }

    const appointmentDate = new Date(date);
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

    let subject = '';
    let htmlContent = '';

    if (reminderType === '24h') {
      subject = `🐾 Recordatorio: Cita veterinaria mañana - ${pet.name}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🐾 VetCare</h1>
            <p style="color: white; margin: 5px 0 0 0;">Recordatorio de cita veterinaria</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">¡Hola ${tutor.name}!</h2>
            
            <p style="color: #666; font-size: 16px;">
              Te recordamos que tienes una cita veterinaria programada para <strong>mañana</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 10px 0; color: #333;">📅 Detalles de la cita:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Fecha:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Hora:</strong> ${formattedTime}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Mascota:</strong> ${pet.name}</p>
            </div>
            
            <p style="color: #666;">
              <strong>⏰ Por favor, llega 10 minutos antes de tu cita.</strong>
            </p>
            
            <p style="color: #666;">
              ¡Te esperamos! 🏥
            </p>
          </div>
        </div>
      `;
    } else if (reminderType === '1h') {
      subject = `🚨 Tu cita es en 1 hora - ${pet.name}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🐾 VetCare</h1>
            <p style="color: white; margin: 5px 0 0 0;">¡Tu cita es muy pronto!</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">¡Hola ${tutor.name}!</h2>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
              <p style="margin: 0; color: #856404; font-size: 18px; text-align: center;">
                <strong>🕒 Tu cita es HOY a las ${formattedTime}</strong>
              </p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">📋 Recordatorio:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Mascota:</strong> ${pet.name}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Hora:</strong> ${formattedTime}</p>
            </div>
            
            <p style="color: #666; text-align: center; font-size: 16px;">
              <strong>¡No olvides llegar puntual! ⏰</strong>
            </p>
            
            <p style="color: #666; text-align: center;">
              Nos vemos pronto 🏥
            </p>
          </div>
        </div>
      `;
    }

    // Enviar email usando Gmail SMTP
    const mailOptions = {
      from: `"${CLINIC_NAME}" <${GMAIL_USER}>`,
      to: tutor.email,
      subject: subject,
      html: htmlContent
    };

    await gmailTransporter.sendMail(mailOptions);
    console.log(`✅ Recordatorio enviado por Gmail a ${tutor.name} (${tutor.email})`);
    return true;

  } catch (error) {
    console.error(`❌ Error enviando email a ${appointment.tutor.name}:`, error.message);
    return false;
  }
}

/**
 * Procesa recordatorios de 24 horas
 */
async function process24HourReminders() {
  try {
    console.log('🔍 Buscando citas para recordatorio de 24 horas...');

    // Calcular fecha de mañana (24 horas desde ahora)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Buscar citas que sean mañana y que no hayan recibido recordatorio de 24h
    const appointmentsIn24h = await prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
          lt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1)
        },
        reminder24hSent: false,
        status: {
          not: 'cancelled'
        }
      },
      include: {
        tutor: true,
        pet: true,
        user: {
          select: {
            enableEmailReminders: true
          }
        }
      }
    });

    console.log(`📋 Encontradas ${appointmentsIn24h.length} citas para recordatorio de 24h`);

    for (const appointment of appointmentsIn24h) {
      let emailSent = false;

      // Enviar Email si está habilitado
      if (appointment.user.enableEmailReminders) {
        emailSent = await sendEmailReminder(appointment, '24h');
      }

      // Marcar como enviado
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          reminder24hSent: true,
          reminder24hSentAt: new Date()
        }
      });

      console.log(`✅ Recordatorio 24h procesado para ${appointment.tutor.name} - ${appointment.pet.name}`);
    }

  } catch (error) {
    console.error('❌ Error procesando recordatorios de 24h:', error);
  }
}

/**
 * Procesa recordatorios de 1 hora
 */
async function process1HourReminders() {
  try {
    console.log('🔍 Buscando citas para recordatorio de 1 hora...');

    // Calcular rango de 1 hora desde ahora
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Buscar citas que sean en 1 hora (±15 min) y que no hayan recibido recordatorio de 1h
    const appointmentsIn1h = await prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(inOneHour.getTime() - 15 * 60 * 1000), // 15 min antes
          lte: new Date(inOneHour.getTime() + 15 * 60 * 1000)  // 15 min después
        },
        reminder1hSent: false,
        status: {
          not: 'cancelled'
        }
      },
      include: {
        tutor: true,
        pet: true,
        user: {
          select: {
            enableEmailReminders: true
          }
        }
      }
    });

    console.log(`📋 Encontradas ${appointmentsIn1h.length} citas para recordatorio de 1h`);

    for (const appointment of appointmentsIn1h) {
      let emailSent = false;

      // Enviar Email si está habilitado
      if (appointment.user.enableEmailReminders) {
        emailSent = await sendEmailReminder(appointment, '1h');
      }

      // Marcar como enviado
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          reminder1hSent: true,
          reminder1hSentAt: new Date()
        }
      });

      console.log(`✅ Recordatorio 1h procesado para ${appointment.tutor.name} - ${appointment.pet.name}`);
    }

  } catch (error) {
    console.error('❌ Error procesando recordatorios de 1h:', error);
  }
}

/**
 * Función principal que ejecuta ambos tipos de recordatorios
 */
export async function processReminders() {
  console.log('🚀 Iniciando procesamiento de recordatorios...');
  
  await process24HourReminders();
  await process1HourReminders();
  
  console.log('✅ Procesamiento de recordatorios completado');
}

export { sendEmailReminder };
