-- AlterTable
ALTER TABLE "public"."Pet" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "sex" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."Tutor" ADD COLUMN     "address" TEXT,
ADD COLUMN     "rut" TEXT;
