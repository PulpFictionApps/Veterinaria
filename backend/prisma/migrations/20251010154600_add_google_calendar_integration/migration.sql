/*
  Warnings:

  - A unique constraint covering the columns `[googleCalendarEventId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "googleCalendarEventId" TEXT;

-- CreateTable
CREATE TABLE "public"."GoogleCalendarCredential" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "scope" TEXT,
    "tokenType" TEXT,
    "expiryDate" TIMESTAMP(3),
    "calendarId" TEXT DEFAULT 'primary',
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleCalendarCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarCredential_userId_key" ON "public"."GoogleCalendarCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_googleCalendarEventId_key" ON "public"."Appointment"("googleCalendarEventId");

-- AddForeignKey
ALTER TABLE "public"."GoogleCalendarCredential" ADD CONSTRAINT "GoogleCalendarCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
