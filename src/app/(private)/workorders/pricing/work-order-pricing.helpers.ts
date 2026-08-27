import type {
  WorkOrderPricingItemType,
} from "./actions";

export type PricingItemForm = {
  id: string;
  type: WorkOrderPricingItemType;
  description: string;
  quantity: number;
  unitPrice: string;
  locked: boolean;
};

export const ITEM_TYPE_LABELS: Record<
  WorkOrderPricingItemType,
  string
> = {
  LABOR: "Mão de obra",
  PRODUCT: "Produto",
  MATERIAL: "Material",
  SERVICE: "Serviço adicional",
  OTHER: "Outro",
};

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export function createLaborItem(): PricingItemForm {
  return {
    id: createId(),
    type: "LABOR",
    description: "Mão de obra",
    quantity: 1,
    unitPrice: "",
    locked: true,
  };
}

export function createAdditionalItem(): PricingItemForm {
  return {
    id: createId(),
    type: "PRODUCT",
    description: "",
    quantity: 1,
    unitPrice: "",
    locked: false,
  };
}

export function todayIso() {
  const now = new Date();
  const timezoneOffset =
    now.getTimezoneOffset();

  return new Date(
    now.getTime() -
      timezoneOffset * 60_000,
  )
    .toISOString()
    .slice(0, 10);
}

export function parseMoney(
  value: string,
) {
  const cleanValue =
    value.trim();

  if (!cleanValue) {
    return 0;
  }

  let normalized =
    cleanValue.replace(
      /[^\d,.-]/g,
      "",
    );

  if (
    normalized.includes(",") &&
    normalized.includes(".")
  ) {
    normalized = normalized
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (
    normalized.includes(",")
  ) {
    normalized =
      normalized.replace(
        ",",
        ".",
      );
  }

  const parsed =
    Number(normalized);

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

export function formatMoneyInput(
  value: string,
) {
  const digits =
    value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const amount =
    Number(digits) / 100;

  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(amount);
}

export function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  ).format(value);
}

export function itemTotal(
  item: PricingItemForm,
) {
  const quantity =
    Math.max(
      1,
      Number(
        item.quantity || 1,
      ),
    );

  return (
    quantity *
    parseMoney(
      item.unitPrice,
    )
  );
}

export function getInitials(
  name: string,
) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
                                                                        
  if (
    parts.length === 0
  ) {
    return "CL";
  }

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0] ?? ""}${
    parts[1][0] ?? ""
  }`.toUpperCase();
}