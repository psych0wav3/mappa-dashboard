import { extractItems, getCompanyId, mappaFetch } from "@/lib/mappa/api";

import type {
  ApiEmployee,
  ApiRouteDetailsResponse,
  ApiRouteListItem,
  ApiRouteResponse,
  ApiServiceOrder,
} from "./routes.types";

import { toApiDate } from "./routes.parsers";

export async function fetchRouteEmployees() {
  const companyId = await getCompanyId();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/employees`,
  );

  return extractItems<ApiEmployee>(data);
}

export async function fetchWaitingExecutionServiceOrders() {
  const companyId = await getCompanyId();

  const data = await mappaFetch<any>(
    `/api/companies/${companyId}/service-orders?status=WaitingExecution`,
  );

  return extractItems<ApiServiceOrder>(data);
}

export async function fetchRoutes(params?: {
  routeDate?: string;
  status?: string;
}) {
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

  return extractItems<ApiRouteListItem>(data);
}

export async function fetchRouteDetails(routeId: string) {
  const companyId = await getCompanyId();

  return mappaFetch<ApiRouteDetailsResponse>(
    `/api/companies/${companyId}/routes/${routeId}`,
  );
}

export async function createRoute(params: {
  title: string;
  routeDate: string;
  employeeUserId: string;
}) {
  const companyId = await getCompanyId();

  const body = {
    title: params.title,
    routeDate: toApiDate(params.routeDate),
    employeeUserId: params.employeeUserId,
  };

  return mappaFetch<ApiRouteResponse>(
    `/api/companies/${companyId}/routes`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function addServiceOrdersToRoute(params: {
  routeId: string;
  serviceOrders: Array<{
    serviceOrderId: string;
    executionOrder: number;
  }>;
}) {
  const companyId = await getCompanyId();

  const body = {
    serviceOrders: params.serviceOrders,
  };

  return mappaFetch<ApiRouteDetailsResponse>(
    `/api/companies/${companyId}/routes/${params.routeId}/service-orders`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}