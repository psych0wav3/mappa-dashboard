import type { CompanyProfile } from "./account.types";

function readString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function normalizeCompany(value: unknown): CompanyProfile | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = readString(record, "id", "Id");
  const name = readString(record, "name", "Name");
  const tradeName = readString(record, "tradeName", "TradeName");
  const taxId = readString(record, "document", "Document", "taxId", "TaxId");
  const email = readString(record, "email", "Email");
  const phone = readString(record, "phone", "Phone");
  const status = readString(record, "status", "Status");

  if (!id && !name && !tradeName) return null;
  return {
    id: id ?? "",
    name: name ?? tradeName ?? "Empresa",
    tradeName,
    taxId,
    email,
    phone,
    status,
  };
}
