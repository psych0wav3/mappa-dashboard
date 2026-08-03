import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  isSuperAdminRole,
  normalizeRole,
  SESSION_KEYS,
} from "./session";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5264";

type ApiError = {
  errors?: unknown;
  detail?: string;
  title?: string;
  message?: string;
};

type AuthCookies = {
  token: string;
  companyId: string | null;
  role: string | null;
};

type SessionReason =
  | "session-required"
  | "company-required"
  | "session-expired";

function redirectToSessionLogout(
  reason: SessionReason,
): never {
  redirect(
    `/api/auth/session-expired?reason=${encodeURIComponent(
      reason,
    )}`,
  );
}

export async function getAuthFromCookies(): Promise<AuthCookies> {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    SESSION_KEYS.token,
  )?.value;

  const companyId =
    cookieStore.get(SESSION_KEYS.companyId)
      ?.value ?? null;

  const role = normalizeRole(
    cookieStore.get(SESSION_KEYS.role)?.value ??
      "",
  );

  if (!token) {
    redirectToSessionLogout(
      "session-required",
    );
  }

  return {
    token,
    companyId,
    role: role || null,
  };
}

export async function getAccessToken() {
  const { token } = await getAuthFromCookies();
  return token;
}

export const SUPER_ADMIN_COMPANY_REQUIRED =
  "Selecione uma empresa no topo para continuar.";

export async function getCompanyId() {
  const { companyId, role } =
    await getAuthFromCookies();

  if (companyId) {
    return companyId;
  }

  if (isSuperAdminRole(role)) {
    throw new Error(SUPER_ADMIN_COMPANY_REQUIRED);
  }

  redirectToSessionLogout("company-required");
}

function formatValidationErrors(
  errors: unknown,
) {
  if (!errors) {
    return "";
  }

  if (Array.isArray(errors)) {
    return errors
      .map((item) => {
        if (
          typeof item === "object" &&
          item !== null
        ) {
          const record = item as Record<
            string,
            unknown
          >;

          const message =
            record.message ||
            record.errorMessage;

          if (typeof message === "string") {
            return message;
          }
        }

        return String(item);
      })
      .filter(Boolean)
      .join(" ");
  }

  if (typeof errors === "object") {
    return Object.values(
      errors as Record<string, unknown>,
    )
      .flat()
      .map(String)
      .join(" ");
  }

  return String(errors);
}

export async function parseApiError(
  status: number,
  text: string,
) {
  try {
    const json = JSON.parse(text) as ApiError;

    if (Array.isArray(json.errors)) {
      const first = json.errors[0] as
        | Record<string, unknown>
        | string
        | undefined;

      if (typeof first === "string") {
        return first;
      }

      if (
        first &&
        typeof first === "object" &&
        typeof first.message === "string"
      ) {
        return first.message;
      }

      const formatted =
        formatValidationErrors(json.errors);

      if (formatted) {
        return formatted;
      }
    }

    const message =
      json.message ||
      json.detail ||
      json.title;

    if (typeof message === "string" && message) {
      return message;
    }

    return `Erro ${status}: ${text || "Falha na API."}`;
  } catch {
    return `Erro ${status}: ${text || "Falha na API."}`;
  }
}

export async function mappaFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const { token } = await getAuthFromCookies();

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options?.headers || {}),
      },
    },
  );

  if (response.status === 401) {
    redirectToSessionLogout("session-expired");
  }

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      await parseApiError(response.status, text),
    );
  }

  if (response.status === 204 || !text) {
    return null as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      "A API retornou uma resposta inválida.",
    );
  }
}

export function extractItems<T>(
  payload: unknown,
): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "items" in payload &&
    Array.isArray(
      (payload as { items: unknown }).items,
    )
  ) {
    return (payload as { items: T[] }).items;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "Items" in payload &&
    Array.isArray(
      (payload as { Items: unknown }).Items,
    )
  ) {
    return (payload as { Items: T[] }).Items;
  }

  return [];
}

export { API_URL };
