// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { admin, openAPI } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    debugLogs: true,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // 👇 Campos extras
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false, // não vem do client
      },
    },
  },

  // 👇 Define o role na criação do usuário
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // ADMIN_EMAILS="lerichter.c@gmail.com,outro@admin.com"
          const adminEmails =
            process.env.ADMIN_EMAILS?.split(",")
              .map((e) => e.trim())
              .filter(Boolean) ?? [];

          const role = adminEmails.includes(user.email)
            ? "ADMIN"
            : "VIEWER"; // padrão

          return {
            data: {
              ...user,
              role,
            },
          };
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutos
    },
  },

  plugins: [
    openAPI({
      path: "/reference",
      disableDefaultReference: false,
    }),
    admin(),
  ],
});

// ------------------------------
// Supabase helpers antigos
// ------------------------------
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Lê o Authorization: Bearer <jwt> e resolve o usuário do Supabase. */
export async function getUserFromAuth(req: Request) {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
}

/** Resolve o technicianId a partir de user ou emailOverride */
export async function getTechnicianIdForUser(
  user?: { id: string; email?: string | null },
  emailOverride?: string | null,
) {
  if (user?.id) {
    const t = await prisma.technician.findUnique({ where: { userId: user.id } });
    if (t) return t.id;
  }

  const email = emailOverride ?? user?.email ?? null;
  if (email) {
    const t = await prisma.technician.findUnique({ where: { email } });
    if (t) return t.id;
  }

  return null;
}

export async function getUserFromBearer(_authHeader?: string | null) {
  // TODO: implementar de verdade quando definir o fluxo de bearer token.
  // Por enquanto, só retorna null para não quebrar o build.
  return null;
}