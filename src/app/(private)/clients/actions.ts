"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5264";
const FALLBACK_COMPANY_ID =
  process.env.NEXT_PUBLIC_COMPANY_ID ||
  "00000000-0000-0000-0000-000000000001";

async function getTokenOrThrow() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mappa_access_token")?.value;

  if (!token) {
    throw new Error("Usuário não autenticado. Faça login novamente.");
  }

  return token;
}

async function getCompanyId() {
  const cookieStore = await cookies();
  return cookieStore.get("mappa_company_id")?.value || FALLBACK_COMPANY_ID;
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

  if (!response.ok) {
    let message = `Erro na API: ${response.status}`;

    try {
      const error = await response.json();

      if (response.status === 403) {
        message =
          "Acesso negado. Entre com o usuário admin@piscinasazul.com para acessar clientes.";
      } else {
        message =
          error?.detail ||
          error?.title ||
          error?.message ||
          error?.errors?.[0]?.message ||
          JSON.stringify(error);
      }
    } catch {
      if (response.status === 403) {
        message =
          "Acesso negado. Entre com o usuário admin@piscinasazul.com para acessar clientes.";
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
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

function mapApiCustomerToClient(item: any, companyId: string) {
  const [firstName, ...rest] = String(item.name || "").split(" ");

  return {
    id: item.id,
    userId: item.userId,
    companyId: item.companyId ?? companyId,

    firstName: firstName || item.name || "",
    lastName: rest.join(" "),

    email: item.email,
    phone: item.phone,
    cpf: item.document,
    cnpj: null,
    companyName: null,

    active: item.status === "ACTIVE",
    status: item.status,

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

  const data = await mappaFetch<{ items: any[] }>(
    `/api/companies/${companyId}/customers`
  );

  return (data.items || []).map((item) =>
    mapApiCustomerToClient(item, companyId)
  );
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

  const payload = {
    name,
    email: String(data.email).trim(),
    password: "123456",
    phone: onlyDigits(data.phone),
    document: onlyDigits(data.cpf || data.cnpj),
    address: {
      street: clean(data.poolStreet || data.street) || "Endereço não informado",
      number: clean(data.poolNumber || data.number),
      complement: null,
      neighborhood: clean(data.poolDistrict || data.district),
      city: clean(data.poolCity || data.city) || "Cidade não informada",
      state: clean(data.poolUf || data.uf) || "SP",
      zipCode: onlyDigits(data.poolCep || data.cep),
      latitude: data.poolLat ? Number(data.poolLat) : null,
      longitude: data.poolLng ? Number(data.poolLng) : null,
    },
  };

  await mappaFetch(`/api/companies/${companyId}/customers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  revalidatePath("/clients");
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