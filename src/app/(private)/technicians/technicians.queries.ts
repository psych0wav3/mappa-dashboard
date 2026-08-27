"use server";

import { getCompanyId, mappaFetch } from "@/lib/mappa/api";
import { extractEmployees, normalizeEmployee } from "./technicians.normalizers";
import type { Tech } from "./technicians.types";

export async function listTechnicians(): Promise<Tech[]> {
  const companyId = await getCompanyId();
  const payload = await mappaFetch<unknown>(`/api/companies/${companyId}/employees`);

  return extractEmployees(payload)
    .map(normalizeEmployee)
    .sort((first, second) => {
      const firstName = [first.firstName, first.lastName].filter(Boolean).join(" ");
      const secondName = [second.firstName, second.lastName].filter(Boolean).join(" ");
      return firstName.localeCompare(secondName, "pt-BR");
    });
}
