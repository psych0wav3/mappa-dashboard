"use server";

import { revalidatePath } from "next/cache";

import {
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

export type WorkOrderPricingItemType =
  | "LABOR"
  | "MATERIAL"
  | "PRODUCT"
  | "SERVICE"
  | "OTHER";

export type PriceWorkOrderInput = {
  serviceOrderId: string;
  scheduledDate: string;
  notes?: string;

  items: Array<{
    type: WorkOrderPricingItemType;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
};

type PriceWorkOrderResponse = {
  id: string;
  status?: string | null;
  totalAmount?: number | null;
};

function toApiDate(value: string) {
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    return value;
  }

  if (
    /^\d{2}\/\d{2}\/\d{4}$/.test(
      value,
    )
  ) {
    const [
      day,
      month,
      year,
    ] = value.split("/");

    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

export async function priceWorkOrder(
  input: PriceWorkOrderInput,
) {
  const companyId =
    await getCompanyId();

  if (!input.serviceOrderId) {
    throw new Error(
      "ID da ordem de serviço não informado.",
    );
  }

  if (!input.scheduledDate) {
    throw new Error(
      "Informe a data prevista para o serviço.",
    );
  }

  if (
    !Array.isArray(input.items) ||
    input.items.length === 0
  ) {
    throw new Error(
      "Adicione pelo menos um item ao orçamento.",
    );
  }

  const items = input.items.map(
    (item, index) => {
      const description =
        item.description.trim();

      const quantity =
        Number(item.quantity);

      const unitPrice =
        Number(item.unitPrice);

      if (!description) {
        throw new Error(
          `Informe a descrição do item ${
            index + 1
          }.`,
        );
      }

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          `Informe uma quantidade válida para o item ${
            index + 1
          }.`,
        );
      }

      if (
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        throw new Error(
          `Informe um valor válido para o item ${
            index + 1
          }.`,
        );
      }

      return {
        type: item.type,
        description,
        quantity,
        unitPrice,
      };
    },
  );

  const totalAmount =
    items.reduce(
      (total, item) =>
        total +
        item.quantity *
          item.unitPrice,
      0,
    );

  if (totalAmount <= 0) {
    throw new Error(
      "O valor total do orçamento deve ser maior que zero.",
    );
  }

  const updated =
    await mappaFetch<PriceWorkOrderResponse>(
      `/api/companies/${companyId}/service-orders/${input.serviceOrderId}/pricing`,
      {
        method: "PATCH",

        body: JSON.stringify({
          scheduledDate:
            toApiDate(
              input.scheduledDate,
            ),

          notes:
            input.notes?.trim() ||
            null,

          items,
        }),
      },
    );

  revalidatePath("/workorders");

  revalidatePath(
    "/workorders/pricing",
  );

  revalidatePath(
    "/workorders/customer-approval",
  );

  return updated;
}