import {
  extractItems,
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

export type ApiRouteOneTimeOrder = {
  id: string;
  orderNumber?: number | null;
  customerId: string;
  customerName: string;
  customerAddressId: string;
  title: string;
  description: string;
  scheduledDate: string;
  totalAmount: number;
  status: string;
  origin: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type RemoveOneTimeOrderFromRouteResponse = {
  serviceOrderId: string;
  routeId: string;
  routeDeleted: boolean;
  remainingServiceOrders: number;
};

export async function fetchRouteOneTimeOrders(params?: {
  scheduledDate?: string;
}) {
  const companyId = await getCompanyId();

  const query = new URLSearchParams();

  if (params?.scheduledDate) {
    query.set("scheduledDate", params.scheduledDate);
  }

  const queryString = query.toString();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/route-one-time-orders${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return extractItems<ApiRouteOneTimeOrder>(data);
}

export async function removeOneTimeOrderFromRoute(params: {
  routeId: string;
  serviceOrderId: string;
}) {
  const companyId = await getCompanyId();

  return mappaFetch<RemoveOneTimeOrderFromRouteResponse>(
    `/api/companies/${companyId}/routes/${params.routeId}/one-time-orders/${params.serviceOrderId}`,
    {
      method: "DELETE",
    },
  );
}