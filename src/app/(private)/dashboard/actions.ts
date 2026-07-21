import { getCompanyId, mappaFetch } from "@/lib/mappa/api";

export type DashboardMetrics = {
  totalCustomers: number;
  totalEmployees: number;
  pendingCompanyPricingOrders: number;
  pendingCustomerApprovalOrders: number;
  waitingExecutionOrders: number;
  inRouteOrders: number;
  doneOrdersToday: number;
  plannedRoutesToday: number;
};

export const emptyDashboardMetrics: DashboardMetrics = {
  totalCustomers: 0,
  totalEmployees: 0,
  pendingCompanyPricingOrders: 0,
  pendingCustomerApprovalOrders: 0,
  waitingExecutionOrders: 0,
  inRouteOrders: 0,
  doneOrdersToday: 0,
  plannedRoutesToday: 0,
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<Partial<DashboardMetrics>>(
    `/api/companies/${companyId}/dashboard`,
  );

  return {
    ...emptyDashboardMetrics,
    ...data,
  };
}