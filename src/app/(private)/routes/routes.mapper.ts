import type {
  ApiEmployee,
  ApiRouteDetailsResponse,
  ApiServiceOrder,
  AvailableRouteWorkOrder,
  RouteDashboardItem,
} from "./routes.types";

import {
  addressLabel,
  getAddressLatitude,
  getAddressLongitude,
  normalizeStatus,
  parseFrequencyLabel,
  parseScheduledTime,
  parseServiceKind,
  parseTechnicianId,
  parseTechnicianName,
  parseWeekdays,
  parseWeekdaysLabel,
  toApiDate,
} from "./routes.parsers";

export function employeeDisplayName(
  employee: ApiEmployee,
) {
  return (
    employee.name ||
    employee.email ||
    "Técnico sem nome"
  );
}

function hasValidAddress(
  order: ApiServiceOrder,
) {
  if (order.customerAddressId) {
    return true;
  }

  if (
    order.address &&
    typeof order.address !== "string" &&
    order.address.id
  ) {
    return true;
  }

  if (
    typeof order.address === "string" &&
    order.address.trim().length > 0 &&
    !order.address
      .toLowerCase()
      .includes("não informado")
  ) {
    return true;
  }

  return false;
}

export function normalizeWorkOrderForRoute(
  order: ApiServiceOrder,
): AvailableRouteWorkOrder {
  const description =
    order.description || "";

  const serviceKind = parseServiceKind(
    description,
    order.title,
  );

  const weekdays =
    parseWeekdays(description);

  const weekdaysLabel =
    parseWeekdaysLabel(description);

  const status = normalizeStatus(
    order.status,
  );

  const scheduledTime =
    parseScheduledTime(description);

  const technicianName =
    parseTechnicianName(description);

  const technicianId =
    parseTechnicianId(description);

  const lat =
    getAddressLatitude(order.address);

  const lng =
    getAddressLongitude(order.address);

  return {
    id: order.id,

    customerId:
      order.customerId || "",

    customerName:
      order.customerName ||
      "Cliente não informado",

    customerAddressId:
      order.customerAddressId ?? null,

    title:
      order.title ||
      "Ordem de serviço",

    description,

    serviceKind,

    frequencyLabel:
      parseFrequencyLabel(description),

    weekdays,

    weekdaysLabel,

    scheduledTime,

    scheduledDate:
      toApiDate(
        order.scheduledDate || "",
      ),

    address:
      addressLabel(order.address),

    hasAddress:
      hasValidAddress(order),

    hasCoordinates:
      lat !== 0 && lng !== 0,

    status:
      status === "waitingexecution"
        ? "WAITING_EXECUTION"
        : "READY_FOR_ROUTE",

    lat,

    lng,

    totalAmount:
      Number(order.totalAmount || 0),

    technicianId,

    technicianName,
  };
}

export function normalizeRouteDetails(
  route: ApiRouteDetailsResponse,
): RouteDashboardItem {
  const serviceOrders = (
    route.serviceOrders || []
  )
    .map((item, index) => {
      const description =
        item.description || "";

      const scheduledTime =
        parseScheduledTime(description);

      const frequencyLabel =
        parseFrequencyLabel(description);

      const weekdaysLabel =
        parseWeekdaysLabel(description);

      return {
        id:
          item.id ||
          item.serviceOrderId ||
          `${route.id}-${index}`,

        serviceOrderId:
          item.serviceOrderId ||
          item.id ||
          "",

        title:
          item.title ||
          "Ordem de serviço",

        customerName:
          item.customerName ||
          "Cliente não informado",

        address:
          addressLabel(item.address),

        executionOrder:
          item.executionOrder ??
          index + 1,

        status:
          item.status || "InRoute",

        scheduledTime:
          scheduledTime ===
          "Horário não informado"
            ? null
            : scheduledTime,

        scheduledDate:
          toApiDate(
            item.scheduledDate ||
              route.routeDate ||
              "",
          ),

        frequencyLabel,

        weekdaysLabel,

        totalAmount:
          Number(item.totalAmount || 0),
      };
    })
    .sort(
      (first, second) =>
        first.executionOrder -
        second.executionOrder,
    );

  return {
    id: route.id,

    title:
      route.title || "Rota",

    routeDate:
      toApiDate(
        route.routeDate || "",
      ),

    employeeUserId:
      route.employeeUserId || "",

    employeeName:
      route.employeeName ||
      "Técnico não informado",

    status:
      route.status || "Planned",

    serviceOrderCount:
      serviceOrders.length,

    createdAt:
      route.createdAt ?? null,

    serviceOrders,
  };
}