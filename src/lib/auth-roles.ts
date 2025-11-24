// src/lib/auth-roles.ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { User } from "better-auth";

export type AppUser = User & {
  role?: string | null;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (session?.user as AppUser) ?? null;
}

/**
 * Garante que existe usuário logado.
 * Se não houver, redireciona para /login com redirectTo=/dashboard.
 */
export async function requireSession() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }
  return user;
}

/**
 * Garante que o usuário tem um dos roles informados.
 * Se não tiver, redireciona para /dashboard.
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await requireSession();

  const role = (user.role || "").toUpperCase();
  const ok = allowedRoles.map((r) => r.toUpperCase()).includes(role);

  if (!ok) {
    redirect("/dashboard");
  }

  return user;
}
