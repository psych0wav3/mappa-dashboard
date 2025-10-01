// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Lê o Authorization: Bearer <jwt> e resolve o usuário do Supabase.
 *  No browser, se não houver header (ex.: testando manualmente),
 *  retornará null e você pode passar `emailOverride` no endpoint para debug.
 */
export async function getUserFromAuth(req: Request) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
}

/** Resolve o technicianId:
 *  1) Se tiver user.id -> Technician.userId
 *  2) Senão, se tiver emailOverride -> Technician.email
 *  3) Senão, se tiver user.email -> Technician.email
 */
export async function getTechnicianIdForUser(
  user?: { id: string; email?: string | null },
  emailOverride?: string | null
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
