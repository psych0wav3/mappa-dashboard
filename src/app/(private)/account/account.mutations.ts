"use server";

import { revalidatePath } from "next/cache";
import { getCompanyId, mappaFetch } from "@/lib/mappa/api";
import { normalizeCompany } from "./account.normalizers";
import type { CompanyProfile, UpdateCompanyProfileInput } from "./account.types";
import { validateCompanyProfileInput } from "./account.validation";

export async function updateAccountCompany(
  input: UpdateCompanyProfileInput,
): Promise<CompanyProfile | null> {
  const companyId = await getCompanyId();
  const company = await mappaFetch<unknown>(`/api/companies/${companyId}`, {
    method: "PATCH",
    body: JSON.stringify(validateCompanyProfileInput(input)),
  });
  revalidatePath("/account");
  return normalizeCompany(company);
}
