"use server";

import { revalidatePath } from "next/cache";

import {
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

export type CompanyProfile = {
  id: string;
  name: string;
  tradeName: string | null;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
};

export type UpdateCompanyProfileInput = {
  tradeName: string;
  email: string;
  phone: string;
};

function readString(
  record: Record<string, unknown>,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return null;
}

function normalizeCompany(
  value: unknown,
): CompanyProfile | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const record =
    value as Record<string, unknown>;

  const id = readString(
    record,
    "id",
    "Id",
  );

  const name = readString(
    record,
    "name",
    "Name",
  );

  const tradeName = readString(
    record,
    "tradeName",
    "TradeName",
  );

  const taxId = readString(
    record,
    "document",
    "Document",
    "taxId",
    "TaxId",
  );

  const email = readString(
    record,
    "email",
    "Email",
  );

  const phone = readString(
    record,
    "phone",
    "Phone",
  );

  const status = readString(
    record,
    "status",
    "Status",
  );

  if (
    !id &&
    !name &&
    !tradeName
  ) {
    return null;
  }

  return {
    id: id ?? "",
    name:
      name ??
      tradeName ??
      "Empresa",
    tradeName,
    taxId,
    email,
    phone,
    status,
  };
}

export async function getAccountCompany(): Promise<CompanyProfile | null> {
  const companyId =
    await getCompanyId();

  const company =
    await mappaFetch<unknown>(
      `/api/companies/${companyId}`,
    );

  return normalizeCompany(company);
}

export async function updateAccountCompany(
  input: UpdateCompanyProfileInput,
): Promise<CompanyProfile | null> {
  const companyId =
    await getCompanyId();

  const tradeName =
    input.tradeName.trim();

  const email =
    input.email.trim();

  const phone =
    input.phone.replace(/\D/g, "");

  if (!tradeName) {
    throw new Error(
      "Informe o nome fantasia da empresa.",
    );
  }

  const company =
    await mappaFetch<unknown>(
      `/api/companies/${companyId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          tradeName,
          email: email || null,
          phone: phone || null,
        }),
      },
    );

  revalidatePath("/account");

  return normalizeCompany(company);
}