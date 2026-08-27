import type { SaveAgreementInput } from "./agreements.types";

export function validateAgreementInput(input: SaveAgreementInput) {
  const title = input.title.trim();
  const content = input.content.trim();
  if (title.length < 3) throw new Error("Informe um título válido.");
  if (content.length < 10) throw new Error("Informe o conteúdo do termo.");

  return {
    title,
    content,
    version: input.version?.trim() || "1",
    isActive: input.isActive !== false,
  };
}
