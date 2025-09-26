-- Add prescription PDF fields to User table
ALTER TABLE "User" 
ADD COLUMN "prescriptionHeader" TEXT,
ADD COLUMN "prescriptionFooter" TEXT;