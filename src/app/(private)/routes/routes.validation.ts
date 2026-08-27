import type { CreateRoutePlannerInput } from "./routes.types";

export function normalizeRouteOrigin(value?: string | null) {
  return String(value || "").replace(/[_\s-]/g, "").toLowerCase();
}

export function validateRouteInput(input: CreateRoutePlannerInput) {
  const title = input.title.trim();

  if (!title) {
    throw new Error("Informe o nome da rota.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.routeDate)) {
    throw new Error("Informe uma data válida para a rota.");
  }

  if (!input.employeeUserId) {
    throw new Error("Selecione o técnico responsável.");
  }

  const serviceOrderIds = Array.from(
    new Set(input.serviceOrderIds.filter(Boolean)),
  );

  if (!serviceOrderIds.length) {
    throw new Error("Adicione ao menos uma OS à rota.");
  }

  return {
    title,
    routeDate: input.routeDate,
    employeeUserId: input.employeeUserId,
    serviceOrderIds,
  };
}

export function routeTitle(routeDate: string, employeeName: string) {
  const weekday = new Date(`${routeDate}T12:00:00`).toLocaleDateString(
    "pt-BR",
    { weekday: "long" },
  );
  const formattedWeekday = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`;

  return `Rota de ${formattedWeekday} — ${employeeName}`;
}
