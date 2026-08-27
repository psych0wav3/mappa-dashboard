import type { Agreement, ApiAgreement, UserAgreement } from "./agreements.types";

export function normalizeAgreement(item: ApiAgreement): Agreement {
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

export function normalizeUserAgreement(item: ApiAgreement): UserAgreement {
  return {
    ...normalizeAgreement(item),
    accepted: Boolean(item.accepted),
    acceptedAt: item.acceptedAt ?? null,
  };
}
