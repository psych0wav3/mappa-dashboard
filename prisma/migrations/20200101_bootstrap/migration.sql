-- CreateEnum
CREATE TYPE "ServiceFrequency" AS ENUM ('ONCE', 'WEEKLY', 'BIWEEKLY_A', 'BIWEEKLY_B', 'MONTHLY_DAY', 'MONTHLY_NTHWEEK');

-- CreateEnum
CREATE TYPE "EndCondition" AS ENUM ('NO_END', 'AFTER_OCCURRENCES', 'END_DATE');

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "cpf" TEXT,
    "street" TEXT,
    "number" TEXT,
    "district" TEXT,
    "city" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "poolSize" TEXT,
    "cleaningFrequency" INTEGER,
    "cleaningWindow" TEXT,
    "payDay" INTEGER,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technician" (
    "id" TEXT NOT NULL,
    "userId" UUID,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "cpf" TEXT,
    "street" TEXT,
    "number" TEXT,
    "district" TEXT,
    "city" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "phone_digits" TEXT,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "clientId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitPlan" (
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

-- CreateTable
CREATE TABLE "VisitInstance" (
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

-- CreateTable
CREATE TABLE "RouteTemplate" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "frequency" "ServiceFrequency" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endCondition" "EndCondition" NOT NULL,
    "endAfter" INTEGER,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStopTemplate" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "clientId" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 30,
    "windowStart" TIMESTAMP(3),
    "windowEnd" TIMESTAMP(3),
    "note" TEXT,
    "clientLat" DOUBLE PRECISION,
    "clientLng" DOUBLE PRECISION,
    "addressLine" TEXT,

    CONSTRAINT "RouteStopTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteOccurrence" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "optimizedAt" TIMESTAMP(3),
    "distanceKm" DOUBLE PRECISION,
    "durationMin" INTEGER,

    CONSTRAINT "RouteOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStopOccurrence" (
    "id" TEXT NOT NULL,
    "occurrenceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "clientId" TEXT NOT NULL,
    "eta" TIMESTAMP(3),
    "etd" TIMESTAMP(3),
    "travelMinPrev" INTEGER,
    "distanceKmPrev" DOUBLE PRECISION,
    "routeOccurrenceId" TEXT,

    CONSTRAINT "RouteStopOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_phone_key" ON "Client"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Client_cpf_key" ON "Client"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_userId_key" ON "Technician"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_email_key" ON "Technician"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Technician_cpf_key" ON "Technician"("cpf");

-- CreateIndex
CREATE INDEX "Technician_phone_idx" ON "Technician"("phone");

-- CreateIndex
CREATE INDEX "Technician_phone_digits_idx" ON "Technician"("phone_digits");

-- CreateIndex
CREATE INDEX "VisitInstance_date_technicianId_idx" ON "VisitInstance"("date", "technicianId");

-- CreateIndex
CREATE INDEX "VisitInstance_planId_idx" ON "VisitInstance"("planId");

-- CreateIndex
CREATE INDEX "RouteStopTemplate_templateId_order_idx" ON "RouteStopTemplate"("templateId", "order");

-- CreateIndex
CREATE INDEX "RouteOccurrence_templateId_date_idx" ON "RouteOccurrence"("templateId", "date");

-- CreateIndex
CREATE INDEX "RouteStopOccurrence_occurrenceId_order_idx" ON "RouteStopOccurrence"("occurrenceId", "order");

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitPlan" ADD CONSTRAINT "VisitPlan_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitPlan" ADD CONSTRAINT "VisitPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitInstance" ADD CONSTRAINT "VisitInstance_planId_fkey" FOREIGN KEY ("planId") REFERENCES "VisitPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitInstance" ADD CONSTRAINT "VisitInstance_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitInstance" ADD CONSTRAINT "VisitInstance_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStopTemplate" ADD CONSTRAINT "RouteStopTemplate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RouteTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStopOccurrence" ADD CONSTRAINT "RouteStopOccurrence_routeOccurrenceId_fkey" FOREIGN KEY ("routeOccurrenceId") REFERENCES "RouteOccurrence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
