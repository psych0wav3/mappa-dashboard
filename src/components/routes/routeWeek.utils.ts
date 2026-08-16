import type {
  RouteDashboardItem,
  RouteTechnicianOption,
  RouteWeekday,
} from "@/app/(private)/routes/routes.types";

export type RouteDayMeta = {
  count: number;
  label?: string;
  status?: string;
  statusClassName?: string;
};

export type TechnicianWeekMetric = {
  routes: number;
  orders: number;
  completed: number;
};

export const ROUTE_WEEKDAYS: Array<{
  value: RouteWeekday;
  short: string;
  label: string;
}> = [
  {
    value: "MONDAY",
    short: "Seg",
    label: "Segunda",
  },
  {
    value: "TUESDAY",
    short: "Ter",
    label: "Terça",
  },
  {
    value: "WEDNESDAY",
    short: "Qua",
    label: "Quarta",
  },
  {
    value: "THURSDAY",
    short: "Qui",
    label: "Quinta",
  },
  {
    value: "FRIDAY",
    short: "Sex",
    label: "Sexta",
  },
  {
    value: "SATURDAY",
    short: "Sáb",
    label: "Sábado",
  },
  {
    value: "SUNDAY",
    short: "Dom",
    label: "Domingo",
  },
];

export function toIsoDate(date: Date) {
  const copy = new Date(date);

  copy.setHours(0, 0, 0, 0);

  const offset = copy.getTimezoneOffset();

  return new Date(
    copy.getTime() - offset * 60_000,
  )
    .toISOString()
    .slice(0, 10);
}

export function startOfWeekMonday(
  date: Date,
) {
  const copy = new Date(date);

  copy.setHours(0, 0, 0, 0);

  const day = copy.getDay();

  copy.setDate(
    copy.getDate() +
      (day === 0 ? -6 : 1 - day),
  );

  return copy;
}

export function addDays(
  dateIso: string,
  days: number,
) {
  const date = new Date(
    `${dateIso}T12:00:00`,
  );

  date.setDate(
    date.getDate() + days,
  );

  return toIsoDate(date);
}

export function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  const [year, month, day] = String(
    value,
  )
    .slice(0, 10)
    .split("-");

  if (!year || !month || !day) {
    return String(value);
  }

  return `${day}/${month}/${year}`;
}

export function formatDayMonth(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  const [year, month, day] = String(
    value,
  )
    .slice(0, 10)
    .split("-");

  if (!year || !month || !day) {
    return String(value);
  }

  return `${day}/${month}`;
}

export function formatWeekLabel(
  weekStartIso: string,
) {
  return `${formatDayMonth(
    weekStartIso,
  )} a ${formatDayMonth(
    addDays(weekStartIso, 6),
  )}`;
}

export function sameDate(
  first?: string | null,
  second?: string | null,
) {
  if (!first || !second) {
    return false;
  }

  return (
    String(first).slice(0, 10) ===
    String(second).slice(0, 10)
  );
}

export function getWeekDays(
  weekStartIso: string,
) {
  return ROUTE_WEEKDAYS.map(
    (weekday, index) => ({
      ...weekday,
      date: addDays(
        weekStartIso,
        index,
      ),
    }),
  );
}

export function normalizeRouteStatus(
  status?: string | null,
) {
  return String(status || "")
    .replace(/[_\s-]/g, "")
    .toLowerCase();
}

export function routeStatusLabel(
  status?: string | null,
) {
  const normalized =
    normalizeRouteStatus(status);

  const labels: Record<
    string,
    string
  > = {
    planned: "Planejada",
    waitingexecution: "Planejada",
    inprogress: "Em andamento",
    inroute: "Em rota",
    completed: "Concluída",
    finished: "Concluída",
    done: "Concluída",
    canceled: "Cancelada",
    cancelled: "Cancelada",
    rejected: "Recusada",
  };

  return (
    labels[normalized] ||
    status ||
    "Sem status"
  );
}

export function routeStatusClass(
  status?: string | null,
) {
  const normalized =
    normalizeRouteStatus(status);

  if (
    [
      "completed",
      "finished",
      "done",
    ].includes(normalized)
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    [
      "inprogress",
      "inroute",
    ].includes(normalized)
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    [
      "canceled",
      "cancelled",
      "rejected",
    ].includes(normalized)
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    [
      "planned",
      "waitingexecution",
    ].includes(normalized)
  ) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function isRouteOrderCompleted(
  status?: string | null,
) {
  return [
    "completed",
    "finished",
    "done",
  ].includes(
    normalizeRouteStatus(status),
  );
}

export function technicianInitials(
  name: string,
) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "T";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0] || ""}${
    parts[parts.length - 1][0] || ""
  }`.toUpperCase();
}

export function getTechnicianWeekMetrics(
  technicians: RouteTechnicianOption[],
  routes: RouteDashboardItem[],
  weekStartDate: string,
): Record<
  string,
  TechnicianWeekMetric
> {
  const weekEnd = addDays(
    weekStartDate,
    6,
  );

  const result: Record<
    string,
    TechnicianWeekMetric
  > = {};

  for (const technician of technicians) {
    const technicianRoutes =
      routes.filter(
        (route) =>
          route.employeeUserId ===
            technician.id &&
          route.routeDate >=
            weekStartDate &&
          route.routeDate <= weekEnd,
      );

    result[technician.id] = {
      routes:
        technicianRoutes.length,

      orders:
        technicianRoutes.reduce(
          (sum, route) =>
            sum +
            route.serviceOrderCount,
          0,
        ),

      completed:
        technicianRoutes.reduce(
          (sum, route) =>
            sum +
            route.serviceOrders.filter(
              (order) =>
                isRouteOrderCompleted(
                  order.status,
                ),
            ).length,
          0,
        ),
    };
  }

  return result;
}

export function getTechnicianDayMeta(
  routes: RouteDashboardItem[],
  technicianId: string,
  weekStartDate: string,
): Record<string, RouteDayMeta> {
  const result: Record<
    string,
    RouteDayMeta
  > = {};

  for (const day of getWeekDays(
    weekStartDate,
  )) {
    const route = routes.find(
      (item) =>
        item.employeeUserId ===
          technicianId &&
        sameDate(
          item.routeDate,
          day.date,
        ),
    );

    if (!route) {
      result[day.date] = {
        count: 0,
        label: "Sem rota",
      };

      continue;
    }

    const completed =
      route.serviceOrders.filter(
        (order) =>
          isRouteOrderCompleted(
            order.status,
          ),
      ).length;

    result[day.date] = {
      count: route.serviceOrderCount,

      label: `${completed}/${route.serviceOrderCount} concluídos`,

      status:
        routeStatusLabel(
          route.status,
        ),

      statusClassName:
        routeStatusClass(
          route.status,
        ),
    };
  }

  return result;
}

export function getTechnicianRouteForDate(
  routes: RouteDashboardItem[],
  technicianId: string,
  date: string,
) {
  return (
    routes.find(
      (route) =>
        route.employeeUserId ===
          technicianId &&
        sameDate(
          route.routeDate,
          date,
        ),
    ) || null
  );
}