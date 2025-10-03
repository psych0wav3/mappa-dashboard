-- Garante que a FK antiga não atrapalha
ALTER TABLE "public"."VisitInstance" DROP CONSTRAINT IF EXISTS "VisitInstance_planId_fkey";

-- Recria a FK com CASCADE
ALTER TABLE "public"."VisitInstance"
ADD CONSTRAINT "VisitInstance_planId_fkey"
FOREIGN KEY ("planId") REFERENCES "public"."VisitPlan"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Índice em planId (idempotente)
CREATE INDEX IF NOT EXISTS "VisitInstance_planId_idx" ON "public"."VisitInstance"("planId");
