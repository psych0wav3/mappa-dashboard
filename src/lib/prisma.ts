// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Garante que o tipo do global aceite undefined (evita erros no hot-reload)
declare global {
   
  var prisma: PrismaClient | undefined;
}

// Preferimos o host direto (5432) em dev para evitar P1001/PGBouncer.
// Em produção você pode manter DATABASE_URL (pooler 6543).
const datasourceUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}



//pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities