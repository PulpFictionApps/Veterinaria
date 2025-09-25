-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "autoEmail" TEXT,
ADD COLUMN     "enableEmailReminders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enableWhatsappReminders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappNumber" TEXT;
