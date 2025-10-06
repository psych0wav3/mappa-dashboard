-- CreateEnum
CREATE TYPE "RouteFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "poolLat" DOUBLE PRECISION,
ADD COLUMN     "poolLng" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "RoutePlan" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "frequency" "RouteFrequency" NOT NULL DEFAULT 'WEEKLY',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutePlanItem" (
    "id" TEXT NOT NULL,
    "routePlanId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "startMinutes" INTEGER NOT NULL,
    "endMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutePlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoutePlan_technicianId_weekday_active_idx" ON "RoutePlan"("technicianId", "weekday", "active");

-- CreateIndex
CREATE INDEX "RoutePlanItem_routePlanId_order_idx" ON "RoutePlanItem"("routePlanId", "order");

-- CreateIndex
CREATE INDEX "Client_poolLat_poolLng_idx" ON "Client"("poolLat", "poolLng");

-- AddForeignKey
ALTER TABLE "RoutePlan" ADD CONSTRAINT "RoutePlan_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutePlanItem" ADD CONSTRAINT "RoutePlanItem_routePlanId_fkey" FOREIGN KEY ("routePlanId") REFERENCES "RoutePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutePlanItem" ADD CONSTRAINT "RoutePlanItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
