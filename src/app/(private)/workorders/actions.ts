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
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  status?: string | null;
  mainAddress?: ApiAddress | null;
  addresses?: ApiAddress[] | null;
};

type ApiEmployee = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
};

type ApiServiceOrder = {
  id: string;
  companyId?: string | null;
  customerId?: string | null;
  customerAddressId?: string | null;

  employeeUserId?: string | null;
  employeeName?: string | null;

  title?: string | null;
  description?: string | null;

  scheduledDate?: string | null;
  scheduledTime?: string | null;

  totalAmount?: number | null;
  status?: string | null;

  customerName?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  openedByUserId?: string | null;
  finishedByUserId?: string | null;
  finishedAt?: string | null;
  customerApprovedAt?: string | null;
  createdAt?: string | null;
};

export type WorkOrderListItem = {
  id: string;
  customerId: string | null;
  customerAddressId: string | null;

  employeeUserId: string | null;
  employeeName: string | null;

  customerName: string;
  title: string;
  description: string | null;

  scheduledDate: string | null;
  scheduledTime: string | null;

  totalAmount: number | null;
  status: string;
  address: string | null;
  createdAt: string | null;
};

export type CustomerOption = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  customerAddressId: string | null;
  address: string | null;
};

export type TechnicianOption = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

export type WorkOrderAdditionalItem = {
  kind: "PRODUCT" | "SERVICE";
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type CreateAdminWorkOrderInput = {
  customerId: string;
  customerAddressId: string;

  employeeUserId: string;
  employeeName?: string;

  serviceKind: "POOL_CLEANING" | "ADDITIONAL_SERVICE";
  serviceType: string;

  frequency?:
  | "ONCE"
  | "WEEKLY_ONCE"
  | "WEEKLY_TWICE"
  | "WEEKLY_THREE_TIMES"
  | "WEEKLY_FOUR_TIMES"
  | "DAILY"
  | "BIWEEKLY"
  | "MONTHLY";

  title: string;
  description?: string;

  scheduledDate: string;
  scheduledTime: string;

  totalAmount?: number;

  additionalItems?: WorkOrderAdditionalItem[];
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
  async function requestWithToken(token: string) {
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

  let token = await getTokenOrThrow();

  let response = await requestWithToken(token);
  let text = await response.text();

  if (response.status === 401) {
    token = await getTokenFromApiLogin();

    response = await requestWithToken(token);
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

function extractItems<T>(payload: any): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function getMainAddress(customer: ApiCustomer) {
  if (customer.mainAddress) {
    return customer.mainAddress;
  }

  if (Array.isArray(customer.addresses)) {
    return (
      customer.addresses.find((address) => address.isMain) ||
      customer.addresses[0] ||
      null
    );
  }

  return null;
}

function formatAddress(address?: ApiAddress | null) {
  if (!address) return null;

  const line1 = [address.street, address.number].filter(Boolean).join(", ");
  const line2 = [address.neighborhood, address.city, address.state]
    .filter(Boolean)
    .join(" - ");

  return [line1, line2].filter(Boolean).join(" | ") || null;
}

function normalizeServiceOrder(item: ApiServiceOrder): WorkOrderListItem {
  return {
    id: item.id,

    customerId: item.customerId ?? null,
    customerAddressId: item.customerAddressId ?? null,

    employeeUserId: item.employeeUserId ?? null,
    employeeName: item.employeeName ?? null,

    customerName: item.customerName ?? "Cliente",
    title: item.title ?? "Ordem de serviço",
    description: item.description ?? null,

    scheduledDate: item.scheduledDate ?? null,
    scheduledTime: item.scheduledTime ?? null,

    totalAmount: item.totalAmount ?? null,
    status: item.status ?? "UNKNOWN",
    address: item.address ?? null,
    createdAt: item.createdAt ?? null,
  };
}

function frequencyLabel(frequency?: CreateAdminWorkOrderInput["frequency"]) {
  const map: Record<string, string> = {
    ONCE: "Avulsa",
    WEEKLY_ONCE: "Semanal, 1x por semana",
    WEEKLY_TWICE: "2x por semana",
    WEEKLY_THREE_TIMES: "3x por semana",
    WEEKLY_FOUR_TIMES: "4x por semana",
    DAILY: "Diária, todos os dias",
    BIWEEKLY: "Quinzenal, a cada 15 dias",
    MONTHLY: "Mensal, uma vez por mês",
  };

  return frequency ? map[frequency] ?? frequency : "Avulsa";
}

function serviceKindLabel(kind: CreateAdminWorkOrderInput["serviceKind"]) {
  return kind === "POOL_CLEANING"
    ? "Limpeza de piscina"
    : "Produto ou serviço adicional";
}

function additionalItemKindLabel(kind: WorkOrderAdditionalItem["kind"]) {
  return kind === "PRODUCT" ? "Produto" : "Serviço";
}

function buildAdditionalItemsDescription(items?: WorkOrderAdditionalItem[]) {
  if (!items?.length) {
    return "";
  }

  const lines = items.map((item, index) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const total = Number(item.total || quantity * unitPrice || 0);

    return `${index + 1}. ${additionalItemKindLabel(item.kind)}: ${
      item.name
    } | Qtd: ${quantity} | Unitário: R$ ${unitPrice.toFixed(
      2,
    )} | Total: R$ ${total.toFixed(2)}`;
  });

  return ["Itens da OS:", ...lines].join("\n");
}

function buildDescription(data: CreateAdminWorkOrderInput) {
  const pieces = [
    `Tipo da OS: ${serviceKindLabel(data.serviceKind)}.`,
    `Serviço/tipo principal: ${data.serviceType}.`,

    data.serviceKind === "POOL_CLEANING"
      ? `Frequência solicitada: ${frequencyLabel(data.frequency)}.`
      : "",

    data.serviceKind === "ADDITIONAL_SERVICE"
      ? buildAdditionalItemsDescription(data.additionalItems)
      : "",

    `Data agendada: ${data.scheduledDate}.`,
    `Horário previsto: ${data.scheduledTime}.`,

    data.employeeName ? `Técnico responsável: ${data.employeeName}.` : "",

    data.description?.trim()
      ? `Observações: ${data.description.trim()}`
      : "",
  ];

  return pieces.filter(Boolean).join("\n");
}

export async function listWorkOrders(opts?: {
  status?: string;
  customerId?: string;
  scheduledDate?: string;
}) {
  const companyId = await getCompanyId();

  const params = new URLSearchParams();

  if (opts?.status) {
    params.set("status", opts.status);
  }

  if (opts?.customerId) {
    params.set("customerId", opts.customerId);
  }

  if (opts?.scheduledDate) {
    params.set("scheduledDate", opts.scheduledDate);
  }

  const query = params.toString();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/service-orders${query ? `?${query}` : ""}`,
  );

  return extractItems<ApiServiceOrder>(data).map(normalizeServiceOrder);
}

export async function listCustomerOptions(): Promise<CustomerOption[]> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/customers?status=ACTIVE`,
  );

  const customers = extractItems<ApiCustomer>(data);

  const details = await Promise.all(
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

  return details
    .map((customer) => {
      const mainAddress = getMainAddress(customer);

      return {
        id: customer.id,
        name: customer.name ?? "Cliente",
        email: customer.email ?? null,
        phone: customer.phone ?? null,
        customerAddressId: mainAddress?.id ?? null,
        address: formatAddress(mainAddress),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function listTechnicianOptions(): Promise<TechnicianOption[]> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/employees`,
  );

  const employees = extractItems<ApiEmployee>(data);

  return employees
    .filter((employee) => employee.status !== "INACTIVE")
    .map((employee) => ({
      id: employee.id,
      name: employee.name ?? "Técnico",
      email: employee.email ?? null,
      phone: employee.phone ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function createAdminWorkOrder(data: CreateAdminWorkOrderInput) {
  const companyId = await getCompanyId();

  if (!data.customerId) {
    throw new Error("Selecione o cliente.");
  }

  if (!data.customerAddressId) {
    throw new Error("O cliente selecionado não possui endereço principal.");
  }

  if (!data.employeeUserId) {
    throw new Error("Selecione o técnico responsável.");
  }

  if (!data.title.trim()) {
    throw new Error("Informe o título da ordem de serviço.");
  }

  if (!data.scheduledDate) {
    throw new Error("Informe a data agendada.");
  }

  if (!data.scheduledTime) {
    throw new Error("Informe o horário previsto.");
  }

  if (
    data.serviceKind === "ADDITIONAL_SERVICE" &&
    (!data.additionalItems || data.additionalItems.length === 0)
  ) {
    throw new Error("Adicione pelo menos um produto ou serviço à OS.");
  }

  const totalAmount = Number(data.totalAmount ?? 0);

  const created = await mappaFetch<ApiServiceOrder>(
    `/api/companies/${companyId}/service-orders/admin`,
    {
      method: "POST",
      body: JSON.stringify({
        customerId: data.customerId,
        customerAddressId: data.customerAddressId,

        // Campos atuais da API
        title: data.title.trim(),
        description: buildDescription(data),
        scheduledDate: data.scheduledDate,
        totalAmount,

        // Campos preparados para o ajuste do backend
        employeeUserId: data.employeeUserId,
        scheduledTime: data.scheduledTime,
        serviceKind: data.serviceKind,
        serviceType: data.serviceType,
        frequency: data.frequency ?? "ONCE",
        additionalItems: data.additionalItems ?? [],
      }),
    },
  );

  revalidatePath("/workorders");
  revalidatePath("/routes/builder");

  return created;
}