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
  createdAt?: string | null;
};

type ApiRouteListItem = {
  id: string;
  title?: string | null;
  routeDate?: string | null;
  employeeUserId?: string | null;
  employeeName?: string | null;
  status?: string | null;
  serviceOrderCount?: number | null;
  createdAt?: string | null;
};

type ApiRouteResponse = {
  id: string;
  companyId?: string | null;
  employeeUserId?: string | null;
  employeeName?: string | null;
  title?: string | null;
  routeDate?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

type ApiRouteDetailsResponse = ApiRouteResponse & {
  serviceOrders?: Array<{
    serviceOrderId?: string | null;
    id?: string | null;
    title?: string | null;
    customerId?: string | null;
    customerName?: string | null;
    customerAddressId?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    executionOrder?: number | null;
    status?: string | null;
  }>;
};

export type RouteTechnicianOption = {
  id: string;
  name: string;
};

export type RouteWeekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type AvailableRouteWorkOrder = {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  serviceKind: "POOL_CLEANING" | "ADDITIONAL_SERVICE";
  frequencyLabel: string;
  weekdays: RouteWeekday[];
  scheduledTime: string;
  scheduledDate: string;
  address: string;
  status: "WAITING_EXECUTION" | "READY_FOR_ROUTE";
  lat: number;
  lng: number;
};

export type CreateWeeklyRoutesInput = {
  employeeUserId: string;
  weekStartDate: string;
  items: Array<{
    serviceOrderId: string;
    customerName: string;
    weekdays: RouteWeekday[];
    scheduledTime: string;
    order: number;
  }>;
};

export type CreateWeeklyRoutesResult = {
  ok: boolean;
  count: number;
  routes: ApiRouteDetailsResponse[];
  error?: string;
};

export type RouteDashboardItem = {
  id: string;
  title: string;
  routeDate: string;
  employeeUserId: string;
  employeeName: string;
  status: string;
  serviceOrderCount: number;
  createdAt?: string | null;
  serviceOrders: Array<{
    id: string;
    serviceOrderId: string;
    title: string;
    customerName: string;
    address: string;
    executionOrder: number;
    status: string;
  }>;
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

async function getCompanyId() {
  const cookieStore = await cookies();
  return cookieStore.get("mappa_company_id")?.value || FALLBACK_COMPANY_ID;
}

async function getTokenOrThrow() {
  const cookieToken = await getTokenFromCookie();

  if (cookieToken) {
    return cookieToken;
  }

  return getTokenFromApiLogin();
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

  if (status === 409 || lowerText.includes("status inválido")) {
    return "Ordem com status inválido. Apenas OS com status Aguardando execução podem entrar em rota.";
  }

  if (
    lowerText.includes("execution_order_positive") ||
    lowerText.includes("ck_execution_order_positive")
  ) {
    return "A ordem de execução precisa começar em 1. Corrija o executionOrder enviado para a rota.";
  }

  if (
    lowerText.includes("dateonly") ||
    lowerText.includes("routedate") ||
    lowerText.includes("scheduleddate") ||
    lowerText.includes("cannot be used as a parameter value")
  ) {
    return "Erro no backend com campo de data DateOnly. O front está enviando a data como yyyy-MM-dd, mas o backend ainda precisa converter a data antes de gravar no banco.";
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

  let token = await getTokenOrThrow();

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
  if (Array.isArray(payload?.routes)) return payload.routes;
  if (Array.isArray(payload?.serviceOrders)) return payload.serviceOrders;
  if (Array.isArray(payload?.employees)) return payload.employees;

  return [];
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

  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [day, month, year] = value.split("-");
    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

function normalizeStatus(status?: string | null) {
  return String(status || "")
    .replace(/[_\s-]/g, "")
    .toLowerCase();
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

function employeeDisplayName(employee: ApiEmployee) {
  return employee.name || employee.email || "Técnico sem nome";
}

function extractLine(description: string | null | undefined, label: string) {
  const target = label.toLowerCase();

  const line = String(description || "")
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.toLowerCase().startsWith(target));

  if (!line) return "";

  return line.slice(label.length).trim();
}

function parseServiceKind(description?: string | null, title?: string | null) {
  const line = extractLine(description, "Tipo da OS:");

  if (line.toLowerCase().includes("produto")) {
    return "ADDITIONAL_SERVICE" as const;
  }

  if (String(title || "").toLowerCase().includes("troca")) {
    return "ADDITIONAL_SERVICE" as const;
  }

  if (String(title || "").toLowerCase().includes("cloro")) {
    return "ADDITIONAL_SERVICE" as const;
  }

  return "POOL_CLEANING" as const;
}

function parseFrequencyLabel(description?: string | null) {
  const line = extractLine(description, "Frequência:");

  if (!line) return "Avulsa";

  return line;
}

function parseScheduledTime(description?: string | null) {
  const line = extractLine(description, "Horário previsto:");

  if (!line) return "09:00";

  if (/^\d{2}:\d{2}$/.test(line)) {
    return line;
  }

  return line.slice(0, 5) || "09:00";
}

function parseWeekdays(description?: string | null): RouteWeekday[] {
  const line = extractLine(description, "Dias da semana:");

  if (!line || line.toLowerCase().includes("não se aplica")) {
    return [];
  }

  const value = line.toLowerCase();

  const days: RouteWeekday[] = [];

  if (value.includes("segunda")) days.push("MONDAY");
  if (value.includes("terça") || value.includes("terca")) days.push("TUESDAY");
  if (value.includes("quarta")) days.push("WEDNESDAY");
  if (value.includes("quinta")) days.push("THURSDAY");
  if (value.includes("sexta")) days.push("FRIDAY");
  if (value.includes("sábado") || value.includes("sabado")) {
    days.push("SATURDAY");
  }
  if (value.includes("domingo")) days.push("SUNDAY");

  return days;
}

function normalizeWorkOrderForRoute(
  order: ApiServiceOrder,
): AvailableRouteWorkOrder {
  const serviceKind = parseServiceKind(order.description, order.title);
  const weekdays = parseWeekdays(order.description);
  const status = normalizeStatus(order.status);

  return {
    id: order.id,
    customerId: order.customerId || "",
    customerName: order.customerName || "Cliente não informado",
    title: order.title || "Ordem de serviço",
    serviceKind,
    frequencyLabel: parseFrequencyLabel(order.description),
    weekdays,
    scheduledTime: parseScheduledTime(order.description),
    scheduledDate: toApiDate(order.scheduledDate || ""),
    address: order.address || "Endereço não informado",
    status:
      status === "waitingexecution" ? "WAITING_EXECUTION" : "READY_FOR_ROUTE",
    lat: 0,
    lng: 0,
  };
}

function weekdayToDate(weekStartDate: string, weekday: RouteWeekday) {
  const offsets: Record<RouteWeekday, number> = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,
  };

  const date = new Date(`${weekStartDate}T00:00:00`);
  date.setDate(date.getDate() + offsets[weekday]);

  return date.toISOString().slice(0, 10);
}

function normalizeRouteDetails(
  route: ApiRouteDetailsResponse,
): RouteDashboardItem {
  const serviceOrders = (route.serviceOrders || [])
    .map((item, index) => ({
      id: item.id || item.serviceOrderId || `${route.id}-${index}`,
      serviceOrderId: item.serviceOrderId || item.id || "",
      title: item.title || "Ordem de serviço",
      customerName: item.customerName || "Cliente não informado",
      address: item.address || "Endereço não informado",
      executionOrder: item.executionOrder ?? index + 1,
      status: item.status || "InRoute",
    }))
    .sort((a, b) => a.executionOrder - b.executionOrder);

  return {
    id: route.id,
    title: route.title || "Rota",
    routeDate: toApiDate(route.routeDate || ""),
    employeeUserId: route.employeeUserId || "",
    employeeName: route.employeeName || "Técnico não informado",
    status: route.status || "Planned",
    serviceOrderCount: serviceOrders.length,
    createdAt: route.createdAt ?? null,
    serviceOrders,
  };
}

export async function listRouteTechnicians(): Promise<RouteTechnicianOption[]> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/employees`,
  );

  const employees = extractItems<ApiEmployee>(data);

  return employees
    .filter((employee) => employee.status !== "INACTIVE")
    .map((employee) => ({
      id: employee.userId || employee.id,
      name: employeeDisplayName(employee),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function listTechniciansLite() {
  const technicians = await listRouteTechnicians();

  return technicians.map((technician) => {
    const { firstName, lastName } = splitName(technician.name);

    return {
      id: technician.id,
      firstName,
      lastName,
    };
  });
}

/**
 * Lista somente OS que podem entrar em rota.
 * A API exige status WaitingExecution.
 */
export async function listApprovedServiceOrdersForRoute(): Promise<
  AvailableRouteWorkOrder[]
> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/service-orders?status=WaitingExecution`,
  );

  return extractItems<ApiServiceOrder>(data)
    .filter((order) => normalizeStatus(order.status) === "waitingexecution")
    .map(normalizeWorkOrderForRoute)
    .sort((a, b) => {
      const dateCompare = String(a.scheduledDate || "").localeCompare(
        String(b.scheduledDate || ""),
      );

      if (dateCompare !== 0) return dateCompare;

      return a.customerName.localeCompare(b.customerName, "pt-BR");
    });
}

async function getRouteDetails(companyId: string, routeId: string) {
  return mappaFetch<ApiRouteDetailsResponse>(
    `/api/companies/${companyId}/routes/${routeId}`,
  );
}

async function createRoute(params: {
  companyId: string;
  title: string;
  routeDate: string;
  employeeUserId: string;
}) {
  const body = {
    title: params.title,
    routeDate: toApiDate(params.routeDate),
    employeeUserId: params.employeeUserId,
  };

  console.log("[POST /routes] body:", body);

  return mappaFetch<ApiRouteResponse>(
    `/api/companies/${params.companyId}/routes`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

async function addServiceOrdersToRoute(params: {
  companyId: string;
  routeId: string;
  serviceOrders: Array<{
    serviceOrderId: string;
    executionOrder: number;
  }>;
}) {
  const body = {
    serviceOrders: params.serviceOrders,
  };

  console.log("[POST /routes/{routeId}/service-orders] body:", body);

  return mappaFetch<ApiRouteDetailsResponse>(
    `/api/companies/${params.companyId}/routes/${params.routeId}/service-orders`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function createWeeklyRoutesFromPlanner(
  input: CreateWeeklyRoutesInput,
): Promise<CreateWeeklyRoutesResult> {
  try {
    const companyId = await getCompanyId();

    if (!input.employeeUserId) {
      return {
        ok: false,
        count: 0,
        routes: [],
        error: "Selecione o técnico responsável.",
      };
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.weekStartDate)) {
      return {
        ok: false,
        count: 0,
        routes: [],
        error: "Semana inválida.",
      };
    }

    if (!input.items?.length) {
      return {
        ok: false,
        count: 0,
        routes: [],
        error: "Adicione pelo menos uma OS ao planejamento.",
      };
    }

    const grouped = new Map<
      string,
      Array<{
        serviceOrderId: string;
        executionOrder: number;
      }>
    >();

    for (const item of input.items) {
      const weekdays: RouteWeekday[] = item.weekdays.length
        ? item.weekdays
        : ["MONDAY"];

      for (const weekday of weekdays) {
        const routeDate = weekdayToDate(input.weekStartDate, weekday);

        const current = grouped.get(routeDate) || [];

        current.push({
          serviceOrderId: item.serviceOrderId,
          executionOrder: current.length + 1,
        });

        grouped.set(routeDate, current);
      }
    }

    const createdRoutes: ApiRouteDetailsResponse[] = [];

    for (const [routeDate, serviceOrders] of grouped.entries()) {
      const route = await createRoute({
        companyId,
        title: `Rota ${toApiDate(routeDate)}`,
        routeDate,
        employeeUserId: input.employeeUserId,
      });

      const updated = await addServiceOrdersToRoute({
        companyId,
        routeId: route.id,
        serviceOrders,
      });

      createdRoutes.push(updated);
    }

    revalidatePath("/routes/builder");
    revalidatePath("/routes/dashboard");
    revalidatePath("/workorders");
    revalidatePath("/workorders/approved");

    return {
      ok: true,
      count: createdRoutes.length,
      routes: createdRoutes,
    };
  } catch (error: any) {
    console.error("[createWeeklyRoutesFromPlanner]", error);

    return {
      ok: false,
      count: 0,
      routes: [],
      error:
        error?.message ||
        "Não foi possível criar a rota. Verifique o status das OS selecionadas.",
    };
  }
}

export async function listRoutesForDashboard(params?: {
  routeDate?: string;
  status?: string;
}): Promise<RouteDashboardItem[]> {
  try {
    const companyId = await getCompanyId();

    const query = new URLSearchParams();

    if (params?.routeDate) {
      query.set("routeDate", toApiDate(params.routeDate));
    }

    if (params?.status) {
      query.set("status", params.status);
    }

    const data = await mappaFetch<any>(
      `/api/companies/${companyId}/routes${
        query.toString() ? `?${query}` : ""
      }`,
    );

    const routes = extractItems<ApiRouteListItem>(data);

    const detailed = await Promise.all(
      routes.map(async (route) => {
        try {
          return await getRouteDetails(companyId, route.id);
        } catch {
          return {
            id: route.id,
            title: route.title,
            routeDate: route.routeDate,
            employeeUserId: route.employeeUserId,
            employeeName: route.employeeName,
            status: route.status,
            serviceOrders: [],
            createdAt: route.createdAt,
          } satisfies ApiRouteDetailsResponse;
        }
      }),
    );

    return detailed
      .map(normalizeRouteDetails)
      .sort((a, b) => {
        const dateCompare = String(b.routeDate || "").localeCompare(
          String(a.routeDate || ""),
        );

        if (dateCompare !== 0) return dateCompare;

        return a.employeeName.localeCompare(b.employeeName, "pt-BR");
      });
  } catch (error) {
    console.error("[listRoutesForDashboard]", error);

    return [];
  }
}