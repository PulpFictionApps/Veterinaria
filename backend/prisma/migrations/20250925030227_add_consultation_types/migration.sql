-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "consultationTypeId" INTEGER;

-- CreateTable
CREATE TABLE "public"."consultation_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."consultation_types" ADD CONSTRAINT "consultation_types_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_consultationTypeId_fkey" FOREIGN KEY ("consultationTypeId") REFERENCES "public"."consultation_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
