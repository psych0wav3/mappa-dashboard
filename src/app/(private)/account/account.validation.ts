import type { UpdateCompanyProfileInput } from "./account.types";

export function validateCompanyProfileInput(input: UpdateCompanyProfileInput) {
  const tradeName = input.tradeName.trim();
  if (!tradeName) throw new Error("Informe o nome fantasia da empresa.");

  const email = input.email.trim();
  const phone = input.phone.replace(/\D/g, "");
  return {
    tradeName,
    email: email || null,
    phone: phone || null,
  };
}
