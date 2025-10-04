-- ===== Migração enxuta: apenas papel/cargo de técnico =====

-- 1) Enum "TechnicianRole" (cria só se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TechnicianRole') THEN
    CREATE TYPE "TechnicianRole" AS ENUM ('OWNER', 'TECH');
  END IF;
END
$$;

-- 2) Coluna "role" na tabela Technician (só se não existir)
ALTER TABLE "Technician"
  ADD COLUMN IF NOT EXISTS "role" "TechnicianRole" NOT NULL DEFAULT 'TECH';

-- (Opcional) Se quiser garantir que todos os existentes recebam TECH:
-- UPDATE "Technician" SET "role" = 'TECH' WHERE "role" IS NULL;

-- 3) Nada de criar/alterar tabelas de rota aqui.
--    As tabelas/índices/FKs de RouteTemplate/RouteStopTemplate/RouteOccurrence/RouteStopOccurrence
--    já existem (criadas em migrações anteriores). Evitamos P3006 no shadow DB.
