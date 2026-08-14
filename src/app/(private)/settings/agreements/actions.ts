"use server";

import { revalidatePath } from "next/cache";
import { mappaFetch, extractItems } from "@/lib/mappa/api";

export type Agreement = {
  id: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type UserAgreement = Agreement & {
  accepted: boolean;
  acceptedAt: string | null;
};

export type SaveAgreementInput = {
  title: string;
  content: string;
  version?: string;
  isActive?: boolean;
};

type ApiAgreement = {
  id: string;
  title?: string | null;
  content?: string | null;
  version?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  accepted?: boolean | null;
  acceptedAt?: string | null;
};

function normalizeAgreement(item: ApiAgreement): Agreement {
  return {
    id: item.id,
    title: item.title || "Sem título",
    content: item.content || "",
    version: item.version || "1",
    isActive: item.isActive !== false,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || undefined,
  };
}

function normalizeUserAgreement(item: ApiAgreement): UserAgreement {
  return {
    ...normalizeAgreement(item),
    accepted: Boolean(item.accepted),
    acceptedAt: item.acceptedAt ?? null,
  };
}

export async function listAgreementsAdmin(
  activeOnly = false,
): Promise<Agreement[]> {
  const data = await mappaFetch<unknown>(
    `/api/agreements?activeOnly=${activeOnly}`,
  );

  return extractItems<ApiAgreement>(data).map(normalizeAgreement);
}

export async function createAgreement(input: SaveAgreementInput) {
  const title = input.title.trim();
  const content = input.content.trim();

  if (title.length < 3) throw new Error("Informe um título válido.");
  if (content.length < 10) throw new Error("Informe o conteúdo do termo.");

  const created = await mappaFetch<ApiAgreement>("/api/agreements", {
    method: "POST",
    body: JSON.stringify({
      title,
      content,
      version: input.version?.trim() || "1",
      isActive: input.isActive !== false,
    }),
  });

  revalidatePath("/settings/agreements");
  return normalizeAgreement(created);
}

export async function updateAgreementStatus(params: {
  agreementId: string;
  isActive: boolean;
}) {
  const updated = await mappaFetch<ApiAgreement>(
    `/api/agreements/${params.agreementId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive: params.isActive }),
    },
  );

  revalidatePath("/settings/agreements");
  return normalizeAgreement(updated);
}

export async function listMyAgreements(
  pendingOnly = false,
): Promise<UserAgreement[]> {
  const data = await mappaFetch<unknown>(
    `/api/me/agreements?pendingOnly=${pendingOnly}`,
  );

  return extractItems<ApiAgreement>(data).map(normalizeUserAgreement);
}

export async function acceptAgreement(agreementId: string) {
  await mappaFetch<null>(`/api/me/agreements/${agreementId}/accept`, {
    method: "POST",
  });

  revalidatePath("/");
  return { ok: true };
}
