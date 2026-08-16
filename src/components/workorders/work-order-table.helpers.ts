import type {
  WorkOrderListItem,
} from "@/app/(private)/workorders/actions";

export function normalizeWorkOrderText(
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

export function normalizeWorkOrderStatus(
  status?: string | null,
) {
  return String(status ?? "")
    .replace(/[_\s-]/g, "")
    .toUpperCase();
}

export function normalizeWorkOrderOrigin(
  origin?: string | null,
) {
  return String(origin ?? "")
    .replace(/[_\s-]/g, "")
    .toUpperCase();
}

export function normalizeWorkOrderType(
  type?: string | null,
) {
  return String(type ?? "")
    .replace(/[_\s-]/g, "")
    .toUpperCase();
}

export function workOrderTypeLabel(
  order: WorkOrderListItem,
  fallbackType?: string | null,
) {
  const type =
    normalizeWorkOrderType(
      order.serviceOrderType,
    );

  const origin =
    normalizeWorkOrderOrigin(
      order.origin,
    );

  if (
    type === "RECURRENT" ||
    origin ===
      "SERVICEPLANAPPROVAL" ||
    origin ===
      "SERVICEPLANEXECUTION"
  ) {
    return "Serviço recorrente";
  }

  if (type === "ONETIME") {
    return "Serviço avulso";
  }

  if (fallbackType?.trim()) {
    return fallbackType.trim();
  }

  const typeMatch =
    String(
      order.description || "",
    ).match(
      /Tipo de atendimento:\s*([^\n.]+)\.?/i,
    );

  return (
    typeMatch?.[1]?.trim() ||
    "Serviço avulso"
  );
}

export function workOrderStatusLabel(
  status?: string | null,
) {
  const normalized =
    normalizeWorkOrderStatus(
      status,
    );

  const labels: Record<
    string,
    string
  > = {
    PENDINGCOMPANYPRICING:
      "Aguardando precificação",

    PENDINGCUSTOMERAPPROVAL:
      "Aguardando aprovação",

    WAITINGEXECUTION:
      "Pronta para rota",

    INROUTE:
      "Em rota",

    INPROGRESS:
      "Em execução",

    DONE:
      "Finalizada",

    FINISHED:
      "Finalizada",

    CANCELED:
      "Cancelada",

    CANCELLED:
      "Cancelada",

    REJECTED:
      "Recusada",
  };

  return (
    labels[normalized] ??
    status ??
    "Status não informado"
  );
}

export function workOrderStatusLabelForOrder(
  order: WorkOrderListItem,
) {
  const origin =
    normalizeWorkOrderOrigin(
      order.origin,
    );

  const status =
    normalizeWorkOrderStatus(
      order.status,
    );

  if (
    origin ===
    "SERVICEPLANAPPROVAL"
  ) {
    if (
      status === "DONE" ||
      status === "FINISHED"
    ) {
      return "Recorrência aprovada";
    }

    if (
      status === "CANCELED" ||
      status === "CANCELLED" ||
      status === "REJECTED"
    ) {
      return "Recorrência recusada";
    }
  }

  return workOrderStatusLabel(
    order.status,
  );
}

export function workOrderStatusClassName(
  status?: string | null,
) {
  const normalized =
    normalizeWorkOrderStatus(
      status,
    );

  if (
    normalized ===
    "PENDINGCOMPANYPRICING"
  ) {
    return [
      "border-amber-200",
      "bg-amber-50",
      "text-amber-700",
    ].join(" ");
  }

  if (
    normalized ===
    "PENDINGCUSTOMERAPPROVAL"
  ) {
    return [
      "border-blue-200",
      "bg-blue-50",
      "text-blue-700",
    ].join(" ");
  }

  if (
    normalized ===
    "WAITINGEXECUTION"
  ) {
    return [
      "border-emerald-200",
      "bg-emerald-50",
      "text-emerald-700",
    ].join(" ");
  }

  if (
    normalized === "INROUTE" ||
    normalized === "INPROGRESS"
  ) {
    return [
      "border-sky-200",
      "bg-sky-50",
      "text-sky-700",
    ].join(" ");
  }

  if (
    normalized === "DONE" ||
    normalized === "FINISHED"
  ) {
    return [
      "border-slate-200",
      "bg-slate-100",
      "text-slate-700",
    ].join(" ");
  }

  if (
    normalized === "CANCELED" ||
    normalized === "CANCELLED" ||
    normalized === "REJECTED"
  ) {
    return [
      "border-red-200",
      "bg-red-50",
      "text-red-700",
    ].join(" ");
  }

  return [
    "border-slate-200",
    "bg-slate-50",
    "text-slate-600",
  ].join(" ");
}

export function workOrderStatusDotClassName(
  status?: string | null,
) {
  const normalized =
    normalizeWorkOrderStatus(
      status,
    );

  if (
    normalized ===
    "PENDINGCOMPANYPRICING"
  ) {
    return "bg-amber-500";
  }

  if (
    normalized ===
    "PENDINGCUSTOMERAPPROVAL"
  ) {
    return "bg-blue-500";
  }

  if (
    normalized ===
    "WAITINGEXECUTION"
  ) {
    return "bg-emerald-500";
  }

  if (
    normalized === "INROUTE" ||
    normalized === "INPROGRESS"
  ) {
    return "bg-sky-500";
  }

  if (
    normalized === "CANCELED" ||
    normalized === "CANCELLED" ||
    normalized === "REJECTED"
  ) {
    return "bg-red-500";
  }

  return "bg-slate-400";
}

export function formatWorkOrderDate(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  const normalized =
    String(value).slice(0, 10);

  const [
    year,
    month,
    day,
  ] = normalized.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return normalized;
  }

  return `${day}/${month}/${year}`;
}

export function formatWorkOrderMoney(
  value?: number | null,
) {
  if (
    value == null ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  ).format(value);
}

export function filterWorkOrders(
  orders: WorkOrderListItem[],
  search: string,
) {
  const normalizedSearch =
    normalizeWorkOrderText(
      search,
    );

  if (!normalizedSearch) {
    return orders;
  }

  return orders.filter(
    (order) => {
      const content =
        normalizeWorkOrderText(
          [
            order.code,
            order.title,
            order.description,
            order.customerName,
            order.address,
            order.openedByUserName,
            order.finishedByUserName,
            order.serviceOrderType,
            order.origin,
            order.status,
            workOrderTypeLabel(order),
            workOrderStatusLabelForOrder(
              order,
            ),
            formatWorkOrderDate(
              order.scheduledDate,
            ),
            formatWorkOrderMoney(
              order.totalAmount,
            ),
          ]
            .filter(Boolean)
            .join(" "),
        );

      return content.includes(
        normalizedSearch,
      );
    },
  );
}
