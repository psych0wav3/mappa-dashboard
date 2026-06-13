export type RouteWeekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type RouteTechnician = {
  id: string;
  name: string;
};

export type AvailableWorkOrder = {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  serviceKind: "POOL_CLEANING" | "ADDITIONAL_SERVICE";
  frequencyLabel: string;
  weekdays: RouteWeekday[];
  scheduledTime: string;
  scheduledDate?: string;
  address: string;
  status: "APPROVED" | "WAITING_EXECUTION" | "READY_FOR_ROUTE";
  lat: number;
  lng: number;
};

export type PlannedRouteOrder = AvailableWorkOrder & {
  plannedId: string;
  technicianId: string;
  order: number;
};

export type SelectedRouteOrder = PlannedRouteOrder;

export const WEEKDAY_LABELS: Record<RouteWeekday, string> = {
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export const WEEKDAY_SHORT_LABELS: Record<RouteWeekday, string> = {
  MONDAY: "Seg",
  TUESDAY: "Ter",
  WEDNESDAY: "Qua",
  THURSDAY: "Qui",
  FRIDAY: "Sex",
  SATURDAY: "Sáb",
  SUNDAY: "Dom",
};

export const WEEKDAY_OPTIONS: Array<{
  value: RouteWeekday;
  short: string;
  label: string;
}> = [
  { value: "MONDAY", short: "Seg", label: "Segunda" },
  { value: "TUESDAY", short: "Ter", label: "Terça" },
  { value: "WEDNESDAY", short: "Qua", label: "Quarta" },
  { value: "THURSDAY", short: "Qui", label: "Quinta" },
  { value: "FRIDAY", short: "Sex", label: "Sexta" },
  { value: "SATURDAY", short: "Sáb", label: "Sábado" },
  { value: "SUNDAY", short: "Dom", label: "Domingo" },
];

export function weekdayLabel(day: RouteWeekday) {
  return WEEKDAY_LABELS[day] ?? day;
}

export function weekdayShortLabel(day: RouteWeekday) {
  return WEEKDAY_SHORT_LABELS[day] ?? day;
}

export function weekdaysLabel(days: RouteWeekday[]) {
  if (!days.length) return "Não se aplica";

  return days.map(weekdayLabel).join(", ");
}

export function serviceKindLabel(kind: AvailableWorkOrder["serviceKind"]) {
  return kind === "POOL_CLEANING"
    ? "Limpeza de piscina"
    : "Produto/serviço adicional";
}

export function statusLabel(status: AvailableWorkOrder["status"]) {
  const map: Record<AvailableWorkOrder["status"], string> = {
    APPROVED: "Aprovada",
    WAITING_EXECUTION: "Aguardando execução",
    READY_FOR_ROUTE: "Pronta para rota",
  };

  return map[status] ?? status;
}

export function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}