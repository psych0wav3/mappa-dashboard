"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:5264";

const FALLBACK_COMPANY_ID =
  process.env.NEXT_PUBLIC_COMPANY_ID ||
  process.env.COMPANY_ID ||
  "00000000-0000-0000-0000-000000000001";

const API_ADMIN_EMAIL = process.env.API_ADMIN_EMAIL;
const API_ADMIN_PASSWORD = process.env.API_ADMIN_PASSWORD;

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

type ApiCustomer = {
  id: string;
  userId?: string | null;
  companyId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  status?: string | null;
  mainAddress?: {
    id?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
};

async function getTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("mappa_access_token")?.value || null;
}

async function getTokenFromApiLogin() {
  if (!API_ADMIN_EMAIL || !API_ADMIN_PASSWORD) {
    throw new Error(
      "Usuário não autenticado. Configure API_ADMIN_EMAIL e API_ADMIN_PASSWORD no .env.local.",
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
    throw new Error(`Erro ao autenticar na API: ${response.status} ${text}`);
  }

  const json = JSON.parse(text);

  if (!json.accessToken) {
    throw new Error("A API não retornou accessToken.");
  }

  return json.accessToken as string;
}

async function getTokenOrThrow() {
  const cookieToken = await getTokenFromCookie();

  if (cookieToken) {
    return cookieToken;
  }

  return getTokenFromApiLogin();
}

async function getCompanyId() {
  const cookieStore = await cookies();

  return (
    cookieStore.get("mappa_company_id")?.value ||
    FALLBACK_COMPANY_ID
  );
}

function parseApiError(status: number, text: string) {
  try {
    const error = JSON.parse(text) as ApiError;

    const message =
      error?.errors?.[0]?.message ||
      error?.detail ||
      error?.title ||
      error?.message ||
      JSON.stringify(error);

    return `Erro ${status}: ${message}`;
  } catch {
    return `Erro ${status}: ${text || "Falha na API."}`;
  }
}

async function mappaFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getTokenOrThrow();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(parseApiError(response.status, text));
  }

  if (response.status === 204 || !text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

function clean(value: unknown) {
  if (typeof value !== "string") return value ?? null;

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

function onlyDigits(value: unknown) {
  if (typeof value !== "string") return null;

  const digits = value.replace(/\D+/g, "");

  return digits || null;
}

function splitName(name?: string | null) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function extractCustomers(payload: any): ApiCustomer[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.customers)) {
    return payload.customers;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function mapApiCustomerToClient(item: ApiCustomer, companyId: string) {
  const { firstName, lastName } = splitName(item.name);

  return {
    id: item.id,
    userId: item.userId ?? null,
    companyId: item.companyId ?? companyId,

    firstName,
    lastName,

    email: item.email ?? "",
    phone: item.phone ?? null,
    cpf: item.document ?? null,
    cnpj: null,
    companyName: null,

    active: item.status !== "INACTIVE",
    status: item.status ?? "ACTIVE",

    street: item.mainAddress?.street ?? null,
    number: item.mainAddress?.number ?? null,
    district: item.mainAddress?.neighborhood ?? null,
    city: item.mainAddress?.city ?? null,
    uf: item.mainAddress?.state ?? null,
    cep: item.mainAddress?.zipCode ?? null,

    poolStreet: item.mainAddress?.street ?? null,
    poolNumber: item.mainAddress?.number ?? null,
    poolDistrict: item.mainAddress?.neighborhood ?? null,
    poolCity: item.mainAddress?.city ?? null,
    poolUf: item.mainAddress?.state ?? null,
    poolCep: item.mainAddress?.zipCode ?? null,
    poolLat: item.mainAddress?.latitude ?? null,
    poolLng: item.mainAddress?.longitude ?? null,

    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function listClients() {
  const companyId = await getCompanyId();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/customers`,
  );

  const customers = extractCustomers(data);

  return customers.map((item) => mapApiCustomerToClient(item, companyId));
}

export async function createClient(data: any) {
  const companyId = await getCompanyId();

  const firstName = String(data.firstName || "").trim();
  const lastName = String(data.lastName || "").trim();
  const name = [firstName, lastName].filter(Boolean).join(" ");

  if (!name) {
    throw new Error("Informe o nome do cliente.");
  }

  if (!data.email) {
    throw new Error("Informe o email do cliente.");
  }

  const street =
    clean(data.poolStreet || data.street) || "Endereço não informado";

  const city =
    clean(data.poolCity || data.city) || "Cidade não informada";

  const state =
    clean(data.poolUf || data.uf) || "SP";

  const payload = {
    name,
    email: String(data.email).trim(),
    password: "123456",
    phone: onlyDigits(data.phone),
    document: onlyDigits(data.cpf || data.cnpj),
    address: {
      street,
      number: clean(data.poolNumber || data.number),
      complement: null,
      neighborhood: clean(data.poolDistrict || data.district),
      city,
      state,
      zipCode: onlyDigits(data.poolCep || data.cep),
      latitude: data.poolLat ? Number(data.poolLat) : null,
      longitude: data.poolLng ? Number(data.poolLng) : null,
    },
  };

  const result = await mappaFetch(`/api/companies/${companyId}/customers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  revalidatePath("/clients");

  return result;
}

export async function updateClient() {
  throw new Error("Atualização de cliente ainda não implementada na API.");
}

export async function deleteClient() {
  throw new Error("Exclusão de cliente ainda não implementada na API.");
}

export async function saveClientCoords() {
  throw new Error("Atualização de coordenadas ainda não implementada na API.");
}