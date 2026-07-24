import type {
  RecurrenceFrequencyType,
  ServicePlan,
} from "./actions";

import {
  WEEKDAYS,
} from "./service-plans.constants";

type RecurrencePreviewInput = {
  frequencyType:
    RecurrenceFrequencyType;
  intervalValue?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number | null;
};

const WEEKDAY_LABELS =
  new Map<number, string>(
    WEEKDAYS.map((weekday) => [
      weekday.value,
      weekday.shortLabel,
    ]),
  );

const WEEKDAY_FULL_LABELS =
  new Map<number, string>(
    WEEKDAYS.map((weekday) => [
      weekday.value,
      weekday.label,
    ]),
  );

export function todayIso() {
  const now = new Date();

  const timezoneOffset =
    now.getTimezoneOffset() * 60_000;

  return new Date(
    now.getTime() - timezoneOffset,
  )
    .toISOString()
    .slice(0, 10);
}

export function normalizeSearchText(
  value?: string | null,
) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function formatDateLabel(
  value?: string | null,
) {
  if (!value) {
    return "Não informada";
  }

  const normalizedValue =
    value.slice(0, 10);

  const [
    year,
    month,
    day,
  ] = normalizedValue.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function formatCurrencyBRL(
  value?: number | null,
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "Ainda não definido";
  }

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  ).format(value);
}

export function getIntervalUnit(
  frequencyType:
    RecurrenceFrequencyType,
  intervalValue: number,
) {
  const singular =
    intervalValue === 1;

  switch (frequencyType) {
    case "DAILY":
      return singular
        ? "dia"
        : "dias";

    case "WEEKLY":
      return singular
        ? "semana"
        : "semanas";

    case "MONTHLY":
      return singular
        ? "mês"
        : "meses";

    default:
      return "";
  }
}

export function getRecurrencePreview({
  frequencyType,
  intervalValue = 1,
  daysOfWeek = [],
  dayOfMonth,
}: RecurrencePreviewInput) {
  const safeInterval =
    Number.isInteger(intervalValue) &&
    intervalValue > 0
      ? intervalValue
      : 1;

  if (
    frequencyType === "DAILY"
  ) {
    if (safeInterval === 1) {
      return (
        "O atendimento acontecerá " +
        "todos os dias."
      );
    }

    return (
      "O atendimento acontecerá a " +
      `cada ${safeInterval} dias.`
    );
  }

  if (
    frequencyType === "WEEKLY"
  ) {
    const selectedDays =
      [...daysOfWeek]
        .sort(
          (first, second) =>
            first - second,
        )
        .map(
          (day) =>
            WEEKDAY_FULL_LABELS.get(
              day,
            ),
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(label),
        );

    if (
      selectedDays.length === 0
    ) {
      return (
        "Selecione pelo menos um " +
        "dia da semana."
      );
    }

    const daysLabel =
      selectedDays.join(", ");

    if (safeInterval === 1) {
      return (
        "O atendimento acontecerá " +
        `toda semana: ${daysLabel}.`
      );
    }

    return (
      "O atendimento acontecerá a " +
      `cada ${safeInterval} semanas: ` +
      `${daysLabel}.`
    );
  }

  if (
    frequencyType === "MONTHLY"
  ) {
    const safeDay =
      typeof dayOfMonth === "number" &&
      dayOfMonth >= 1 &&
      dayOfMonth <= 31
        ? dayOfMonth
        : 1;

    if (safeInterval === 1) {
      return (
        "O atendimento acontecerá " +
        `todo mês, no dia ${safeDay}.`
      );
    }

    return (
      "O atendimento acontecerá a " +
      `cada ${safeInterval} meses, ` +
      `no dia ${safeDay}.`
    );
  }

  return (
    "Recorrência não informada."
  );
}

export function recurrenceLabel(
  plan: Pick<
    ServicePlan,
    "recurrence"
  >,
) {
  const recurrence =
    plan.recurrence;

  if (!recurrence) {
    return (
      "Recorrência não informada"
    );
  }

  const intervalValue =
    Number.isInteger(
      recurrence.intervalValue,
    ) &&
    recurrence.intervalValue > 0
      ? recurrence.intervalValue
      : 1;

  if (
    recurrence.frequencyType ===
    "DAILY"
  ) {
    return intervalValue === 1
      ? "Todos os dias"
      : `A cada ${intervalValue} dias`;
  }

  if (
    recurrence.frequencyType ===
    "WEEKLY"
  ) {
    const days =
      (
        recurrence.daysOfWeek ??
        []
      )
        .map(
          (day) =>
            WEEKDAY_LABELS.get(day),
        )
        .filter(
          (
            label,
          ): label is string =>
            Boolean(label),
        );

    if (days.length === 0) {
      return intervalValue === 1
        ? "Toda semana"
        : `A cada ${intervalValue} semanas`;
    }

    if (intervalValue === 1) {
      return `Toda semana: ${days.join(
        ", ",
      )}`;
    }

    return (
      `A cada ${intervalValue} semanas: ` +
      days.join(", ")
    );
  }

  if (
    recurrence.frequencyType ===
    "MONTHLY"
  ) {
    const dayOfMonth =
      recurrence.dayOfMonth;

    if (!dayOfMonth) {
      return intervalValue === 1
        ? "Todo mês"
        : `A cada ${intervalValue} meses`;
    }

    if (intervalValue === 1) {
      return (
        `Todo mês no dia ` +
        `${dayOfMonth}`
      );
    }

    return (
      `A cada ${intervalValue} meses ` +
      `no dia ${dayOfMonth}`
    );
  }

  return (
    "Recorrência não informada"
  );
}

export function statusLabel(
  status: string,
) {
  switch (status) {
    case "PENDING_APPROVAL":
      return "Aguardando aprovação";

    case "ACTIVE":
      return "Ativa";

    case "PAUSED":
      return "Pausada";

    case "CANCELED":
      return "Cancelada";

    case "FINISHED":
      return "Encerrada";

    default:
      return "Status não informado";
  }
}

export function rightStatusLabel(
  status: string,
) {
  switch (status) {
    case "PENDING_APPROVAL":
      return "Aguardando o cliente";

    case "ACTIVE":
      return "Rotina ativa";

    case "PAUSED":
      return "Rotina pausada";

    case "CANCELED":
      return "Rotina cancelada";

    case "FINISHED":
      return "Rotina encerrada";

    default:
      return "Status não informado";
  }
}

export function rightStatusClassName(
  status: string,
) {
  switch (status) {
    case "PENDING_APPROVAL":
      return [
        "border",
        "border-blue-200",
        "bg-blue-50",
        "text-blue-700",
      ].join(" ");

    case "ACTIVE":
      return [
        "border",
        "border-emerald-200",
        "bg-emerald-50",
        "text-emerald-700",
      ].join(" ");

    case "PAUSED":
      return [
        "border",
        "border-amber-200",
        "bg-amber-50",
        "text-amber-700",
      ].join(" ");

    case "CANCELED":
    case "FINISHED":
      return [
        "border",
        "border-slate-200",
        "bg-slate-100",
        "text-slate-600",
      ].join(" ");

    default:
      return [
        "border",
        "border-slate-200",
        "bg-slate-50",
        "text-slate-600",
      ].join(" ");
  }
}

export function footerMessage(
  status: string,
) {
  switch (status) {
    case "PENDING_APPROVAL":
      return (
        "A rotina foi enviada para " +
        "aprovação. Ela será ativada " +
        "automaticamente quando o " +
        "cliente aprovar."
      );

    case "ACTIVE":
      return (
        "A rotina está ativa e seguirá " +
        "o calendário de atendimentos " +
        "configurado."
      );

    case "PAUSED":
      return (
        "A rotina está pausada e não " +
        "gerará novos atendimentos até " +
        "ser reativada."
      );

    case "CANCELED":
      return (
        "A rotina foi cancelada e não " +
        "gerará novos atendimentos."
      );

    case "FINISHED":
      return "A rotina foi encerrada.";

    default:
      return (
        "Status da rotina " +
        "indisponível."
      );
  }
}

export function footerClassName(
  status: string,
) {
  switch (status) {
    case "PENDING_APPROVAL":
      return [
        "border-t",
        "border-blue-100",
        "bg-blue-50/70",
        "text-blue-700",
      ].join(" ");

    case "ACTIVE":
      return [
        "border-t",
        "border-emerald-100",
        "bg-emerald-50/70",
        "text-emerald-700",
      ].join(" ");

    case "PAUSED":
      return [
        "border-t",
        "border-amber-100",
        "bg-amber-50/70",
        "text-amber-700",
      ].join(" ");

    default:
      return [
        "border-t",
        "border-slate-200",
        "bg-slate-50",
        "text-slate-600",
      ].join(" ");
  }
}

