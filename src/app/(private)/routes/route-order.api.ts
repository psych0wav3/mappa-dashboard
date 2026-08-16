import {
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

export type RouteOrderItem = {
  serviceOrderId: string;
  executionOrder: number;
  isRecurring: boolean;
  serviceOrderType: string;
  origin: string;
};

export type RouteOrderResponse = {
  serviceOrders: RouteOrderItem[];
};

export async function fetchRouteOrder(
  routeId: string,
) {
  const companyId =
    await getCompanyId();

  return mappaFetch<RouteOrderResponse>(
    `/api/companies/${companyId}/routes/${routeId}/order`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
}

export async function updateRouteOrder(
  routeId: string,
  serviceOrders: Array<{
    serviceOrderId: string;
    executionOrder: number;
  }>,
) {
  const companyId =
    await getCompanyId();

  return mappaFetch<RouteOrderResponse>(
    `/api/companies/${companyId}/routes/${routeId}/order`,
    {
      method: "PUT",
      body: JSON.stringify({
        serviceOrders,
      }),
    },
  );
}