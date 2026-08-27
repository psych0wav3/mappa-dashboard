import { extractItems } from "@/lib/mappa/api";
import type { ApiEmployee, Tech } from "./technicians.types";

function splitName(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export function normalizeEmployee(employee: ApiEmployee): Tech {
  const { firstName, lastName } = splitName(employee.name);
  return {
    id: employee.userId || employee.id,
    firstName,
    lastName,
    email: employee.email,
    phone: employee.phone ?? null,
    active: employee.status === "ACTIVE",
    role: "TECH",
  };
}

export function extractEmployees(payload: unknown): ApiEmployee[] {
  return extractItems<ApiEmployee>(payload, ["employees"]);
}
