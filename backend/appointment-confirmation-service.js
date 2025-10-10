import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Configuración Gmail SMTP
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const CLINIC_NAME = process.env.CLINIC_NAME || 'MyVetAgenda - Clínica Veterinaria';

console.log('📧 Sistema de Confirmación Automática cargado');

// Configurar transporter de Gmail
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

// Función para enviar confirmación de cita recién agendada
async function sendAppointmentConfirmation(appointmentId) {
  try {
    console.log(`📧 [CONFIRMACIÓN] Iniciando envío para cita ID: ${appointmentId}`);
    
    // Verificar configuración antes de proceder
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error('❌ [CONFIRMACIÓN] Credenciales de Gmail no configuradas');
      return false;
    }
    
    console.log(`📧 [CONFIRMACIÓN] Credenciales Gmail OK, buscando cita en BD...`);

    // Buscar la cita con todos los datos relacionados
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(appointmentId) },
      include: {
        pet: true,
        tutor: true,
        user: {
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
        }
      }
    });

    if (!appointment) {
      console.log('❌ Cita no encontrada');
      return false;
    }

    const { pet, tutor, user: professional } = appointment;

    // Formatear fecha y hora
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

    const daysDiff = Math.ceil((appointmentDate - new Date()) / (1000 * 60 * 60 * 24));
    const timeUntil = daysDiff === 0 ? 'HOY' : daysDiff === 1 ? 'mañana' : `en ${daysDiff} días`;

    // EMAIL PARA EL PROFESIONAL - Nueva cita agendada
    const professionalSubject = `🆕 ${professional.clinicName || professional.fullName || 'Clínica Veterinaria'} - Nueva cita agendada: ${pet.name} (${tutor.name}) - ${timeUntil}`;
    const professionalHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🆕 ${professional.clinicName || professional.fullName || 'Clínica Veterinaria'}</h1>
          <p style="color: white; margin: 5px 0 0 0;">Nueva Cita Agendada</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hola Dr/a ${professional.fullName || 'Profesional'},</h2>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
            <p style="margin: 0; color: #1565C0; font-size: 18px;">
              <strong>📅 Nueva cita agendada para ${timeUntil}</strong>
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px 0; color: #333;">📋 Detalles de la Cita:</h3>
            <table style="width: 100%; color: #666;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>🐾 Mascota:</strong></td><td style="border-bottom: 1px solid #f0f0f0;">${pet.name} (${pet.type}${pet.breed ? ` - ${pet.breed}` : ''})</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>👤 Cliente:</strong></td><td style="border-bottom: 1px solid #f0f0f0;">${tutor.name}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>📞 Teléfono:</strong></td><td style="border-bottom: 1px solid #f0f0f0;">${tutor.phone || 'No registrado'}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>📧 Email:</strong></td><td style="border-bottom: 1px solid #f0f0f0;">${tutor.email}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>📅 Fecha:</strong></td><td style="border-bottom: 1px solid #f0f0f0;">${formattedDate}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>🕒 Hora:</strong></td><td style="border-bottom: 1px solid #f0f0f0;">${formattedTime}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>📝 Motivo:</strong></td><td>${appointment.reason}</td></tr>
            </table>
            <p style="margin: 18px 0 0 0; color: #1b5e20; font-size: 14px;">
              📌 Si ya conectaste Google Calendar en tu Dashboard, esta cita se añadió automáticamente y el cliente recibió una invitación para aceptarla.
            </p>
          </div>

          ${pet.age || pet.weight ? `
          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #ef6c00;">🐾 Información adicional de ${pet.name}:</h4>
            <ul style="margin: 10px 0; color: #bf360c; padding-left: 20px;">
              ${pet.age ? `<li><strong>Edad:</strong> ${pet.age} años</li>` : ''}
              ${pet.weight ? `<li><strong>Peso:</strong> ${pet.weight} kg</li>` : ''}
              ${pet.sex ? `<li><strong>Sexo:</strong> ${pet.sex}</li>` : ''}
            </ul>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://veterinaria-p918.vercel.app/dashboard" 
               style="background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              🖥️ Ver en Dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>📧 Cita agendada automáticamente desde: ${GMAIL_USER}</p>
            <p>🏥 ${professional.clinicName || professional.fullName || 'Clínica Veterinaria'}</p>
          </div>
        </div>
      </div>
    `;

    // EMAIL PARA EL CLIENTE - Confirmación de cita
    const clientSubject = `✅ ${professional.clinicName || professional.fullName || 'Clínica Veterinaria'} - ¡Cita confirmada! ${pet.name} el ${formattedDate}`;
    const clientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ ${professional.clinicName || professional.fullName || 'Clínica Veterinaria'}</h1>
          <p style="color: white; margin: 5px 0 0 0;">¡Cita Confirmada!</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">¡Hola ${tutor.name}!</h2>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #4CAF50;">
            <p style="margin: 0; color: #2e7d32; font-size: 18px; text-align: center;">
              <strong>🎉 ¡Tu cita ha sido confirmada exitosamente!</strong>
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px 0; color: #333;">📋 Detalles de tu Cita:</h3>
            <table style="width: 100%; color: #666;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>🐾 Mascota:</strong></td><td style="border-bottom: 1px solid #f0f0f0;">${pet.name}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>📅 Fecha:</strong></td><td style="border-bottom: 1px solid #f0f0f0;">${formattedDate}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>🕒 Hora:</strong></td><td style="border-bottom: 1px solid #f0f0f0;">${formattedTime}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>📝 Motivo:</strong></td><td>${appointment.reason}</td></tr>
            </table>
            <p style="margin: 18px 0 0 0; color: #1b5e20; font-size: 14px;">
              📆 Revisa tu bandeja de entrada: también recibirás una invitación de Google Calendar para agregar la cita con un clic.
            </p>
          </div>
          
          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #ef6c00;">📝 Instrucciones importantes:</h4>
            <div style="margin: 10px 0; color: #bf360c; line-height: 1.6;">
              ${professional.appointmentInstructions ? 
                professional.appointmentInstructions
                  .split('\n')
                  .map(instruction => `<p style="margin: 5px 0;"><strong>${instruction.split(':')[0]}:</strong> ${instruction.split(':').slice(1).join(':').trim()}</p>`)
                  .join('') :
                `<ul style="padding-left: 20px;">
                  <li><strong>Llegada:</strong> Por favor llega 10-15 minutos antes de tu cita</li>
                  <li><strong>Documentos:</strong> Trae la cartilla de vacunación de ${pet.name}</li>
                  <li><strong>Ayuno:</strong> Si es necesario, te contactaremos para indicar ayuno</li>
                  <li><strong>Cambios:</strong> Si necesitas reprogramar, contáctanos con anticipación</li>
                </ul>`
              }
            </div>
          </div>

          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1565C0;">📍 Información de contacto:</h4>
            <p style="margin: 5px 0; color: #1976D2;"><strong>�‍⚕️ Profesional:</strong> ${professional.fullName || 'Dr/a'}</p>
            <p style="margin: 5px 0; color: #1976D2;"><strong>�📧 Email:</strong> ${professional.contactEmail || professional.email}</p>
            ${(professional.contactPhone || professional.professionalPhone) ? `<p style="margin: 5px 0; color: #1976D2;"><strong>📞 Teléfono:</strong> ${professional.contactPhone || professional.professionalPhone}</p>` : ''}
            ${professional.clinicAddress ? `<p style="margin: 5px 0; color: #1976D2;"><strong>📍 Dirección:</strong> ${professional.clinicAddress}</p>` : ''}
            ${professional.clinicName ? `<p style="margin: 5px 0; color: #1976D2;"><strong>🏥 Clínica:</strong> ${professional.clinicName}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 16px;">
              ¡Esperamos ver a ${pet.name} pronto! 🐾❤️
            </p>
            <p style="color: #999; font-size: 14px;">
              <em>Recibirás recordatorios automáticos 24h y 1h antes de tu cita</em>
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>📧 Si tienes dudas, responde a este email</p>
            <p>🏥 ${professional.clinicName || professional.fullName || 'Clínica Veterinaria'} - ${professional.contactEmail || professional.email}</p>
          </div>
        </div>
      </div>
    `;

    let successCount = 0;

    try {
      // Enviar email al PROFESIONAL
      console.log(`👨‍⚕️ [CONFIRMACIÓN] Enviando email a profesional: ${professional.email}`);
      console.log(`📝 [CONFIRMACIÓN] From: ${professional.clinicName || professional.fullName || 'Clínica Veterinaria'} <${GMAIL_USER}>`);
      
      await gmailTransporter.sendMail({
        from: `${professional.clinicName || professional.fullName || 'Clínica Veterinaria'} <${GMAIL_USER}>`,
        to: professional.email,
        subject: professionalSubject,
        html: professionalHtml
      });
      console.log(`✅ [CONFIRMACIÓN] Email al profesional enviado exitosamente`);
      successCount++;

      // Pausa para evitar rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Enviar email al CLIENTE
      console.log(`👤 [CONFIRMACIÓN] Enviando email a cliente: ${tutor.email}`);
      await gmailTransporter.sendMail({
        from: `${professional.clinicName || professional.fullName || 'Clínica Veterinaria'} <${GMAIL_USER}>`,
        to: tutor.email,
        subject: clientSubject,
        html: clientHtml
      });
      console.log(`✅ [CONFIRMACIÓN] Email al cliente enviado exitosamente`);
      successCount++;

      console.log(`🎉 [CONFIRMACIÓN] Proceso completado: ${successCount} emails enviados`);
      return true;

    } catch (error) {
      console.error(`❌ [CONFIRMACIÓN] Error enviando emails: ${error.message}`);
      console.error(`❌ [CONFIRMACIÓN] Stack trace:`, error.stack);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error en sendAppointmentConfirmation: ${error.message}`);
    return false;
  }
}

export { sendAppointmentConfirmation, gmailTransporter, prisma };