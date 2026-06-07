"use server";

import { cookies } from "next/headers";

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

type ApiEmployee = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
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

type ApiRouteListItem = {
  id: string;
  title?: string | null;
  routeDate?: string | null;
  employeeUserId?: string | null;
  employeeName?: string | null;
  status?: string | null;
  serviceOrderCount?: number | null;
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

type ApiServiceOrderResponse = {
  id: string;
  companyId?: string | null;
  customerId?: string | null;
  customerAddressId?: string | null;
  title?: string | null;
  description?: string | null;
  scheduledDate?: string | null;
  totalAmount?: number | null;
  status?: string | null;
};

type ClientLite = {
  id: string;
  firstName: string;
  lastName: string;

  customerAddressId?: string | null;

  street: string | null;
  number: string | null;
  district?: string | null;
  city: string | null;
  uf: string | null;

  poolStreet?: string | null;
  poolNumber?: string | null;
  poolDistrict?: string | null;
  poolCity?: string | null;
  poolUf?: string | null;

  lat: number | null;
  lng: number | null;
};

type RouteItemInput = {
  clientId: string;
  customerAddressId?: string | null;
  clientName?: string;
  windowStart: number;
  windowEnd: number;
  order: number;
  notes?: string;
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

function normalizeCustomer(customer: ApiCustomer): ClientLite {
  const { firstName, lastName } = splitName(customer.name);
  const mainAddress = getMainAddress(customer);

  return {
    id: customer.id,
    firstName,
    lastName,

    customerAddressId: mainAddress?.id ?? null,

    street: mainAddress?.street ?? null,
    number: mainAddress?.number ?? null,
    district: mainAddress?.neighborhood ?? null,
    city: mainAddress?.city ?? null,
    uf: mainAddress?.state ?? null,

    poolStreet: mainAddress?.street ?? null,
    poolNumber: mainAddress?.number ?? null,
    poolDistrict: mainAddress?.neighborhood ?? null,
    poolCity: mainAddress?.city ?? null,
    poolUf: mainAddress?.state ?? null,

    lat: mainAddress?.latitude ?? null,
    lng: mainAddress?.longitude ?? null,
  };
}

function normalizeRouteServiceOrders(route: ApiRouteDetailsResponse) {
  return (route.serviceOrders || [])
    .map((item, index) => ({
      id: item.customerId || item.serviceOrderId || item.id || `${index}`,
      serviceOrderId: item.serviceOrderId || item.id || null,
      label: item.customerName || item.title || "Cliente",
      windowStart: 9,
      windowEnd: 10,
      order: item.executionOrder ?? index + 1,
      lat: item.latitude ?? null,
      lng: item.longitude ?? null,
    }))
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({
      ...item,
      order: index + 1,
    }));
}

function buildServiceOrderTitle(item: RouteItemInput) {
  return `Limpeza de piscina - ${item.clientName || "cliente"}`;
}

function buildServiceOrderDescription(item: RouteItemInput, dateISO: string) {
  const start = String(item.windowStart).padStart(2, "0");
  const end = String(item.windowEnd).padStart(2, "0");

  return [
    `Limpeza de piscina agendada pela tela de rotas.`,
    `Data: ${dateISO}.`,
    `Janela sugerida: ${start}:00 às ${end}:00.`,
    item.notes ? `Observações: ${item.notes}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function listTechniciansLite() {
  const companyId = await getCompanyId();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/employees`,
  );

  const employees = extractItems<ApiEmployee>(data);

  return employees
    .filter((employee) => employee.status !== "INACTIVE")
    .map((employee) => {
      const { firstName, lastName } = splitName(employee.name);

      return {
        id: employee.id,
        firstName,
        lastName,
      };
    })
    .sort((a, b) => a.firstName.localeCompare(b.firstName, "pt-BR"));
}

export async function listClientsLite(): Promise<ClientLite[]> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/customers?status=ACTIVE`,
  );

  const customers = extractItems<ApiCustomer>(data);

  const detailedCustomers = await Promise.all(
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

  return detailedCustomers
    .map(normalizeCustomer)
    .sort((a, b) => a.firstName.localeCompare(b.firstName, "pt-BR"));
}

async function listRoutesByDateAndEmployee(params: {
  companyId: string;
  routeDate: string;
  employeeUserId: string;
}) {
  const query = new URLSearchParams();

  query.set("routeDate", params.routeDate);
  query.set("employeeUserId", params.employeeUserId);

  const data = await mappaFetch<any>(
    `/api/companies/${params.companyId}/routes?${query.toString()}`,
  );

  return extractItems<ApiRouteListItem>(data);
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
  return mappaFetch<ApiRouteResponse>(
    `/api/companies/${params.companyId}/routes`,
    {
      method: "POST",
      body: JSON.stringify({
        title: params.title,
        routeDate: params.routeDate,
        employeeUserId: params.employeeUserId,
      }),
    },
  );
}

async function createAdminServiceOrder(params: {
  companyId: string;
  item: RouteItemInput;
  scheduledDate: string;
}) {
  if (!params.item.customerAddressId) {
    throw new Error(
      `Cliente ${params.item.clientName || params.item.clientId} não possui endereço principal da piscina.`,
    );
  }

  return mappaFetch<ApiServiceOrderResponse>(
    `/api/companies/${params.companyId}/service-orders/admin`,
    {
      method: "POST",
      body: JSON.stringify({
        customerId: params.item.clientId,
        customerAddressId: params.item.customerAddressId,
        title: buildServiceOrderTitle(params.item),
        description: buildServiceOrderDescription(
          params.item,
          params.scheduledDate,
        ),
        scheduledDate: params.scheduledDate,
        totalAmount: 0,
      }),
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
  return mappaFetch<ApiRouteDetailsResponse>(
    `/api/companies/${params.companyId}/routes/${params.routeId}/service-orders`,
    {
      method: "POST",
      body: JSON.stringify({
        serviceOrders: params.serviceOrders,
      }),
    },
  );
}

export async function getRouteForDate(params: {
  employeeUserId: string;
  routeDate: string;
}) {
  const companyId = await getCompanyId();

  if (!params.employeeUserId) {
    throw new Error("Técnico obrigatório.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.routeDate)) {
    throw new Error("Data inválida.");
  }

  const routes = await listRoutesByDateAndEmployee({
    companyId,
    routeDate: params.routeDate,
    employeeUserId: params.employeeUserId,
  });

  const route = routes[0];

  if (!route?.id) {
    return [];
  }

  const details = await getRouteDetails(companyId, route.id);

  return normalizeRouteServiceOrders(details);
}

export async function saveRouteForDate(params: {
  employeeUserId: string;
  routeDate: string;
  items: RouteItemInput[];
}) {
  const companyId = await getCompanyId();

  if (!params.employeeUserId) {
    throw new Error("Selecione o técnico.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.routeDate)) {
    throw new Error("Informe a data da rota.");
  }

  if (!params.items?.length) {
    throw new Error("Adicione clientes à rota.");
  }

  for (const item of params.items) {
    if (item.windowStart >= item.windowEnd) {
      throw new Error(
        `Janela inválida para ${item.clientName || item.clientId}.`,
      );
    }
  }

  const existingRoutes = await listRoutesByDateAndEmployee({
    companyId,
    routeDate: params.routeDate,
    employeeUserId: params.employeeUserId,
  });

  const existingRoute = existingRoutes[0];

  let routeId = existingRoute?.id || null;
  let existingDetails: ApiRouteDetailsResponse | null = null;

  if (routeId) {
    existingDetails = await getRouteDetails(companyId, routeId);
  }

  const existingCustomerIds = new Set(
    (existingDetails?.serviceOrders || [])
      .map((order) => order.customerId)
      .filter(Boolean) as string[],
  );

  const newItems = params.items.filter(
    (item) => !existingCustomerIds.has(item.clientId),
  );

  if (!routeId && newItems.length === 0) {
    throw new Error("Nenhum item novo para salvar.");
  }

  const createdOrders = await Promise.all(
    newItems.map((item) =>
      createAdminServiceOrder({
        companyId,
        item,
        scheduledDate: params.routeDate,
      }),
    ),
  );

  if (!routeId) {
    const route = await createRoute({
      companyId,
      title: `Rota ${params.routeDate}`,
      routeDate: params.routeDate,
      employeeUserId: params.employeeUserId,
    });

    routeId = route.id;
  }

  if (createdOrders.length > 0) {
    await addServiceOrdersToRoute({
      companyId,
      routeId,
      serviceOrders: createdOrders.map((order, index) => ({
        serviceOrderId: order.id,
        executionOrder: newItems[index]?.order ?? index + 1,
      })),
    });
  }

  const details = await getRouteDetails(companyId, routeId);

  return {
    ok: true,
    routeId,
    items: normalizeRouteServiceOrders(details),
  };
}

/**
 * Mantidos apenas para não quebrar telas antigas enquanto migramos tudo para a API.
 * A API atual não possui recorrência semanal ainda.
 */
export async function saveWeeklyRoute() {
  throw new Error(
    "Planejamento semanal recorrente ainda depende dos ajustes de recorrência no backend.",
  );
}

export async function saveWeeklyRouteBulk() {
  throw new Error(
    "Atribuição semanal em massa ainda depende dos ajustes de recorrência no backend.",
  );
}

export async function getWeeklyRoute() {
  return [];
}

export async function saveAdHocRoute(params: {
  technicianId: string;
  dateISO: string;
  items: Array<{
    clientId: string;
    customerAddressId?: string | null;
    clientName?: string;
    startHour: number;
    endHour: number;
    order: number;
    notes?: string;
  }>;
}) {
  return saveRouteForDate({
    employeeUserId: params.technicianId,
    routeDate: params.dateISO,
    items: params.items.map((item) => ({
      clientId: item.clientId,
      customerAddressId: item.customerAddressId,
      clientName: item.clientName,
      windowStart: item.startHour,
      windowEnd: item.endHour,
      order: item.order,
      notes: item.notes,
    })),
  });
}