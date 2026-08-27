import {
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

import {
  fetchRouteOneTimeOrders,
} from "@/app/(private)/routes/one-time-orders.api";

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

function getTodayIso() {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "America/Sao_Paulo",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",
      },
    );

  const parts =
    formatter.formatToParts(
      new Date(),
    );

  const year =
    parts.find(
      (part) =>
        part.type ===
        "year",
    )?.value || "";

  const month =
    parts.find(
      (part) =>
        part.type ===
        "month",
    )?.value || "";

  const day =
    parts.find(
      (part) =>
        part.type ===
        "day",
    )?.value || "";

  return `${year}-${month}-${day}`;
}

function addDaysIso(
  date: string,
  amount: number,
) {
  const [
    year,
    month,
    day,
  ] = date
    .split("-")
    .map(Number);

  const value =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );

  value.setUTCDate(
    value.getUTCDate() +
      amount,
  );

  return value
    .toISOString()
    .slice(0, 10);
}

function normalizeScheduledDate(
  value?: string | null,
) {
  const date =
    String(
      value || "",
    ).slice(0, 10);

  return /^\d{4}-\d{2}-\d{2}$/.test(
    date,
  )
    ? date
    : "";
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const companyId =
    await getCompanyId();

  /*
   * As métricas são o dado principal
   * do Dashboard.
   *
   * Se esta chamada falhar, o erro deve
   * subir para o Error Boundary.
   */
  const data =
    await mappaFetch<
      Partial<DashboardMetrics>
    >(
      `/api/companies/${companyId}/dashboard`,
    );

  return {
    ...emptyDashboardMetrics,
    ...data,
  };
}

export function createEmptyDashboardOneTimeOrderReminder(): DashboardOneTimeOrderReminder {
  return {
    todayIso:
      getTodayIso(),

    todayCount:
      0,

    tomorrowCount:
      0,

    laterCount:
      0,

    futureCount:
      0,

    totalUpcomingCount:
      0,

    totalAvailableCount:
      0,

    todayOrderIds:
      [],
  };
}

export async function getDashboardOneTimeOrderReminder(): Promise<DashboardOneTimeOrderReminder> {
  const todayIso =
    getTodayIso();

  const tomorrowIso =
    addDaysIso(
      todayIso,
      1,
    );

  const endIso =
    addDaysIso(
      todayIso,
      7,
    );

  /*
   * Não existe mais catch → zeros aqui.
   *
   * Se esta chamada falhar, quem decide
   * se pode existir fallback é a página,
   * através do safeLoad().
   */
  const orders =
    await fetchRouteOneTimeOrders();

  const ordersWithDate =
    orders
      .map(
        (order) => ({
          id:
            order.id,

          scheduledDate:
            normalizeScheduledDate(
              order.scheduledDate,
            ),
        }),
      )
      .filter(
        (order) =>
          order.scheduledDate,
      );

  const todayOrders =
    ordersWithDate.filter(
      (order) =>
        order.scheduledDate ===
        todayIso,
    );

  const tomorrowOrders =
    ordersWithDate.filter(
      (order) =>
        order.scheduledDate ===
        tomorrowIso,
    );

  const laterOrders =
    ordersWithDate.filter(
      (order) =>
        order.scheduledDate >
          tomorrowIso &&
        order.scheduledDate <=
          endIso,
    );

  return {
    todayIso,

    todayCount:
      todayOrders.length,

    tomorrowCount:
      tomorrowOrders.length,

    laterCount:
      laterOrders.length,

    futureCount:
      tomorrowOrders.length +
      laterOrders.length,

    totalUpcomingCount:
      todayOrders.length +
      tomorrowOrders.length +
      laterOrders.length,

    totalAvailableCount:
      ordersWithDate.length,

    todayOrderIds:
      todayOrders
        .map(
          (order) =>
            order.id,
        )
        .sort(),
  };
}