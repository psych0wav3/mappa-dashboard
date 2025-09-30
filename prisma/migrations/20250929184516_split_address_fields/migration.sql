/*
  Warnings:

  - You are about to drop the column `address` on the `Technician` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Technician" DROP COLUMN "address",
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "uf" TEXT;
