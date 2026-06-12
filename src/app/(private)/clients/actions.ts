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

function parseApiError(status: number, text: string) {
  if (status === 401) {
    return "Sessão expirada ou usuário sem autorização. Faça login novamente.";
  }

  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("uq_users_email") ||
    lowerText.includes("duplicate key") ||
    lowerText.includes("users_email")
  ) {
    return "Já existe um usuário cadastrado com este e-mail. Use outro e-mail ou localize o cliente existente na lista.";
  }

  try {
    const error = JSON.parse(text) as ApiError;

    const message =
      error?.errors?.[0]?.message ||
      error?.detail ||
      error?.title ||
      error?.message ||
      JSON.stringify(error);

    if (
      String(message).toLowerCase().includes("uq_users_email") ||
      String(message).toLowerCase().includes("duplicate key")
    ) {
      return "Já existe um usuário cadastrado com este e-mail. Use outro e-mail ou localize o cliente existente na lista.";
    }

    if (status === 409) {
      return (
        message ||
        "Não foi possível concluir a operação. Este registro possui vínculos no sistema."
      );
    }

    if (status === 404) {
      return message || "Cliente não encontrado.";
    }

    if (status === 500) {
      return message || "Erro interno da API.";
    }

    return `Erro ${status}: ${message}`;
  } catch {
    if (status === 409) {
      return "Não foi possível concluir a operação. Este registro possui vínculos no sistema.";
    }

    if (status === 404) {
      return "Cliente não encontrado.";
    }

    return `Erro ${status}: ${text || "Falha na API."}`;
  }
}

async function mappaFetch<T>(path: string, options?: RequestInit): Promise<T> {
  async function doFetch(token: string) {
    return fetch(`${API_URL}${path}`, {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options?.headers || {}),
      },
    });
  }

  let token = await getTokenFromCookie();

  if (!token) {
    token = await getTokenFromApiLogin();
  }

  let response = await doFetch(token);
  let text = await response.text();

  if (response.status === 401) {
    token = await getTokenFromApiLogin();

    response = await doFetch(token);
    text = await response.text();
  }

  if (!response.ok) {
    throw new Error(parseApiError(response.status, text));
  }

  if (response.status === 204 || !text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

async function getCompanyId() {
  const cookieStore = await cookies();

  return cookieStore.get("mappa_company_id")?.value || FALLBACK_COMPANY_ID;
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
    return (
      item.addresses.find((address) => address.isMain === true) ||
      item.addresses[0] ||
      null
    );
  }

  return null;
}

function getBillingAddress(item: ApiCustomer, mainAddress?: ApiAddress | null) {
  if (!Array.isArray(item.addresses)) {
    return null;
  }

  const billing =
    item.addresses.find((address) => address.isMain === false) ||
    item.addresses.find((address) => {
      if (!mainAddress?.id) return false;
      return address.id !== mainAddress.id;
    }) ||
    null;

  return billing;
}

function mapApiCustomerToClient(item: ApiCustomer, companyId: string) {
  const { firstName, lastName } = splitName(item.name);

  const poolAddress = getMainAddress(item);
  const billingAddress = getBillingAddress(item, poolAddress);

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

    street: billingAddress?.street ?? null,
    number: billingAddress?.number ?? null,
    district: billingAddress?.neighborhood ?? null,
    city: billingAddress?.city ?? null,
    uf: billingAddress?.state ?? null,
    cep: billingAddress?.zipCode ?? null,

    poolStreet: poolAddress?.street ?? null,
    poolNumber: poolAddress?.number ?? null,
    poolDistrict: poolAddress?.neighborhood ?? null,
    poolCity: poolAddress?.city ?? null,
    poolUf: poolAddress?.state ?? null,
    poolCep: poolAddress?.zipCode ?? null,
    poolLat: poolAddress?.latitude ?? null,
    poolLng: poolAddress?.longitude ?? null,

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
    isMain: true,
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
    street:
      (clean(data.street) as string | null) ||
      "Endereço de cobrança não informado",
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

  const hydratedCustomers = await Promise.all(
    customers.map(async (customer) => {
      try {
        return await mappaFetch<ApiCustomer>(
          `/api/companies/${companyId}/customers/${customer.id}`,
        );
      } catch {
        return customer;
      }
    }),
  );

  return hydratedCustomers.map((item) =>
    mapApiCustomerToClient(item, companyId),
  );
}

export async function getClientById(customerId: string) {
  const companyId = await getCompanyId();

  if (!customerId) {
    throw new Error("ID do cliente não informado.");
  }

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

  if (billingAddress && createdCustomer?.id) {
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

export async function addClientAddress(customerId: string, address: any) {
  const companyId = await getCompanyId();

  if (!customerId) {
    throw new Error("ID do cliente não informado.");
  }

  const payload = {
    street:
      (clean(address.street) as string | null) || "Endereço não informado",
    number: clean(address.number) as string | null,
    complement: clean(address.complement) as string | null,
    neighborhood: clean(address.neighborhood || address.district) as
      | string
      | null,
    city: (clean(address.city) as string | null) || "Cidade não informada",
    state: (clean(address.state || address.uf) as string | null) || "SP",
    zipCode: onlyDigits(address.zipCode || address.cep),
    latitude: toNumberOrNull(address.latitude),
    longitude: toNumberOrNull(address.longitude),
    isMain: Boolean(address.isMain),
  };

  const createdAddress = await mappaFetch(
    `/api/companies/${companyId}/customers/${customerId}/addresses`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  revalidatePath("/clients");

  return createdAddress;
}

export async function deleteClient(customerId: string) {
  const companyId = await getCompanyId();

  if (!customerId) {
    throw new Error("ID do cliente não informado.");
  }

  await mappaFetch(`/api/companies/${companyId}/customers/${customerId}`, {
    method: "DELETE",
  });

  revalidatePath("/clients");

  return true;
}

export async function updateClient() {
  throw new Error("Atualização de cliente ainda não implementada na API.");
}

export async function saveClientCoords() {
  throw new Error("Atualização de coordenadas ainda não implementada na API.");
}