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

export function employeeDisplayName(employee: ApiEmployee) {
  return employee.name || employee.email || "Técnico sem nome";
}

export function normalizeWorkOrderForRoute(
  order: ApiServiceOrder,
): AvailableRouteWorkOrder {
  const serviceKind = parseServiceKind(order.description, order.title);
  const weekdays = parseWeekdays(order.description);
  const weekdaysLabel = parseWeekdaysLabel(order.description);
  const status = normalizeStatus(order.status);
  const scheduledTime = parseScheduledTime(order.description);
  const technicianName = parseTechnicianName(order.description);
  const technicianId = parseTechnicianId(order.description);

  return {
    id: order.id,
    customerId: order.customerId || "",
    customerName: order.customerName || "Cliente não informado",
    title: order.title || "Ordem de serviço",
    serviceKind,
    frequencyLabel: parseFrequencyLabel(order.description),
    weekdays,
    weekdaysLabel,
    scheduledTime,
    scheduledDate: toApiDate(order.scheduledDate || ""),
    address: addressLabel(order.address),
    status:
      status === "waitingexecution" ? "WAITING_EXECUTION" : "READY_FOR_ROUTE",
    lat: getAddressLatitude(order.address),
    lng: getAddressLongitude(order.address),
    totalAmount: Number(order.totalAmount || 0),
    technicianId,
    technicianName,
  };
}

export function normalizeRouteDetails(
  route: ApiRouteDetailsResponse,
): RouteDashboardItem {
  const serviceOrders = (route.serviceOrders || [])
    .map((item, index) => {
      const description = item.description || "";
      const scheduledTime = parseScheduledTime(description);
      const frequencyLabel = parseFrequencyLabel(description);
      const weekdaysLabel = parseWeekdaysLabel(description);

      return {
        id: item.id || item.serviceOrderId || `${route.id}-${index}`,
        serviceOrderId: item.serviceOrderId || item.id || "",
        title: item.title || "Ordem de serviço",
        customerName: item.customerName || "Cliente não informado",
        address: addressLabel(item.address),
        executionOrder: item.executionOrder ?? index + 1,
        status: item.status || "InRoute",
        scheduledTime:
          scheduledTime === "Horário não informado" ? null : scheduledTime,
        scheduledDate: toApiDate(item.scheduledDate || route.routeDate || ""),
        frequencyLabel,
        weekdaysLabel,
        totalAmount: Number(item.totalAmount || 0),
      };
    })
    .sort((a, b) => a.executionOrder - b.executionOrder);

  return {
    id: route.id,
    title: route.title || "Rota",
    routeDate: toApiDate(route.routeDate || ""),
    employeeUserId: route.employeeUserId || "",
    employeeName: route.employeeName || "Técnico não informado",
    status: route.status || "Planned",
    serviceOrderCount: serviceOrders.length,
    createdAt: route.createdAt ?? null,
    serviceOrders,
  };
}