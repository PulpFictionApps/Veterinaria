// Script para diagnosticar el sistema de emails en producción
import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function diagnoseEmailSystem() {
  console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE EMAILS EN PRODUCCIÓN');
  console.log('='.repeat(60));
  
  // 1. Verificar variables de entorno
  console.log('\n1. VARIABLES DE ENTORNO:');
  console.log(`   GMAIL_USER: ${process.env.GMAIL_USER ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
  console.log(`   GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
  console.log(`   CLINIC_NAME: ${process.env.CLINIC_NAME || 'Default: MyVetAgenda - Clínica Veterinaria'}`);
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('\n❌ PROBLEMA ENCONTRADO: Credenciales de Gmail no configuradas');
    console.log('   Solución: Configurar GMAIL_USER y GMAIL_APP_PASSWORD en las variables de entorno del servidor');
    return;
  }
  
  // 2. Probar conexión SMTP
  console.log('\n2. PRUEBA DE CONEXIÓN SMTP:');
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
    
    await transporter.verify();
    console.log('   ✅ Conexión SMTP exitosa');
  } catch (error) {
    console.log('   ❌ Error de conexión SMTP:', error.message);
    return;
  }
  
  // 3. Verificar últimas citas creadas
  console.log('\n3. ÚLTIMAS CITAS CREADAS:');
  try {
    const recentAppointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        tutor: { select: { name: true, email: true } },
        pet: { select: { name: true } },
        user: { select: { fullName: true, clinicName: true } }
      }
    });
    
    if (recentAppointments.length === 0) {
      console.log('   ℹ️ No hay citas recientes');
    } else {
      recentAppointments.forEach((app, i) => {
        console.log(`   ${i + 1}. ID: ${app.id} | ${app.tutor.name} (${app.tutor.email}) | ${app.pet.name} | ${new Date(app.createdAt).toLocaleString('es-CL')}`);
      });
    }
  } catch (error) {
    console.log('   ❌ Error consultando BD:', error.message);
  }
  
  // 4. Recomendaciones
  console.log('\n4. RECOMENDACIONES PARA DEBUGGING:');
  console.log('   - Revisar logs del servidor durante creación de citas');
  console.log('   - Buscar mensajes con [CONFIRMACIÓN] en los logs');
  console.log('   - Verificar que no haya errores de SMTP en los logs');
  console.log('   - Comprobar carpeta de spam en los emails de destino');
  
  console.log('\n✅ Diagnóstico completado');
}

diagnoseEmailSystem()
  .catch(console.error)
  .finally(() => prisma.$disconnect());