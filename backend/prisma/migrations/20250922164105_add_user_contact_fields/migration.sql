-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "accountType" TEXT NOT NULL DEFAULT 'client',
ADD COLUMN     "clinicName" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "phone" TEXT;
