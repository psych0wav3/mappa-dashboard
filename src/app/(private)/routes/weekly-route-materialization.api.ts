import {
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

export type MaterializeWeeklyRoutesResult = {
  createdRoutes: number;
  createdServiceOrders: number;
  addedServiceOrders: number;
  existingRoutes: number;
  daysProcessed: number;
};

export async function materializeWeeklyRoutes(params: {
  dateFrom: string;
  dateTo: string;
}) {
  const companyId =
    await getCompanyId();

  return mappaFetch<MaterializeWeeklyRoutesResult>(
    `/api/companies/${companyId}/weekly-route-materialization`,
    {
      method: "POST",
      body: JSON.stringify({
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      }),
    },
  );
}