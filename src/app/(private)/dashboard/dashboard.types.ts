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

export type DashboardOneTimeOrderReminder = {
  todayIso: string;
  todayCount: number;
  tomorrowCount: number;
  laterCount: number;
  futureCount: number;
  totalUpcomingCount: number;
  totalAvailableCount: number;
  todayOrderIds: string[];
};
