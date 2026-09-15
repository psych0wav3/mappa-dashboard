"use server";

import { revalidatePath } from "next/cache";

import {
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

import {
  normalizeWorkOrder,
  sanitizeOptionalText,
  toApiDate,
} from "./workorders.helpers";

import type {
  ApiServiceOrder,
  CreateAdminWorkOrderInput,
} from "./workorders.types";

export async function createAdminWorkOrder(
  input: CreateAdminWorkOrderInput,
) {
  const companyId =
    await getCompanyId();

  if (!input.customerId) {
    throw new Error(
      "Selecione o cliente/piscina.",
    );
  }

  if (
    !input.customerAddressId
  ) {
    throw new Error(
      "O cliente selecionado não possui endereço principal válido.",
    );
  }

  if (
    !input.title.trim()
  ) {
    throw new Error(
      "Informe o título da ordem de serviço.",
    );
  }

  if (
    !input.scheduledDate
  ) {
    throw new Error(
      "Informe a data agendada.",
    );
  }

  if (
    !Array.isArray(
      input.items,
    ) ||
    input.items.length ===
      0
  ) {
    throw new Error(
      "Adicione pelo menos um item à ordem de serviço.",
    );
  }

  const items =
    input.items.map(
      (
        item,
        index,
      ) => {
        const description =
          item.description.trim();

        const quantity =
          Number(
            item.quantity,
          );

        const unitPrice =
          Number(
            item.unitPrice,
          );

        if (
          !description
        ) {
          throw new Error(
            `Informe a descrição do item ${
              index + 1
            }.`,
          );
        }

        if (
          !Number.isFinite(
            quantity,
          ) ||
          quantity <= 0
        ) {
          throw new Error(
            `Informe uma quantidade válida para o item ${
              index + 1
            }.`,
          );
        }

        if (
          !Number.isFinite(
            unitPrice,
          ) ||
          unitPrice <= 0
        ) {
          throw new Error(
            `Informe um valor maior que zero para o item ${
              index + 1
            }.`,
          );
        }

        return {
          type:
            item.type,

          description,

          quantity,

          unitPrice,
        };
      },
    );

  const totalAmount =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.quantity *
          item.unitPrice,
      0,
    );

  if (
    totalAmount <= 0
  ) {
    throw new Error(
      "O valor total deve ser maior que zero.",
    );
  }

  const payload = {
    customerId:
      input.customerId,

    customerAddressId:
      input.customerAddressId,

    title:
      input.title.trim(),

    description:
      sanitizeOptionalText(
        input.description,
      ) || "",

    scheduledDate:
      toApiDate(
        input.scheduledDate,
      ),

    notes:
      sanitizeOptionalText(
        input.notes,
      ),

    items,

    checklistTemplateId:
      input.checklistTemplateId ||
      null,

    measurementTemplateId:
      input.measurementTemplateId ||
      null,
  };

  const created =
    await mappaFetch<ApiServiceOrder>(
      `/api/companies/${companyId}/service-orders/admin`,
      {
        method:
          "POST",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  revalidatePath(
    "/workorders",
  );

  revalidatePath(
    "/workorders/new",
  );

  revalidatePath(
    "/workorders/customer-approval",
  );

  revalidatePath(
    "/routes/builder",
  );

  revalidatePath(
    "/routes/dashboard",
  );

  return normalizeWorkOrder(
    created,
  );
}
