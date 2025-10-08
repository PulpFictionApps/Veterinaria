#!/usr/bin/env node

/**
 * Script de limpieza para pruebas: elimina availability y appointments
 * del profesional identificado por su email.
 *
 * Seguridad: requiere la variable de entorno CONFIRM=true para ejecutar borrados.
 * Uso (PowerShell):
 *   $env:CONFIRM='true'; node wipe-professional-data.js
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function wipe(email) {
  console.log(`Buscando usuario con email: ${email}`);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('Usuario no encontrado. Nada que hacer.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Usuario encontrado: id=${user.id}, email=${user.email}`);

  const confirm = process.env.CONFIRM === 'true' || process.env.CONFIRM === '1';
  if (!confirm) {
    console.log('CONFIRM no establecido a true. Solo mostrando lo que se eliminaría.');

    const toDeleteAvailability = await prisma.availability.count({ where: { userId: user.id } });
    const toDeleteAppointments = await prisma.appointment.count({ where: { userId: user.id } });
    console.log(`Disponibilidad a eliminar: ${toDeleteAvailability}`);
    console.log(`Citas a eliminar: ${toDeleteAppointments}`);
    await prisma.$disconnect();
    return;
  }

  try {
    // Primero eliminar availability
    const delAvailability = await prisma.availability.deleteMany({ where: { userId: user.id } });
    console.log(`Eliminados availability: ${delAvailability.count}`);

    // Luego eliminar appointments
    const delAppointments = await prisma.appointment.deleteMany({ where: { userId: user.id } });
    console.log(`Eliminadas appointments: ${delAppointments.count}`);

    console.log('Limpieza completada.');
  } catch (err) {
    console.error('Error durante la limpieza:', err);
  } finally {
    await prisma.$disconnect();
  }
}

// Email objetivo (según petición)
const TARGET_EMAIL = 'benguriadonosorafael@gmail.com';

wipe(TARGET_EMAIL).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
