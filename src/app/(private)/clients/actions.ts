"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getBackendApiBaseUrl } from "@/lib/browser-api";

const API_URL = getBackendApiBaseUrl() || "http://localhost:5264";

export type ClientStatus = "ACTIVE" | "INACTIVE";

export type ClientAddress = {
  id: string;
  street: string;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isMain: boolean;
};

export type Client = {
  id: string;
  userId?: string | null;
  companyId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  document?: string | null;
  status: ClientStatus;
  active: boolean;
  mainAddress?: ClientAddress | null;
  addresses: ClientAddress[];
};

export type CreateClientInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  document?: string;

  address: {
    street: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
};

export type AddClientAddressInput = {
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  isMain?: boolean;
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

async function getAuthFromCookies() {
  const cookieStore = await cookies();

  const token = cookieStore.get("mappa_access_token")?.value;

  const companyId = cookieStore.get("mappa_company_id")?.value;

  if (!token) {
    throw new Error("Token não encontrado. Faça login novamente.");
  }

  if (!companyId) {
    const role = cookieStore.get("mappa_role")?.value;

    if (role === "SUPER_ADMIN" || role === "SUPERADMIN") {
      throw new Error("Selecione uma empresa no topo para continuar.");
    }

    throw new Error("Empresa não encontrada. Faça login novamente.");
  }

  return {
    token,
    companyId,
  };
}

function parseApiError(status: number, text: string) {
  if (status === 401) {
    return "Sua sessão expirou. Faça login novamente.";
  }

  if (status === 403) {
    return "Você não tem permissão para realizar esta ação.";
  }

  const normalizedText = text.toLowerCase();

  if (normalizedText.includes("uq_users_email") || normalizedText.includes("duplicate key") || normalizedText.includes("users_email")) {
    return "Já existe um usuário cadastrado com este e-mail.";
  }

  if (status === 409) {
    return "Não é possível excluir este cliente porque ele possui ordens de serviço vinculadas.";
  }

  if (status === 404) {
    return "Cliente não encontrado.";
  }

  try {
    const parsed = JSON.parse(text) as ApiError;

    const message = parsed.errors?.[0]?.message || parsed.detail || parsed.message || parsed.title;

    if (message) {
      return `Erro ${status}: ${message}`;
    }
  } catch {
    // O corpo pode não ser JSON.
  }

  return `Erro ${status}: ${text || "Não foi possível concluir a operação."}`;
}

async function mappaFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const { token } = await getAuthFromCookies();

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options?.headers || {}),
      },
    });
  } catch {
    throw new Error("Não foi possível conectar à API.");
  }

  const text = await response.text();

  if (!response.ok) {
    throw new Error(parseApiError(response.status, text));
  }

  if (response.status === 204 || !text) {
    return null as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

function cleanText(value?: string | null) {
  return String(value || "").trim();
}

function optionalText(value?: string | null) {
  const cleaned = cleanText(value);

  return cleaned || null;
}

function onlyDigits(value?: string | null) {
  const digits = String(value || "").replace(/\D+/g, "");

  return digits || null;
}

function normalizeStatus(value?: string | null): ClientStatus {
  const normalized = String(value || "ACTIVE")
    .replace(/[_\s-]/g, "")
    .toUpperCase();

  return normalized === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

function normalizeAddress(address?: ApiAddress | null): ClientAddress | null {
  if (!address) {
    return null;
  }

  return {
    id: address.id || "",
    street: address.street || "Endereço não informado",
    number: address.number ?? null,
    complement: address.complement ?? null,
    neighborhood: address.neighborhood ?? null,
    city: address.city || "Cidade não informada",
    state: address.state || "Estado não informado",
    zipCode: address.zipCode ?? null,
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
    isMain: address.isMain === true,
  };
}

function normalizeCustomer(customer: ApiCustomer): Client {
  const addresses = Array.isArray(customer.addresses) ? customer.addresses.map(normalizeAddress).filter((address): address is ClientAddress => Boolean(address)) : [];

  const normalizedMainAddress = normalizeAddress(customer.mainAddress);

  const mainAddress = normalizedMainAddress || addresses.find((address) => address.isMain) || addresses[0] || null;

  const mergedAddresses = mainAddress && !addresses.some((address) => address.id && address.id === mainAddress.id) ? [mainAddress, ...addresses] : addresses;

  const status = normalizeStatus(customer.status);

  return {
    id: customer.id,
    userId: customer.userId ?? null,
    companyId: customer.companyId ?? null,
    name: customer.name || "Cliente sem nome",
    email: customer.email || "",
    phone: customer.phone ?? null,
    document: customer.document ?? null,
    status,
    active: status === "ACTIVE",
    mainAddress,
    addresses: mergedAddresses,
  };
}

function extractCustomers(payload: unknown): ApiCustomer[] {
  if (Array.isArray(payload)) {
    return payload as ApiCustomer[];
  }

  if (payload && typeof payload === "object" && "items" in payload && Array.isArray((payload as { items?: unknown }).items)) {
    return (
      payload as {
        items: ApiCustomer[];
      }
    ).items;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "customers" in payload &&
    Array.isArray(
      (
        payload as {
          customers?: unknown;
        }
      ).customers,
    )
  ) {
    return (
      payload as {
        customers: ApiCustomer[];
      }
    ).customers;
  }

  if (payload && typeof payload === "object" && "data" in payload && Array.isArray((payload as { data?: unknown }).data)) {
    return (
      payload as {
        data: ApiCustomer[];
      }
    ).data;
  }

  return [];
}

function validateCreateInput(input: CreateClientInput) {
  const name = cleanText(input.name);
  const email = cleanText(input.email).toLowerCase();

  const password = cleanText(input.password);

  const address = input.address;

  if (name.length < 2) {
    throw new Error("Informe o nome do cliente.");
  }

  if (!email || !email.includes("@")) {
    throw new Error("Informe um e-mail válido.");
  }

  if (password.length < 6) {
    throw new Error("A senha inicial deve possuir pelo menos 6 caracteres.");
  }

  if (!cleanText(address.street)) {
    throw new Error("Informe o endereço principal.");
  }

  if (!cleanText(address.city)) {
    throw new Error("Informe a cidade.");
  }

  if (cleanText(address.state).length !== 2) {
    throw new Error("Informe a UF com duas letras.");
  }

  return {
    name,
    email,
    password,
    phone: onlyDigits(input.phone),
    document: onlyDigits(input.document),
    address: {
      street: cleanText(address.street),
      number: optionalText(address.number),
      complement: optionalText(address.complement),
      neighborhood: optionalText(address.neighborhood),
      city: cleanText(address.city),
      state: cleanText(address.state).toUpperCase(),
      zipCode: onlyDigits(address.zipCode),
      latitude: address.latitude ?? null,
      longitude: address.longitude ?? null,
    },
  };
}

function validateAddressInput(input: AddClientAddressInput) {
  if (!cleanText(input.street)) {
    throw new Error("Informe o endereço.");
  }

  if (!cleanText(input.city)) {
    throw new Error("Informe a cidade.");
  }

  if (cleanText(input.state).length !== 2) {
    throw new Error("Informe a UF com duas letras.");
  }

  return {
    street: cleanText(input.street),
    number: optionalText(input.number),
    complement: optionalText(input.complement),
    neighborhood: optionalText(input.neighborhood),
    city: cleanText(input.city),
    state: cleanText(input.state).toUpperCase(),
    zipCode: onlyDigits(input.zipCode),
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    isMain: input.isMain === true,
  };
}

export async function listClients(options?: { search?: string; status?: ClientStatus }): Promise<Client[]> {
  const { companyId } = await getAuthFromCookies();

  const params = new URLSearchParams();

  if (options?.search?.trim()) {
    params.set("search", options.search.trim());
  }

  if (options?.status) {
    params.set("status", options.status);
  }

  const query = params.toString();

  const data = await mappaFetch<unknown>(`/api/companies/${companyId}/customers${query ? `?${query}` : ""}`);

  const summaries = extractCustomers(data);

  /*
   * O GET da listagem retorna somente os dados resumidos.
   * Buscamos cada cliente por ID para obter mainAddress e addresses.
   */
  const hydratedCustomers = await Promise.all(
    summaries.map(async (summary) => {
      try {
        return await mappaFetch<ApiCustomer>(`/api/companies/${companyId}/customers/${summary.id}`);
      } catch (error) {
        console.error(`Não foi possível carregar os detalhes do cliente ${summary.id}:`, error);

        return summary;
      }
    }),
  );

  return hydratedCustomers.map(normalizeCustomer).sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
}

export async function getClientById(customerId: string): Promise<Client> {
  const { companyId } = await getAuthFromCookies();

  if (!customerId) {
    throw new Error("ID do cliente não informado.");
  }

  const customer = await mappaFetch<ApiCustomer>(`/api/companies/${companyId}/customers/${customerId}`);

  return normalizeCustomer(customer);
}

export async function createClient(input: CreateClientInput) {
  const { companyId } = await getAuthFromCookies();

  const payload = validateCreateInput(input);

  const created = await mappaFetch<ApiCustomer>(`/api/companies/${companyId}/customers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  revalidatePath("/clients");
  revalidatePath("/workorders");
  revalidatePath("/service-plans");
  revalidatePath("/routes/new");

  return normalizeCustomer(created);
}

export async function addClientAddress(customerId: string, input: AddClientAddressInput) {
  const { companyId } = await getAuthFromCookies();

  if (!customerId) {
    throw new Error("ID do cliente não informado.");
  }

  const payload = validateAddressInput(input);

  const address = await mappaFetch<ApiAddress>(`/api/companies/${companyId}/customers/${customerId}/addresses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  revalidatePath("/clients");
  revalidatePath("/workorders");
  revalidatePath("/service-plans");
  revalidatePath("/routes/new");

  return normalizeAddress(address);
}

export async function deleteClient(customerId: string) {
  const { companyId } = await getAuthFromCookies();

  if (!customerId) {
    throw new Error("ID do cliente não informado.");
  }

  await mappaFetch(`/api/companies/${companyId}/customers/${customerId}`, {
    method: "DELETE",
  });

  revalidatePath("/clients");

  return true;
}
