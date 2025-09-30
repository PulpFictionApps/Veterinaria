-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "appointmentInstructions" TEXT DEFAULT 'Llegada: Por favor llega 10-15 minutos antes de tu cita
Documentos: Trae la cartilla de vacunación de tu mascota
Ayuno: Si es necesario, te contactaremos para indicar ayuno
Cambios: Si necesitas reprogramar, contáctanos con anticipación',
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT;
