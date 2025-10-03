-- AlterTable
ALTER TABLE "public"."Client" ALTER COLUMN "uf" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "public"."VisitInstance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startHour" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "notes" TEXT,
    "planId" TEXT,
    "technicianId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitInstance_date_technicianId_idx" ON "public"."VisitInstance"("date", "technicianId");

-- AddForeignKey
ALTER TABLE "public"."VisitInstance" ADD CONSTRAINT "VisitInstance_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."VisitPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitInstance" ADD CONSTRAINT "VisitInstance_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitInstance" ADD CONSTRAINT "VisitInstance_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
