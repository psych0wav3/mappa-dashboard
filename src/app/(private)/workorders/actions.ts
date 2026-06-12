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
  errors?: any;
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
  userId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
};

type ApiServiceOrder = {
  id: string;
  companyId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerAddressId?: string | null;
  address?: string | null;
  title?: string | null;
  description?: string | null;
  scheduledDate?: string | null;
  totalAmount?: number | null;
  status?: string | null;
  openedByUserId?: string | null;
  finishedByUserId?: string | null;
  finishedAt?: string | null;
  customerApprovedAt?: string | null;
  createdAt?: string | null;
};

export type WorkOrderCustomerOption = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  addressId: string;
  customerAddressId: string;
  addressLabel: string;
  hasValidAddress: boolean;
};

export type WorkOrderTechnicianOption = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type TechnicianOption = WorkOrderTechnicianOption;
export type CustomerOption = WorkOrderCustomerOption;

export type AdditionalWorkOrderItem = {
  id?: string;
  type?: "PRODUCT" | "SERVICE" | string;
  name?: string;
  quantity?: number;
  unitPrice?: number;
};

export type CreateAdminWorkOrderInput = {
  customerId: string;
  customerAddressId: string;

  employeeUserId?: string;
  employeeName?: string;
  serviceKind?: "POOL_CLEANING" | "ADDITIONAL_SERVICE" | "ADDITIONAL" | string;
  serviceType?: string;
  frequency?: string;
  frequencyWeekdays?: string[];
  scheduledTime?: string;
  additionalItems?: AdditionalWorkOrderItem[];

  title: string;
  description: string;
  scheduledDate: string;
  totalAmount: number;
};

export type CreateEmployeeWorkOrderInput = {
  customerId: string;
  customerAddressId: string;
  title: string;
  description: string;
  scheduledDate: string;
  totalAmount?: number;
};

export type PriceWorkOrderInput = {
  serviceOrderId: string;
  totalAmount: number;
};

export type CustomerApprovalInput = {
  serviceOrderId: string;
  approved: boolean;
};

export type WorkOrderListItem = {
  id: string;
  customerId: string;
  customerName: string;
  customerAddressId?: string | null;
  address: string;
  title: string;
  description: string;
  scheduledDate: string;
  totalAmount: number;
  status: string;
  createdAt?: string | null;
};

async function getTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("mappa_access_token")?.value || null;
}

async function getTokenFromApiLogin() {
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
    throw new Error(`Erro ao autenticar na API: ${response.status} ${text}`);
  }

  const json = JSON.parse(text);

  if (!json.accessToken) {
    throw new Error("A API não retornou accessToken.");
  }

  return json.accessToken as string;
}

async function getCompanyId() {
  const cookieStore = await cookies();
  return cookieStore.get("mappa_company_id")?.value || FALLBACK_COMPANY_ID;
}

function formatValidationErrors(errors: any) {
  if (!errors) return "";

  if (Array.isArray(errors)) {
    return errors
      .map((item) => item?.message || item?.errorMessage || JSON.stringify(item))
      .filter(Boolean)
      .join(" | ");
  }

  if (typeof errors === "object") {
    return Object.entries(errors)
      .map(([field, messages]) => {
        if (Array.isArray(messages)) {
          return `${field}: ${messages.join(", ")}`;
        }

        if (typeof messages === "string") {
          return `${field}: ${messages}`;
        }

        return `${field}: ${JSON.stringify(messages)}`;
      })
      .join(" | ");
  }

  return String(errors);
}

function parseApiError(status: number, text: string) {
  if (status === 401) {
    return "Sessão expirada ou usuário sem autorização. Faça login novamente.";
  }

  if (status === 403) {
    return "Acesso negado. Esta ação exige permissão de administrador da empresa.";
  }

  const lowerText = String(text || "").toLowerCase();

  if (
    lowerText.includes("dateonly") ||
    lowerText.includes("scheduleddate") ||
    lowerText.includes("cannot be used as a parameter value")
  ) {
    return "Erro no backend com campo de data DateOnly. O front está enviando a data como yyyy-MM-dd, mas o backend ainda precisa converter ScheduledDate antes de gravar no banco.";
  }

  try {
    const error = JSON.parse(text) as ApiError;

    const validationDetails = formatValidationErrors(error?.errors);

    const message =
      validationDetails ||
      error?.detail ||
      error?.title ||
      error?.message ||
      JSON.stringify(error);

    if (status === 400) {
      return `Erro 400: ${message || "Um ou mais campos enviados para a API são inválidos."}`;
    }

    if (status === 404) {
      return message || "Registro não encontrado.";
    }

    if (status === 409) {
      return message || "Não foi possível concluir por conflito de dados.";
    }

    return `Erro ${status}: ${message}`;
  } catch {
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

function extractItems<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.customers)) return payload.customers;
  if (Array.isArray(payload?.employees)) return payload.employees;
  if (Array.isArray(payload?.serviceOrders)) return payload.serviceOrders;
  if (Array.isArray(payload?.orders)) return payload.orders;

  return [];
}

function addressLabel(address?: ApiAddress | null) {
  if (!address) return "Endereço não informado";

  const line = [
    address.street,
    address.number,
    address.neighborhood,
    address.city && `${address.city}${address.state ? `/${address.state}` : ""}`,
    address.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return line || "Endereço não informado";
}

function getMainAddress(customer: ApiCustomer) {
  if (customer.mainAddress) return customer.mainAddress;

  if (Array.isArray(customer.addresses)) {
    return (
      customer.addresses.find((address) => address.isMain === true) ||
      customer.addresses[0] ||
      null
    );
  }

  return null;
}

async function getCustomerDetails(companyId: string, customerId: string) {
  return mappaFetch<ApiCustomer>(
    `/api/companies/${companyId}/customers/${customerId}`,
  );
}

function serviceKindLabel(value?: string) {
  if (value === "POOL_CLEANING") return "Limpeza de piscina";
  if (value === "ADDITIONAL_SERVICE") return "Produto ou serviço adicional";
  if (value === "ADDITIONAL") return "Produto ou serviço adicional";

  return value || "Não informado";
}

function weekdayLabel(value: string) {
  const map: Record<string, string> = {
    MONDAY: "Segunda",
    TUESDAY: "Terça",
    WEDNESDAY: "Quarta",
    THURSDAY: "Quinta",
    FRIDAY: "Sexta",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",

    seg: "Segunda",
    ter: "Terça",
    qua: "Quarta",
    qui: "Quinta",
    sex: "Sexta",
    sab: "Sábado",
    dom: "Domingo",
  };

  return map[value] || value;
}

function formatWeekdays(days?: string[]) {
  if (!days || days.length === 0) return "Não se aplica";
  return days.map(weekdayLabel).join(", ");
}

function frequencyLabel(value?: string) {
  const map: Record<string, string> = {
    ONCE: "Avulsa",
    WEEKLY_ONCE: "Semanal",
    WEEKLY_TWICE: "2x por semana",
    WEEKLY_THREE_TIMES: "3x por semana",
    WEEKLY_FOUR_TIMES: "4x por semana",
    DAILY: "Diária",
    BIWEEKLY: "Quinzenal",
    MONTHLY: "Mensal",
  };

  return map[value || ""] || value || "Não informado";
}

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function buildDescription(data: CreateAdminWorkOrderInput) {
  const lines: string[] = [];

  if (data.description?.trim()) {
    lines.push(data.description.trim());
    lines.push("");
  }

  lines.push("----- Dados complementares da OS -----");

  if (data.serviceKind) {
    lines.push(`Tipo da OS: ${serviceKindLabel(data.serviceKind)}`);
  }

  if (data.serviceType) {
    lines.push(`Tipo/serviço selecionado: ${data.serviceType}`);
  }

  if (data.employeeName || data.employeeUserId) {
    lines.push(`Técnico responsável: ${data.employeeName || "Não informado"}`);
    lines.push(`Técnico ID: ${data.employeeUserId || "Não informado"}`);
  }

  if (data.scheduledTime) {
    lines.push(`Horário previsto: ${data.scheduledTime}`);
  }

  if (data.frequency) {
    lines.push(`Frequência: ${frequencyLabel(data.frequency)}`);
    lines.push(`Dias da semana: ${formatWeekdays(data.frequencyWeekdays)}`);
  }

  if (data.additionalItems?.length) {
    lines.push("");
    lines.push("Itens:");

    for (const item of data.additionalItems) {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      const total = quantity * unitPrice;

      lines.push(
        `- ${item.type || "ITEM"} | ${item.name || "Sem nome"} | Qtd: ${quantity} | Unitário: ${formatMoney(
          unitPrice,
        )} | Total: ${formatMoney(total)}`,
      );
    }
  }

  lines.push("");
  lines.push(
    "Observação técnica: técnico, horário, frequência e itens estão salvos na descrição até o backend liberar esses campos estruturados.",
  );

  return lines.join("\n");
}

function normalizeServiceOrder(order: ApiServiceOrder): WorkOrderListItem {
  return {
    id: order.id,
    customerId: order.customerId || "",
    customerName: order.customerName || "Cliente não informado",
    customerAddressId: order.customerAddressId ?? null,
    address: order.address || "Endereço não informado",
    title: order.title || "Ordem de serviço",
    description: order.description || "",
    scheduledDate: order.scheduledDate || "",
    totalAmount: Number(order.totalAmount || 0),
    status: order.status || "WAITING_EXECUTION",
    createdAt: order.createdAt ?? null,
  };
}

function toApiDate(value: string) {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

function toApiStatus(value?: string) {
  if (!value) return "";

  const map: Record<string, string> = {
    WAITING_EXECUTION: "WaitingExecution",
    WaitingExecution: "WaitingExecution",

    IN_ROUTE: "InRoute",
    InRoute: "InRoute",

    PENDING_COMPANY_PRICING: "PendingCompanyPricing",
    PendingCompanyPricing: "PendingCompanyPricing",

    PENDING_CUSTOMER_APPROVAL: "PendingCustomerApproval",
    PendingCustomerApproval: "PendingCustomerApproval",

    DONE: "Finished",
    FINISHED: "Finished",
    Finished: "Finished",

    CANCELED: "Canceled",
    CANCELLED: "Canceled",
    Canceled: "Canceled",

    REJECTED: "Rejected",
    Rejected: "Rejected",

    // Importante:
    // APPROVED não existe na API.
    // No nosso front, "aprovada para rota" = WaitingExecution.
    APPROVED: "WaitingExecution",
    Approved: "WaitingExecution",
  };

  return map[value] || value;
}

function cleanApiNumber(value: number) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

/**
 * GET /api/companies/{companyId}/service-orders
 */
export async function listWorkOrders(opts?: {
  status?: string;
  customerId?: string;
  scheduledDate?: string;
}): Promise<WorkOrderListItem[]> {
  const companyId = await getCompanyId();

  const params = new URLSearchParams();

const apiStatus = toApiStatus(opts?.status);

if (apiStatus) {
  params.set("status", apiStatus);
}

  if (opts?.customerId) {
    params.set("customerId", opts.customerId);
  }

  if (opts?.scheduledDate) {
    params.set("scheduledDate", toApiDate(opts.scheduledDate));
  }

  const query = params.toString();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/service-orders${query ? `?${query}` : ""}`,
  );

  return extractItems<ApiServiceOrder>(data).map(normalizeServiceOrder);
}

/**
 * GET /api/companies/{companyId}/service-orders/{serviceOrderId}
 */
export async function getWorkOrderById(serviceOrderId: string) {
  const companyId = await getCompanyId();

  if (!serviceOrderId) {
    throw new Error("ID da ordem de serviço não informado.");
  }

  const data = await mappaFetch<ApiServiceOrder>(
    `/api/companies/${companyId}/service-orders/${serviceOrderId}`,
  );

  return normalizeServiceOrder(data);
}

/**
 * Clientes para criação de OS.
 */
export async function listWorkOrderCustomers(): Promise<
  WorkOrderCustomerOption[]
> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/customers?status=ACTIVE`,
  );

  const customers = extractItems<ApiCustomer>(data);

  const hydrated = await Promise.all(
    customers.map(async (customer) => {
      try {
        return await getCustomerDetails(companyId, customer.id);
      } catch {
        return customer;
      }
    }),
  );

  return hydrated
    .map((customer) => {
      const mainAddress = getMainAddress(customer);
      const finalAddressId = mainAddress?.id || "";

      return {
        id: customer.id,
        name: customer.name || "Cliente sem nome",
        email: customer.email ?? null,
        phone: customer.phone ?? null,
        document: customer.document ?? null,
        addressId: finalAddressId,
        customerAddressId: finalAddressId,
        addressLabel: addressLabel(mainAddress),
        hasValidAddress: Boolean(finalAddressId),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function listCustomerOptions() {
  return listWorkOrderCustomers();
}

/**
 * Técnicos para criação de OS.
 */
export async function listWorkOrderTechnicians(): Promise<
  WorkOrderTechnicianOption[]
> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/employees`,
  );

  const employees = extractItems<ApiEmployee>(data);

  return employees
    .filter((employee) => employee.status !== "INACTIVE")
    .map((employee) => ({
      id: employee.userId || employee.id,
      name: employee.name || employee.email || "Técnico sem nome",
      email: employee.email ?? null,
      phone: employee.phone ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function listTechnicianOptions() {
  return listWorkOrderTechnicians();
}

/**
 * POST /api/companies/{companyId}/service-orders/admin
 */
export async function createAdminWorkOrder(input: CreateAdminWorkOrderInput) {
  const companyId = await getCompanyId();

  if (!input.customerId) {
    throw new Error("Selecione o cliente/piscina.");
  }

  if (!input.customerAddressId) {
    throw new Error(
      "O cliente selecionado não possui ID de endereço principal. Abra o cadastro do cliente e confirme se a API está retornando mainAddress.id ou addresses[].id.",
    );
  }

  if (!input.title.trim()) {
    throw new Error("Informe o título da ordem de serviço.");
  }

  if (!input.scheduledDate) {
    throw new Error("Informe a data agendada.");
  }

  if (!input.scheduledTime) {
    throw new Error("Informe o horário previsto.");
  }

  if (!input.employeeUserId) {
    throw new Error("Selecione o técnico responsável.");
  }

  if (
    (input.serviceKind === "ADDITIONAL_SERVICE" ||
      input.serviceKind === "ADDITIONAL") &&
    (!input.additionalItems || input.additionalItems.length === 0)
  ) {
    throw new Error("Adicione pelo menos um produto ou serviço à OS.");
  }

  const payload = {
    customerId: input.customerId,
    customerAddressId: input.customerAddressId,
    title: input.title.trim(),
    description: buildDescription(input),
    scheduledDate: toApiDate(input.scheduledDate),
    totalAmount: cleanApiNumber(input.totalAmount),
  };

  const created = await mappaFetch<ApiServiceOrder>(
    `/api/companies/${companyId}/service-orders/admin`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  revalidatePath("/workorders");
  revalidatePath("/workorders/approved");
  revalidatePath("/workorders/new");
  revalidatePath("/routes/builder");

  return created;
}

/**
 * POST /api/companies/{companyId}/service-orders/employee
 * Para uso futuro no app/tela do técnico.
 */
export async function createEmployeeWorkOrder(input: CreateEmployeeWorkOrderInput) {
  const companyId = await getCompanyId();

  if (!input.customerId) {
    throw new Error("Selecione o cliente.");
  }

  if (!input.customerAddressId) {
    throw new Error("Cliente sem endereço principal cadastrado.");
  }

  if (!input.title.trim()) {
    throw new Error("Informe o título da ordem de serviço.");
  }

  const payload = {
    customerId: input.customerId,
    customerAddressId: input.customerAddressId,
    title: input.title.trim(),
    description: input.description?.trim() || "",
    scheduledDate: toApiDate(input.scheduledDate),
    totalAmount: cleanApiNumber(input.totalAmount || 0),
  };

  const created = await mappaFetch<ApiServiceOrder>(
    `/api/companies/${companyId}/service-orders/employee`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  revalidatePath("/workorders");
  revalidatePath("/workorders/approved");

  return created;
}

/**
 * PATCH /api/companies/{companyId}/service-orders/{serviceOrderId}/pricing
 */
export async function priceWorkOrder(input: PriceWorkOrderInput) {
  const companyId = await getCompanyId();

  if (!input.serviceOrderId) {
    throw new Error("ID da ordem de serviço não informado.");
  }

  const payload = {
    totalAmount: cleanApiNumber(input.totalAmount),
  };

  const updated = await mappaFetch<ApiServiceOrder>(
    `/api/companies/${companyId}/service-orders/${input.serviceOrderId}/pricing`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  revalidatePath("/workorders");
  revalidatePath("/workorders/approved");
  revalidatePath("/routes/builder");

  return updated;
}

/**
 * PATCH /api/companies/{companyId}/service-orders/{serviceOrderId}/customer-approval
 */
export async function customerApprovalWorkOrder(input: CustomerApprovalInput) {
  const companyId = await getCompanyId();

  if (!input.serviceOrderId) {
    throw new Error("ID da ordem de serviço não informado.");
  }

  const payload = {
    approved: Boolean(input.approved),
  };

  const updated = await mappaFetch<ApiServiceOrder>(
    `/api/companies/${companyId}/service-orders/${input.serviceOrderId}/customer-approval`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  revalidatePath("/workorders");
  revalidatePath("/workorders/approved");
  revalidatePath("/routes/builder");

  return updated;
}