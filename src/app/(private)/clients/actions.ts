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

type ClientStatus = "ACTIVE" | "INACTIVE";

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

type ApiAddress = {
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
  isMain?: boolean | null;
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
  mainAddress?: ApiAddress | null;
  addresses?: ApiAddress[] | null;
};

type AddressPayload = {
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  isMain?: boolean;
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

  return cookieStore.get("mappa_company_id")?.value || FALLBACK_COMPANY_ID;
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

function toNumberOrNull(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
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

function getMainAddress(item: ApiCustomer) {
  if (item.mainAddress) {
    return item.mainAddress;
  }

  if (Array.isArray(item.addresses)) {
    return item.addresses.find((address) => address.isMain) || item.addresses[0] || null;
  }

  return null;
}

function getSecondaryAddress(item: ApiCustomer, mainAddress?: ApiAddress | null) {
  if (!Array.isArray(item.addresses)) {
    return null;
  }

  return (
    item.addresses.find((address) => {
      if (!mainAddress?.id) return !address.isMain;
      return address.id !== mainAddress.id;
    }) || null
  );
}

function mapApiCustomerToClient(item: ApiCustomer, companyId: string) {
  const { firstName, lastName } = splitName(item.name);

  const mainAddress = getMainAddress(item);
  const secondaryAddress = getSecondaryAddress(item, mainAddress);

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

    // Endereço de cobrança, quando existir endereço secundário.
    // Se não existir, deixamos vazio na visualização para não confundir com a piscina.
    street: secondaryAddress?.street ?? null,
    number: secondaryAddress?.number ?? null,
    district: secondaryAddress?.neighborhood ?? null,
    city: secondaryAddress?.city ?? null,
    uf: secondaryAddress?.state ?? null,
    cep: secondaryAddress?.zipCode ?? null,

    // Localização da piscina, sempre vinda do endereço principal.
    poolStreet: mainAddress?.street ?? null,
    poolNumber: mainAddress?.number ?? null,
    poolDistrict: mainAddress?.neighborhood ?? null,
    poolCity: mainAddress?.city ?? null,
    poolUf: mainAddress?.state ?? null,
    poolCep: mainAddress?.zipCode ?? null,
    poolLat: mainAddress?.latitude ?? null,
    poolLng: mainAddress?.longitude ?? null,

    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function buildPoolAddress(data: any): AddressPayload {
  return {
    street:
      (clean(data.poolStreet) as string | null) ||
      (clean(data.street) as string | null) ||
      "Endereço da piscina não informado",

    number:
      (clean(data.poolNumber) as string | null) ||
      (clean(data.number) as string | null),

    complement: null,

    neighborhood:
      (clean(data.poolDistrict) as string | null) ||
      (clean(data.district) as string | null),

    city:
      (clean(data.poolCity) as string | null) ||
      (clean(data.city) as string | null) ||
      "Cidade não informada",

    state:
      (clean(data.poolUf) as string | null) ||
      (clean(data.uf) as string | null) ||
      "SP",

    zipCode: onlyDigits(data.poolCep) || onlyDigits(data.cep),

    latitude: toNumberOrNull(data.poolLat),
    longitude: toNumberOrNull(data.poolLng),
  };
}

function buildBillingAddress(data: any): AddressPayload | null {
  const hasBillingAddress =
    clean(data.street) ||
    clean(data.number) ||
    clean(data.district) ||
    clean(data.city) ||
    clean(data.uf) ||
    onlyDigits(data.cep);

  if (!hasBillingAddress) {
    return null;
  }

  return {
    street: (clean(data.street) as string | null) || "Endereço de cobrança não informado",
    number: clean(data.number) as string | null,
    complement: null,
    neighborhood: clean(data.district) as string | null,
    city: (clean(data.city) as string | null) || "Cidade não informada",
    state: (clean(data.uf) as string | null) || "SP",
    zipCode: onlyDigits(data.cep),
    latitude: null,
    longitude: null,
    isMain: false,
  };
}

function normalizeAddressForCompare(address: AddressPayload | null) {
  if (!address) return "";

  return [
    address.street,
    address.number,
    address.neighborhood,
    address.city,
    address.state,
    address.zipCode,
  ]
    .map((value) => String(value || "").trim().toLowerCase())
    .join("|");
}

function areSameAddress(a: AddressPayload | null, b: AddressPayload | null) {
  return normalizeAddressForCompare(a) === normalizeAddressForCompare(b);
}

export async function listClients(opts?: {
  search?: string;
  status?: ClientStatus;
}) {
  const companyId = await getCompanyId();

  const params = new URLSearchParams();

  if (opts?.search?.trim()) {
    params.set("search", opts.search.trim());
  }

  if (opts?.status) {
    params.set("status", opts.status);
  }

  const query = params.toString();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/customers${query ? `?${query}` : ""}`,
  );

  const customers = extractCustomers(data);

  return customers.map((item) => mapApiCustomerToClient(item, companyId));
}

export async function getClientById(customerId: string) {
  const companyId = await getCompanyId();

  const data = await mappaFetch<ApiCustomer>(
    `/api/companies/${companyId}/customers/${customerId}`,
  );

  return mapApiCustomerToClient(data, companyId);
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

  const poolAddress = buildPoolAddress(data);
  const billingAddress = buildBillingAddress(data);

  const payload = {
    name,
    email: String(data.email).trim(),
    password: "123456",
    phone: onlyDigits(data.phone),
    document: onlyDigits(data.cpf || data.cnpj),

    // Endereço principal sempre é o endereço da piscina.
    address: {
      street: poolAddress.street,
      number: poolAddress.number,
      complement: poolAddress.complement,
      neighborhood: poolAddress.neighborhood,
      city: poolAddress.city,
      state: poolAddress.state,
      zipCode: poolAddress.zipCode,
      latitude: poolAddress.latitude,
      longitude: poolAddress.longitude,
    },
  };

  const createdCustomer = await mappaFetch<ApiCustomer>(
    `/api/companies/${companyId}/customers`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  const shouldAddBillingAddress =
    billingAddress &&
    !areSameAddress(poolAddress, billingAddress) &&
    createdCustomer?.id;

  if (shouldAddBillingAddress) {
    await mappaFetch(
      `/api/companies/${companyId}/customers/${createdCustomer.id}/addresses`,
      {
        method: "POST",
        body: JSON.stringify({
          street: billingAddress.street,
          number: billingAddress.number,
          complement: billingAddress.complement,
          neighborhood: billingAddress.neighborhood,
          city: billingAddress.city,
          state: billingAddress.state,
          zipCode: billingAddress.zipCode,
          latitude: billingAddress.latitude,
          longitude: billingAddress.longitude,
          isMain: false,
        }),
      },
    );
  }

  revalidatePath("/clients");

  return createdCustomer;
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