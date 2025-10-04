/*
  Warnings:

  - You are about to drop the column `routeOccurrenceId` on the `RouteStopOccurrence` table. All the data in the column will be lost.
  - You are about to drop the column `cep` on the `Technician` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Technician` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Technician` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `Technician` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `Technician` table. All the data in the column will be lost.
  - You are about to drop the column `uf` on the `Technician` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."RouteStopOccurrence" DROP CONSTRAINT "RouteStopOccurrence_routeOccurrenceId_fkey";

-- AlterTable
ALTER TABLE "RouteStopOccurrence" DROP COLUMN "routeOccurrenceId";

-- AlterTable
ALTER TABLE "Technician" DROP COLUMN "cep",
DROP COLUMN "city",
DROP COLUMN "district",
DROP COLUMN "number",
DROP COLUMN "street",
DROP COLUMN "uf";

-- AddForeignKey
ALTER TABLE "RouteOccurrence" ADD CONSTRAINT "RouteOccurrence_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RouteTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStopOccurrence" ADD CONSTRAINT "RouteStopOccurrence_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "RouteOccurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
