"use server";

import { revalidatePath } from "next/cache";
import { mappaFetch } from "@/lib/mappa/api";
import { normalizeAgreement } from "./agreements.normalizers";
import type { ApiAgreement, SaveAgreementInput } from "./agreements.types";
import { validateAgreementInput } from "./agreements.validation";

export async function createAgreement(input: SaveAgreementInput) {
  const created = await mappaFetch<ApiAgreement>("/api/agreements", {
    method: "POST",
    body: JSON.stringify(validateAgreementInput(input)),
  });
  revalidatePath("/settings/agreements");
  return normalizeAgreement(created);
}

export async function updateAgreementStatus(params: {
  agreementId: string;
  isActive: boolean;
}) {
  if (!params.agreementId) throw new Error("ID do termo não informado.");
  const updated = await mappaFetch<ApiAgreement>(`/api/agreements/${params.agreementId}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive: params.isActive }),
  });
  revalidatePath("/settings/agreements");
  return normalizeAgreement(updated);
}

export async function acceptAgreement(agreementId: string) {
  if (!agreementId) throw new Error("ID do termo não informado.");
  await mappaFetch<null>(`/api/me/agreements/${agreementId}/accept`, { method: "POST" });
  revalidatePath("/");
  return { ok: true };
}
