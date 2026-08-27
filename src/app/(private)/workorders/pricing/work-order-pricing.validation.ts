import type {
  PriceWorkOrderInput,
  WorkOrderPricingItemType,
} from "./work-order-pricing.types";

const VALID_ITEM_TYPES = new Set<WorkOrderPricingItemType>([
  "LABOR",
  "MATERIAL",
  "PRODUCT",
  "SERVICE",
  "OTHER",
]);

function toApiDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }
  return value.slice(0, 10);
}

function optionalText(value?: string | null) {
  const cleaned = String(value ?? "").trim();
  if (!cleaned || cleaned === "$undefined" || cleaned === "undefined") return null;
  return cleaned;
}

export function validatePriceWorkOrderInput(input: PriceWorkOrderInput) {
  if (!input.serviceOrderId) throw new Error("ID da ordem de serviço não informado.");
  if (!input.scheduledDate) throw new Error("Informe a data prevista para o serviço.");
  if (!Array.isArray(input.items) || !input.items.length) {
    throw new Error("Adicione pelo menos um item ao orçamento.");
  }

  const items = input.items.map((item, index) => {
    const description = item.description.trim();
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    if (!VALID_ITEM_TYPES.has(item.type)) throw new Error(`O tipo do item ${index + 1} é inválido.`);
    if (!description) throw new Error(`Informe a descrição do item ${index + 1}.`);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(`Informe uma quantidade válida para o item ${index + 1}.`);
    }
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error(`Informe um valor maior que zero para o item ${index + 1}.`);
    }
    return { type: item.type, description, quantity, unitPrice };
  });

  if (!items.some((item) => item.type === "LABOR")) {
    throw new Error("O orçamento precisa possuir um item de mão de obra.");
  }
  const totalAmount = items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  );
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error("O valor total do orçamento deve ser maior que zero.");
  }

  return {
    serviceOrderId: input.serviceOrderId,
    payload: {
      scheduledDate: toApiDate(input.scheduledDate),
      notes: optionalText(input.notes),
      items,
    },
  };
}
