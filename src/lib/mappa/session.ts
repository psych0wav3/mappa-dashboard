export const SESSION_KEYS = {
  token: "mappa_access_token",
  companyId: "mappa_company_id",
  companyName: "mappa_company_name",
  user: "mappa_user",
  roles: "mappa_roles",
  role: "mappa_role",
} as const;

export type AppRole =
  | "SUPER_ADMIN"
  | "COMPANY_ADMIN"
  | "EMPLOYEE"
  | "CUSTOMER"
  | string;

export function normalizeRole(
  role: unknown,
): string {
  return String(role ?? "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .toUpperCase();
}

export function isSuperAdminRole(
  role: unknown,
): boolean {
  const normalized = normalizeRole(role);
  return (
    normalized === "SUPER_ADMIN" ||
    normalized === "SUPERADMIN"
  );
}

export function setSessionCookie(
  name: string,
  value: string,
) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie =
    `${name}=${encodeURIComponent(value)}; ` +
    "Path=/; " +
    "Max-Age=86400; " +
    "SameSite=Lax";
}

export function clearSessionCookie(
  name: string,
) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie =
    `${name}=; Path=/; Max-Age=0; ` +
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}

export function getClientRole(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedRole =
    localStorage.getItem(SESSION_KEYS.role);

  if (storedRole) {
    return normalizeRole(storedRole);
  }

  try {
    const raw = localStorage.getItem(
      SESSION_KEYS.user,
    );

    if (!raw) {
      return null;
    }

    const user = JSON.parse(raw) as {
      roles?: Array<{ role?: string; Role?: string }>;
    };

    const role =
      user.roles?.[0]?.role ??
      user.roles?.[0]?.Role;

    return role ? normalizeRole(role) : null;
  } catch {
    return null;
  }
}
