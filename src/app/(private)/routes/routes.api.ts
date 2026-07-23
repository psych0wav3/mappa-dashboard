import {
  extractItems,
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

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

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/employees`,
  );

  return extractItems<ApiEmployee>(data);
}

export async function fetchWaitingExecutionServiceOrders(): Promise<
  ApiServiceOrder[]
> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/service-orders?status=WaitingExecution`,
  );

  const summaries =
    extractItems<ApiServiceOrder>(data);

  /*
   * O endpoint de listagem pode retornar apenas um resumo da OS.
   *
   * Para a criação da rota, precisamos obrigatoriamente de:
   * - customerId
   * - customerName
   * - customerAddressId
   * - endereço
   *
   * Por isso, buscamos os detalhes de cada ordem.
   */
  const hydratedOrders = await Promise.all(
    summaries.map(async (summary) => {
      try {
        const details =
          await mappaFetch<ApiServiceOrder>(
            `/api/companies/${companyId}/service-orders/${summary.id}`,
          );

        return {
          ...summary,
          ...details,

          id: details.id || summary.id,

          customerId:
            details.customerId ||
            summary.customerId ||
            null,

          customerName:
            details.customerName ||
            summary.customerName ||
            null,

          customerAddressId:
            details.customerAddressId ||
            summary.customerAddressId ||
            null,

          address:
            details.address ||
            summary.address ||
            null,

          title:
            details.title ||
            summary.title ||
            null,

          description:
            details.description ||
            summary.description ||
            null,

          scheduledDate:
            details.scheduledDate ||
            summary.scheduledDate ||
            null,

          totalAmount:
            details.totalAmount ??
            summary.totalAmount ??
            0,

          status:
            details.status ||
            summary.status ||
            null,

          createdAt:
            details.createdAt ||
            summary.createdAt ||
            null,
        } satisfies ApiServiceOrder;
      } catch (error) {
        console.error(
          `[fetchWaitingExecutionServiceOrders] Não foi possível carregar os detalhes da OS ${summary.id}.`,
          error,
        );

        return summary;
      }
    }),
  );

  return hydratedOrders;
}

export async function fetchRoutes(params?: {
  routeDate?: string;
  status?: string;
  employeeUserId?: string;
}) {
  const companyId = await getCompanyId();
  const query = new URLSearchParams();

  if (params?.routeDate) {
    query.set(
      "routeDate",
      toApiDate(params.routeDate),
    );
  }

  if (params?.status) {
    query.set("status", params.status);
  }

  if (params?.employeeUserId) {
    query.set(
      "employeeUserId",
      params.employeeUserId,
    );
  }

  const queryString = query.toString();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/routes${
      queryString ? `?${queryString}` : ""
    }`,
  );

  return extractItems<ApiRouteListItem>(
    data,
  );
}

export async function fetchRouteDetails(
  routeId: string,
) {
  const companyId = await getCompanyId();

  if (!routeId) {
    throw new Error(
      "ID da rota não informado.",
    );
  }

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

  return mappaFetch<ApiRouteResponse>(
    `/api/companies/${companyId}/routes`,
    {
      method: "POST",

      body: JSON.stringify({
        title: params.title.trim(),

        routeDate: toApiDate(
          params.routeDate,
        ),

        employeeUserId:
          params.employeeUserId,
      }),
    },
  );
}

export async function addServiceOrdersToRoute(
  params: {
    routeId: string;

    serviceOrders: Array<{
      serviceOrderId: string;
      executionOrder: number;
    }>;
  },
) {
  const companyId = await getCompanyId();

  if (!params.routeId) {
    throw new Error(
      "ID da rota não informado.",
    );
  }

  if (!params.serviceOrders.length) {
    throw new Error(
      "Adicione ao menos uma ordem à rota.",
    );
  }

  return mappaFetch<ApiRouteDetailsResponse>(
    `/api/companies/${companyId}/routes/${params.routeId}/service-orders`,
    {
      method: "POST",

      body: JSON.stringify({
        serviceOrders:
          params.serviceOrders,
      }),
    },
  );
}

export async function updateRouteEmployee(
  params: {
    routeId: string;
    employeeUserId: string;
  },
) {
  const companyId = await getCompanyId();

  if (!params.routeId) {
    throw new Error(
      "ID da rota não informado.",
    );
  }

  if (!params.employeeUserId) {
    throw new Error(
      "ID do técnico não informado.",
    );
  }

  return mappaFetch<ApiRouteResponse>(
    `/api/companies/${companyId}/routes/${params.routeId}/employee`,
    {
      method: "PATCH",

      body: JSON.stringify({
        employeeUserId:
          params.employeeUserId,
      }),
    },
  );
}