"use server";

import { getCompanyId, mappaFetch } from "@/lib/mappa/api";
import { normalizeCompany } from "./account.normalizers";
import type { CompanyProfile } from "./account.types";

export async function getAccountCompany(): Promise<CompanyProfile | null> {
  const companyId = await getCompanyId();
  const company = await mappaFetch<unknown>(`/api/companies/${companyId}`);
  return normalizeCompany(company);
}
