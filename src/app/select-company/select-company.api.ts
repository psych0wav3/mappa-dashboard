import { BROWSER_API_BASE } from "@/lib/browser-api";
import { SESSION_KEYS } from "@/lib/mappa/session";

const API_URL = BROWSER_API_BASE;

export type CompanyStatus = "ACTIVE" | "INACTIVE";

export type CompanyItem = {
  id: string;
  name: string;
  tradeName: string | null;
  document: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  status: string | null;
  createdAt: string | null;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  roles?: unknown[];
};

export type CreateCompanyInput = {
  name: string;
  tradeName: string;
  document: string;
  email: string;
  phone: string;
};

export type CreateCompanyAdminInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export type UpdateCompanyInput = {
  name: string;
  tradeName: string;
  document: string;
  email: string;
  phone: string;
};

export type UpdateMyProfileInput = {
  name: string;
  email: string;
  phone: string;
};

export class SelectCompanyApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SelectCompanyApiError";
    this.status = status;
  }
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function readString(
  record: Record<string, unknown>,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string") {
      return value;
    }
  }

  return null;
}

async function readApiError(response: Response) {
  const text = await response.text();

  if (!text) {
    return `Erro ${response.status}.`;
  }

  try {
    const payload = JSON.parse(text) as Record<
      string,
      unknown
    >;

    const message =
      readString(payload, "message", "Message") ||
      readString(payload, "detail", "Detail") ||
      readString(payload, "title", "Title");

    if (message) {
      return message;
    }

    const errors = payload.errors ?? payload.Errors;

    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0];

      if (typeof first === "string") {
        return first;
      }

      if (first && typeof first === "object") {
        const firstRecord = first as Record<
          string,
          unknown
        >;

        const firstMessage =
          readString(
            firstRecord,
            "message",
            "Message",
          ) ||
          readString(
            firstRecord,
            "errorMessage",
            "ErrorMessage",
          );

        if (firstMessage) {
          return firstMessage;
        }
      }
    }
  } catch {}

  return text;
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = localStorage.getItem(SESSION_KEYS.token);

  if (!token) {
    throw new SelectCompanyApiError(
      401,
      "Sessão não encontrada.",
    );
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new SelectCompanyApiError(
      response.status,
      await readApiError(response),
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();

  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

function normalizeCompany(
  value: unknown,
): CompanyItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  const id = readString(record, "id", "Id");
  const name = readString(record, "name", "Name");
  const tradeName = readString(
    record,
    "tradeName",
    "TradeName",
  );

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    tradeName,
    document: readString(
      record,
      "document",
      "Document",
    ),
    email: readString(record, "email", "Email"),
    phone: readString(record, "phone", "Phone"),
    whatsapp: readString(
      record,
      "whatsapp",
      "Whatsapp",
    ),
    status: readString(record, "status", "Status"),
    createdAt: readString(
      record,
      "createdAt",
      "CreatedAt",
    ),
  };
}

function normalizeSessionUser(
  value: unknown,
): SessionUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  const id = readString(record, "id", "Id");
  const name = readString(record, "name", "Name");
  const email = readString(record, "email", "Email");

  if (!id || !name || !email) {
    return null;
  }

  const roles = record.roles ?? record.Roles;

  return {
    id,
    name,
    email,
    phone: readString(record, "phone", "Phone"),
    roles: Array.isArray(roles) ? roles : [],
  };
}

export function getStoredSessionUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(
      SESSION_KEYS.user,
    );

    if (!raw) {
      return null;
    }

    return normalizeSessionUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

function persistSessionUser(user: SessionUser) {
  const current = getStoredSessionUser();

  const next = {
    ...current,
    ...user,
    roles: user.roles?.length
      ? user.roles
      : current?.roles ?? [],
  };

  localStorage.setItem(
    SESSION_KEYS.user,
    JSON.stringify(next),
  );
}

export async function listCompanies(): Promise<
  CompanyItem[]
> {
  const payload =
    await apiFetch<unknown>("/api/companies");

  const rawItems =
    Array.isArray(payload)
      ? payload
      : payload && typeof payload === "object"
        ? ((payload as Record<string, unknown>)
            .items ??
          (payload as Record<string, unknown>)
            .Items)
        : undefined;

  if (!Array.isArray(rawItems)) {
    throw new Error(
      "A API retornou a lista de empresas em formato inválido.",
    );
  }

  const companies = rawItems.map(normalizeCompany);

  if (companies.some((company) => !company)) {
    throw new Error(
      "A API retornou dados inválidos na lista de empresas.",
    );
  }

  return companies as CompanyItem[];
}

export async function getCompanyById(
  companyId: string,
): Promise<CompanyItem> {
  const payload = await apiFetch<unknown>(
    `/api/companies/${companyId}`,
  );

  const company = normalizeCompany(payload);

  if (!company) {
    throw new Error(
      "A API retornou dados inválidos para a empresa.",
    );
  }

  return company;
}

export async function createCompany(
  input: CreateCompanyInput,
): Promise<CompanyItem> {
  const payload = await apiFetch<unknown>(
    "/api/companies",
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name.trim(),
        tradeName:
          input.tradeName.trim() || null,
        document:
          onlyDigits(input.document) || null,
        email:
          input.email.trim().toLowerCase() ||
          null,
        phone:
          onlyDigits(input.phone) || null,
      }),
    },
  );

  const company = normalizeCompany(payload);

  if (!company) {
    throw new Error(
      "A empresa foi criada, mas a API retornou uma resposta inválida.",
    );
  }

  return company;
}

export async function updateCompany(
  companyId: string,
  input: UpdateCompanyInput,
): Promise<CompanyItem> {
  const payload = await apiFetch<unknown>(
    `/api/companies/${companyId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        /*
         * Já deixamos todos os dados preparados.
         *
         * A API atual ainda altera somente:
         * tradeName, email e phone.
         *
         * Quando o Geovane ampliar o PATCH para
         * name/document, o frontend não precisará
         * ser alterado.
         */
        name: input.name.trim(),
        tradeName: input.tradeName.trim(),
        document:
          onlyDigits(input.document) || null,
        email:
          input.email.trim().toLowerCase() ||
          null,
        phone:
          onlyDigits(input.phone) || null,
      }),
    },
  );

  const company = normalizeCompany(payload);

  if (!company) {
    throw new Error(
      "A empresa foi atualizada, mas a API retornou uma resposta inválida.",
    );
  }

  return company;
}

export async function updateCompanyStatus(
  companyId: string,
  status: CompanyStatus,
): Promise<CompanyItem> {
  const payload = await apiFetch<unknown>(
    `/api/companies/${companyId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    },
  );

  const company = normalizeCompany(payload);

  if (!company) {
    throw new Error(
      "O status foi alterado, mas a API retornou uma resposta inválida.",
    );
  }

  return company;
}

export async function createCompanyAdmin(
  companyId: string,
  input: CreateCompanyAdminInput,
) {
  return apiFetch<unknown>(
    `/api/companies/${companyId}/admins`,
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name.trim(),
        email: input.email
          .trim()
          .toLowerCase(),
        password: input.password,
        phone:
          onlyDigits(input.phone) || null,
      }),
    },
  );
}

export async function updateMyProfile(
  input: UpdateMyProfileInput,
): Promise<SessionUser> {
  const payload = await apiFetch<unknown>(
    "/api/me/profile",
    {
      method: "PATCH",
      body: JSON.stringify({
        name: input.name.trim(),
        email: input.email
          .trim()
          .toLowerCase(),
        phone:
          onlyDigits(input.phone) || null,
      }),
    },
  );

  const user = normalizeSessionUser(payload);

  if (!user) {
    throw new Error(
      "A conta foi atualizada, mas a API retornou uma resposta inválida.",
    );
  }

  persistSessionUser(user);

  return user;
}

export async function updateMyPassword(
  currentPassword: string,
  newPassword: string,
) {
  return apiFetch<unknown>("/api/me/password", {
    method: "PATCH",
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });
}