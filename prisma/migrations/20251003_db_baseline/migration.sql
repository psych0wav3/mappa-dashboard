-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "cep" TEXT,
    "city" TEXT,
    "cleaningFrequency" INTEGER,
    "cleaningWindow" TEXT,
    "cpf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "district" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "number" TEXT,
    "payDay" INTEGER,
    "poolSize" TEXT,
    "street" TEXT,
    "uf" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Technician" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "cpf" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cep" TEXT,
    "city" TEXT,
    "district" TEXT,
    "number" TEXT,
    "street" TEXT,
    "uf" TEXT,
    "userId" UUID,
    -- ⚠️ sem DEFAULT que referencia outra coluna
    "phone_digits" TEXT,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Visit" (
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

-- CreateIndex
CREATE UNIQUE INDEX "Client_cpf_key" ON "public"."Client"("cpf" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "public"."Client"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Client_phone_key" ON "public"."Client"("phone" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Technician_cpf_key" ON "public"."Technician"("cpf" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Technician_email_key" ON "public"."Technician"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Technician_userId_key" ON "public"."Technician"("userId" ASC);

-- CreateIndex
CREATE INDEX "idx_technician_phone_digits" ON "public"."Technician"("phone_digits" ASC);

-- CreateIndex
CREATE INDEX "technician_phone_idx" ON "public"."Technician"("phone" ASC);

-- CreateIndex
CREATE INDEX "VisitInstance_date_technicianId_idx" ON "public"."VisitInstance"("date" ASC, "technicianId" ASC);

-- AddForeignKey
ALTER TABLE "public"."Visit" ADD CONSTRAINT "Visit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Visit" ADD CONSTRAINT "Visit_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitInstance" ADD CONSTRAINT "VisitInstance_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitInstance" ADD CONSTRAINT "VisitInstance_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."VisitPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitInstance" ADD CONSTRAINT "VisitInstance_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitPlan" ADD CONSTRAINT "VisitPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitPlan" ADD CONSTRAINT "VisitPlan_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- (Opcional) Backfill phone_digits sem DEFAULT
-- UPDATE "public"."Technician"
-- SET "phone_digits" = regexp_replace(COALESCE("phone", ''), '\D', '', 'g')
-- WHERE "phone_digits" IS NULL;
