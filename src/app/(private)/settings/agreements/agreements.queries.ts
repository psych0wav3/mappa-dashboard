"use server";

import { extractItems, mappaFetch } from "@/lib/mappa/api";
import { normalizeAgreement, normalizeUserAgreement } from "./agreements.normalizers";
import type { Agreement, ApiAgreement, UserAgreement } from "./agreements.types";

export async function listAgreementsAdmin(activeOnly = false): Promise<Agreement[]> {
  const data = await mappaFetch<unknown>(`/api/agreements?activeOnly=${activeOnly}`);
  return extractItems<ApiAgreement>(data).map(normalizeAgreement);
}

export async function listMyAgreements(pendingOnly = false): Promise<UserAgreement[]> {
  const data = await mappaFetch<unknown>(`/api/me/agreements?pendingOnly=${pendingOnly}`);
  return extractItems<ApiAgreement>(data).map(normalizeUserAgreement);
}
