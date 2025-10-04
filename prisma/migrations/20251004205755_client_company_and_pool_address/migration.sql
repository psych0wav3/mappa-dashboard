/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "poolCep" TEXT,
ADD COLUMN     "poolCity" TEXT,
ADD COLUMN     "poolDistrict" TEXT,
ADD COLUMN     "poolNumber" TEXT,
ADD COLUMN     "poolStreet" TEXT,
ADD COLUMN     "poolUf" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_cnpj_key" ON "Client"("cnpj");

-- CreateIndex
CREATE INDEX "Client_city_idx" ON "Client"("city");

-- CreateIndex
CREATE INDEX "Client_poolCity_idx" ON "Client"("poolCity");
