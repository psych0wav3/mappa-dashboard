import {
  normalizeDaysOfWeek,
  positiveInteger,
  toApiDate,
} from "./service-plans.normalizers";

import type {
  SaveServicePlanInput,
} from "./service-plans.types";

export function validateServicePlanInput(
  input: SaveServicePlanInput,
) {
  if (
    !input.customerId
  ) {
    throw new Error(
      "Selecione o cliente/piscina.",
    );
  }

  if (
    !input.customerAddressId
  ) {
    throw new Error(
      "O cliente selecionado não possui endereço válido.",
    );
  }

  if (
    !input.title.trim()
  ) {
    throw new Error(
      "Informe o nome da rotina.",
    );
  }

  if (
    !input.startDate
  ) {
    throw new Error(
      "Informe a data de início.",
    );
  }

  if (
    input.endDate &&
    input.endDate <
      input.startDate
  ) {
    throw new Error(
      "A data final não pode ser anterior à data inicial.",
    );
  }

  const totalAmount =
    Number(
      input.totalAmount,
    );

  if (
    !Number.isFinite(
      totalAmount,
    ) ||
    totalAmount <= 0
  ) {
    throw new Error(
      "Informe um valor maior que zero.",
    );
  }

  const recurrence =
    input.recurrence;

  if (
    !Number.isInteger(
      recurrence.intervalValue,
    ) ||
    recurrence.intervalValue <=
      0
  ) {
    throw new Error(
      "O intervalo deve ser maior que zero.",
    );
  }

  if (
    recurrence.frequencyType ===
      "WEEKLY" &&
    recurrence.daysOfWeek
      .length === 0
  ) {
    throw new Error(
      "Selecione pelo menos um dia da semana.",
    );
  }

  if (
    recurrence.frequencyType ===
    "WEEKLY"
  ) {
    const hasInvalidDay =
      recurrence.daysOfWeek.some(
        (day) =>
          !Number.isInteger(
            day,
          ) ||
          day < 1 ||
          day > 7,
      );

    if (
      hasInvalidDay
    ) {
      throw new Error(
        "Os dias da semana devem estar entre 1 e 7.",
      );
    }
  }

  if (
    recurrence.frequencyType ===
    "MONTHLY"
  ) {
    if (
      !recurrence.dayOfMonth ||
      recurrence.dayOfMonth <
        1 ||
      recurrence.dayOfMonth >
        31
    ) {
      throw new Error(
        "Informe um dia do mês entre 1 e 31.",
      );
    }
  }
}

export function buildCreateServicePlanPayload(
  input: SaveServicePlanInput,
) {
  validateServicePlanInput(
    input,
  );

  const recurrence =
    input.recurrence;

  return {
    customerId:
      input.customerId,

    customerAddressId:
      input.customerAddressId,

    title:
      input.title.trim(),

    description:
      input.description?.trim() ||
      "",

    startDate:
      toApiDate(
        input.startDate,
      ),

    endDate:
      toApiDate(
        input.endDate,
      ),

    items: [
      {
        type:
          "SERVICE",

        description:
          input.title.trim() ||
          "Mensalidade da rotina",

        quantity:
          1,

        unitPrice:
          Number(
            input.totalAmount,
          ),
      },
    ],

    checklistTemplateId:
      input.checklistTemplateId ||
      null,

    measurementTemplateId:
      input.measurementTemplateId ||
      null,

    preferredEmployeeUserId:
      input.preferredEmployeeUserId ||
      null,

    recurrence: {
      frequencyType:
        recurrence.frequencyType,

      intervalValue:
        recurrence.intervalValue,

      daysOfWeek:
        recurrence.frequencyType ===
        "WEEKLY"
          ? normalizeDaysOfWeek(
              recurrence.daysOfWeek,
            )
          : [],

      dayOfMonth:
        recurrence.frequencyType ===
        "MONTHLY"
          ? recurrence.dayOfMonth ??
            null
          : null,

      generateDaysAhead:
        positiveInteger(
          recurrence
            .generateDaysAhead,
          30,
        ),
    },
  };
}
