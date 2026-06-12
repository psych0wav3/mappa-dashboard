"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL ?? "http://localhost:5264";

const COMPANY_ID =
  process.env.COMPANY_ID ?? "00000000-0000-0000-0000-000000000001";

const API_ADMIN_EMAIL = process.env.API_ADMIN_EMAIL;
const API_ADMIN_PASSWORD = process.env.API_ADMIN_PASSWORD;

type ApiEmployee = {
  id: string;
  userId?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  document?: string | null;
  documentNumber?: string | null;
  status?: "ACTIVE" | "INACTIVE" | string;
};

type Tech = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  active: boolean;
  role: "OWNER" | "TECH";
};

type ApiError = {
  errors?: Array<{
    statusCode?: number;
    message?: string;
    code?: string;
  }>;
  detail?: string;
  title?: string;
  message?: string;
};

async function getApiToken() {
  if (!API_ADMIN_EMAIL || !API_ADMIN_PASSWORD) {
    throw new Error(
      "Configure API_ADMIN_EMAIL e API_ADMIN_PASSWORD no .env.local.",
    );
  }

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: API_ADMIN_EMAIL,
      password: API_ADMIN_PASSWORD,
    }),
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Erro ao fazer login na API: ${response.status} ${text}`);
  }

  const json = JSON.parse(text);

  if (!json.accessToken) {
    throw new Error("A API não retornou accessToken.");
  }

  return json.accessToken as string;
}

function parseApiError(status: number, text: string) {
  try {
    const json = JSON.parse(text) as ApiError;

    const message =
      json.errors?.[0]?.message ||
      json.detail ||
      json.title ||
      json.message ||
      text;

    if (status === 409) {
      return (
        message ||
        "Não foi possível excluir. Funcionário possui ordens de serviço vinculadas."
      );
    }

    return `Erro ${status}: ${message}`;
  } catch {
    if (status === 409) {
      return "Não foi possível excluir. Funcionário possui ordens de serviço vinculadas.";
    }

    return `Erro ${status}: ${text}`;
  }
}

function splitName(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function normalizeEmployee(employee: ApiEmployee): Tech {
  const { firstName, lastName } = splitName(employee.name);

  return {
    id: employee.userId || employee.id,
    firstName,
    lastName,
    email: employee.email,
    phone: employee.phone ?? null,
    cpf: employee.cpf ?? employee.document ?? employee.documentNumber ?? null,
    active: employee.status !== "INACTIVE",
    role: "TECH",
  };
}

function extractEmployees(payload: any): ApiEmployee[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.employees)) {
    return payload.employees;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

export async function createTechnician(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const token = await getApiToken();

  const response = await fetch(
    `${API_URL}/api/companies/${COMPANY_ID}/employees`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password.trim(),
        phone: data.phone?.trim() || "",
      }),
      cache: "no-store",
    },
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(parseApiError(response.status, text));
  }

  revalidatePath("/technicians");

  return text ? JSON.parse(text) : true;
}

export async function listTechnicians(): Promise<Tech[]> {
  const token = await getApiToken();

  const response = await fetch(
    `${API_URL}/api/companies/${COMPANY_ID}/employees`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(parseApiError(response.status, text));
  }

  const json = text ? JSON.parse(text) : [];
  const employees = extractEmployees(json);

  return employees.map(normalizeEmployee);
}

export async function deleteTechnician(employeeUserId: string) {
  if (!employeeUserId) {
    throw new Error("ID do técnico não informado.");
  }

  const token = await getApiToken();

  const response = await fetch(
    `${API_URL}/api/companies/${COMPANY_ID}/employees/${employeeUserId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(parseApiError(response.status, text));
  }

  revalidatePath("/technicians");

  return true;
}