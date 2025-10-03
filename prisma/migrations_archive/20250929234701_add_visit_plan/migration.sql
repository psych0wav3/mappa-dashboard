-- CreateTable
CREATE TABLE "public"."VisitPlan" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "weekdays" INTEGER[],
    "windowStart" INTEGER NOT NULL,
    "windowEnd" INTEGER NOT NULL,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."VisitPlan" ADD CONSTRAINT "VisitPlan_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitPlan" ADD CONSTRAINT "VisitPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
