import type { ApiAddress, RouteWeekday } from "./routes.types";

export function toApiDate(value: string) {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [day, month, year] = value.split("-");
    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

export function normalizeStatus(status?: string | null) {
  return String(status || "")
    .replace(/[_\s-]/g, "")
    .toLowerCase();
}

export function splitName(name?: string | null) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

export function addressLabel(address?: string | ApiAddress | null) {
  if (!address) return "Endereço não informado";

  if (typeof address === "string") {
    return address || "Endereço não informado";
  }

  const line = [
    address.street,
    address.number,
    address.neighborhood,
    address.city && `${address.city}${address.state ? `/${address.state}` : ""}`,
    address.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return line || "Endereço não informado";
}

export function getAddressLatitude(address?: string | ApiAddress | null) {
  if (!address || typeof address === "string") return 0;

  return Number(address.latitude || 0);
}

export function getAddressLongitude(address?: string | ApiAddress | null) {
  if (!address || typeof address === "string") return 0;

  return Number(address.longitude || 0);
}

export function extractLine(
  description: string | null | undefined,
  label: string,
) {
  const target = label.toLowerCase();

  const line = String(description || "")
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.toLowerCase().startsWith(target));

  if (!line) return "";

  return line.slice(label.length).trim();
}

export function parseTechnicianName(description?: string | null) {
  const line = extractLine(description, "Técnico responsável:");

  if (!line || line === "Não informado") return null;

  return line;
}

export function parseTechnicianId(description?: string | null) {
  const line = extractLine(description, "Técnico ID:");

  if (!line || line === "Não informado") return null;

  return line;
}

export function parseServiceKind(
  description?: string | null,
  title?: string | null,
) {
  const line = extractLine(description, "Tipo da OS:");

  if (line.toLowerCase().includes("produto")) {
    return "ADDITIONAL_SERVICE" as const;
  }

  if (String(title || "").toLowerCase().includes("troca")) {
    return "ADDITIONAL_SERVICE" as const;
  }

  if (String(title || "").toLowerCase().includes("cloro")) {
    return "ADDITIONAL_SERVICE" as const;
  }

  return "POOL_CLEANING" as const;
}

export function parseFrequencyLabel(description?: string | null) {
  const line = extractLine(description, "Frequência:");

  if (!line) return "Avulsa";

  return line;
}

export function parseScheduledTime(description?: string | null) {
  const line = extractLine(description, "Horário previsto:");

  if (!line) return "Horário não informado";

  if (/^\d{2}:\d{2}$/.test(line)) {
    return line;
  }

  return line.slice(0, 5) || "Horário não informado";
}

export function parseWeekdaysLabel(description?: string | null) {
  const line = extractLine(description, "Dias da semana:");

  if (!line) return "Não se aplica";

  return line;
}

export function parseWeekdays(description?: string | null): RouteWeekday[] {
  const line = extractLine(description, "Dias da semana:");

  if (!line || line.toLowerCase().includes("não se aplica")) {
    return [];
  }

  const value = line.toLowerCase();

  const days: RouteWeekday[] = [];

  if (value.includes("segunda")) days.push("MONDAY");
  if (value.includes("terça") || value.includes("terca")) days.push("TUESDAY");
  if (value.includes("quarta")) days.push("WEDNESDAY");
  if (value.includes("quinta")) days.push("THURSDAY");
  if (value.includes("sexta")) days.push("FRIDAY");

  if (value.includes("sábado") || value.includes("sabado")) {
    days.push("SATURDAY");
  }

  if (value.includes("domingo")) {
    days.push("SUNDAY");
  }

  return days;
}

export function weekdayToDate(weekStartDate: string, weekday: RouteWeekday) {
  const offsets: Record<RouteWeekday, number> = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,
  };

  const date = new Date(`${weekStartDate}T00:00:00`);

  date.setDate(date.getDate() + offsets[weekday]);

  return date.toISOString().slice(0, 10);
}