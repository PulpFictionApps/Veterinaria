/*
  Warnings:

  - Added the required column `updatedAt` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."MedicalRecord" ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "temperature" DOUBLE PRECISION,
ADD COLUMN     "treatment" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."Pet" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "breed" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Prescription" ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "sendWhatsApp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "whatsappSent" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "pdfUrl" DROP NOT NULL;
