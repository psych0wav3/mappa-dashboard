import type {
  ApiAddress,
  ApiCustomer,
  ApiServiceOrder,
  ApiServiceOrderItem,
  WorkOrderItem,
  WorkOrderListItem,
} from "./workorders.types";

export function sanitizeOptionalText(
  value?: string | null,
) {
  const cleaned = String(value ?? "").trim();

  // Server Actions às vezes serializam `undefined` como "$undefined".
  if (
    !cleaned ||
    cleaned === "$undefined" ||
    cleaned === "undefined"
  ) {
    return null;
  }

  return cleaned;
}

export function toApiDate(value: string) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] =
      value.split("/");

    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

export function toApiStatus(value?: string) {
  if (!value) {
    return "";
  }

  const normalized = value
    .replace(/[_\s-]/g, "")
    .toUpperCase();

  const statuses: Record<string, string> = {
    PENDINGCOMPANYPRICING:
      "PendingCompanyPricing",

    PENDINGCUSTOMERAPPROVAL:
      "PendingCustomerApproval",

    WAITINGEXECUTION:
      "WaitingExecution",

    INROUTE:
      "InRoute",

    INPROGRESS:
      "InProgress",

    DONE:
      "Done",

    FINISHED:
      "Done",

    CANCELED:
      "Canceled",

    CANCELLED:
      "Canceled",

    APPROVED:
      "WaitingExecution",
  };

  return statuses[normalized] || value;
}

export function normalizeStatus(
  value?: string | null,
) {
  const normalized = String(
    value || "WaitingExecution",
  )
    .replace(/[_\s-]/g, "")
    .toUpperCase();

  const statuses: Record<string, string> = {
    PENDINGCOMPANYPRICING:
      "PendingCompanyPricing",

    PENDINGCUSTOMERAPPROVAL:
      "PendingCustomerApproval",

    WAITINGEXECUTION:
      "WaitingExecution",

    INROUTE:
      "InRoute",

    INPROGRESS:
      "InProgress",

    DONE:
      "Done",

    FINISHED:
      "Done",

    CANCELED:
      "Canceled",

    CANCELLED:
      "Canceled",
  };

  return (
    statuses[normalized] ||
    value ||
    "WaitingExecution"
  );
}

export function normalizeServiceOrderOrigin(
  value?: string | null,
) {
  return String(value ?? "")
    .replace(/[_\s-]/g, "")
    .toUpperCase();
}

export function addressLabel(
  address?: ApiAddress | null,
) {
  if (!address) {
    return "Endereço não informado";
  }

  const line = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    address.city &&
      `${address.city}${
        address.state
          ? `/${address.state}`
          : ""
      }`,
    address.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return line || "Endereço não informado";
}

export function serviceOrderAddressLabel(
  address?: string | ApiAddress | null,
) {
  if (!address) {
    return "Endereço não informado";
  }

  if (typeof address === "string") {
    return (
      address || "Endereço não informado"
    );
  }

  return addressLabel(address);
}

export function getMainAddress(
  customer: ApiCustomer,
) {
  if (customer.mainAddress) {
    return customer.mainAddress;
  }

  if (Array.isArray(customer.addresses)) {
    return (
      customer.addresses.find(
        (address) =>
          address.isMain === true,
      ) ||
      customer.addresses[0] ||
      null
    );
  }

  return null;
}

export function normalizeWorkOrderItems(
  items?: ApiServiceOrderItem[] | null,
): WorkOrderItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const quantity = Number(
        item.quantity || 0,
      );

      const unitPrice = Number(
        item.unitPrice || 0,
      );

      const subtotal = Number(
        item.subtotal ??
          quantity * unitPrice,
      );

      return {
        id: item.id || undefined,

        type: String(
          item.type || "SERVICE",
        ),

        description: String(
          item.description || "",
        ),

        quantity,

        unitPrice,

        subtotal,
      };
    })
    .filter(
      (item) =>
        item.description.trim().length > 0,
    );
}

export function normalizeWorkOrder(
  order: ApiServiceOrder,
): WorkOrderListItem {
  const totalAmount = Number(
    order.totalAmount || 0,
  );

  const orderNumber =
    typeof order.orderNumber === "number" &&
    Number.isFinite(order.orderNumber)
      ? order.orderNumber
      : null;

  return {
    id: order.id,

    code:
      orderNumber != null
        ? String(orderNumber)
        : order.id,

    orderNumber,

    serviceOrderType:
      order.serviceOrderType ?? null,

    origin:
      order.origin ?? null,

    customerId:
      order.customerId || "",

    clientId:
      order.customerId || "",

    technicianId: null,

    customerName:
      order.customerName ||
      "Cliente não informado",

    customerAddressId:
      order.customerAddressId ?? null,

    address:
      serviceOrderAddressLabel(
        order.address,
      ),

    title:
      order.title ||
      "Ordem de serviço",

    description:
      order.description || "",

    scheduledDate:
      order.scheduledDate || "",

    totalAmount,

    pricingNotes:
      order.pricingNotes ?? null,

    amountCents:
      Math.round(
        totalAmount * 100,
      ),

    status:
      normalizeStatus(
        order.status,
      ),

    createdAt:
      order.createdAt ?? null,

    deletedAt: null,

    startTime: null,

    endTime: null,

    openedByUserId:
      order.openedByUserId ?? null,

    openedByUserName:
      order.openedByUserName ?? null,

    finishedByUserId:
      order.finishedByUserId ?? null,

    finishedByUserName:
      order.finishedByUserName ?? null,

    finishedAt:
      order.finishedAt ?? null,

    customerApprovedAt:
      order.customerApprovedAt ?? null,

    visits:
      order.visits ?? [],

    items:
      normalizeWorkOrderItems(
        order.items,
      ),

    client: {
      firstName:
        order.customerName ||
        "Cliente",

      lastName: "",
    },

    technician: null,
  };
}
