/*
  Warnings:

  - Added the required column `dosage` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frequency` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medication` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Prescription" ADD COLUMN     "dosage" TEXT NOT NULL,
ADD COLUMN     "duration" TEXT NOT NULL,
ADD COLUMN     "frequency" TEXT NOT NULL,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "medication" TEXT NOT NULL,
ADD COLUMN     "pdfPath" TEXT;
