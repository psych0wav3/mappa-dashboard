// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Garante que o tipo do global aceite undefined (evita erros no hot-reload)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Preferimos o host direto (5432) em dev para evitar P1001/PGBouncer.
// Em produção você pode manter DATABASE_URL (pooler 6543).
const datasourceUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
    // 👇 força o Prisma Client a conectar usando a URL escolhida acima
    datasourceUrl,
  });

// Mantém uma instância única em dev
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
