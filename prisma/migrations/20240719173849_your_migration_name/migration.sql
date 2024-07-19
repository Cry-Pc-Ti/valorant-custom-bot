/*
  Warnings:

  - The primary key for the `Valorant_User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Valorant_User" DROP CONSTRAINT "Valorant_User_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Valorant_User_pkey" PRIMARY KEY ("id");
