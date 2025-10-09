/*
  Warnings:

  - A unique constraint covering the columns `[userId,start,end]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Availability_userId_start_end_key" ON "public"."Availability"("userId", "start", "end");
