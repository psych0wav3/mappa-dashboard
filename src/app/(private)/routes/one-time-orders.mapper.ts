import type { ApiRouteOneTimeOrder } from "./one-time-orders.api";
import type { AvailableRouteWorkOrder } from "./routes.types";

export function mapOneTimeOrder(order: ApiRouteOneTimeOrder): AvailableRouteWorkOrder {
  const lat = Number(order.latitude || 0);
  const lng = Number(order.longitude || 0);

  return {
    id: order.id,
    orderNumber: order.orderNumber ?? null,
    origin: order.origin,
    customerId: order.customerId,
    customerName: order.customerName,
    customerAddressId: order.customerAddressId,
    title: order.title,
    description: order.description || "",
    serviceKind: "ADDITIONAL_SERVICE",
    frequencyLabel: "Atendimento avulso",
    weekdays: [],
    weekdaysLabel: "",
    scheduledTime: "",
    scheduledDate: order.scheduledDate.slice(0, 10),
    address: order.address || "Endereço não informado",
    hasAddress: Boolean(order.customerAddressId),
    hasCoordinates: lat !== 0 && lng !== 0,
    status: "WAITING_EXECUTION",
    lat,
    lng,
    totalAmount: Number(order.totalAmount || 0),
    technicianId: null,
    technicianName: null,
  };
}
