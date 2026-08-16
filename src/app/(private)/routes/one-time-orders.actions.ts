"use server";

import { revalidatePath } from "next/cache";

import type { AvailableRouteWorkOrder } from "./routes.types";

import {
  fetchRouteOneTimeOrders,
  removeOneTimeOrderFromRoute,
} from "./one-time-orders.api";

function mapOneTimeOrder(order: {
  id: string;
  orderNumber?: number | null;
  customerId: string;
  customerName: string;
  customerAddressId: string;
  title: string;
  description: string;
  scheduledDate: string;
  totalAmount: number;
  status: string;
  origin: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}): AvailableRouteWorkOrder {
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

export async function listOneTimeServiceOrdersForRoute(): Promise<AvailableRouteWorkOrder[]> {
  const orders = await fetchRouteOneTimeOrders();

  return orders.map(mapOneTimeOrder);
}

export async function listOneTimeServiceOrdersForDate(
  scheduledDate: string,
): Promise<AvailableRouteWorkOrder[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
    return [];
  }

  try {
    const orders = await fetchRouteOneTimeOrders({
      scheduledDate,
    });

    return orders.map(mapOneTimeOrder);
  } catch (error) {
    console.error(
      "[listOneTimeServiceOrdersForDate]",
      error,
    );

    return [];
  }
}

export type RemoveOneTimeOrderActionResult = {
  ok: boolean;
  routeDeleted?: boolean;
  remainingServiceOrders?: number;
  error?: string;
};

export async function removeOneTimeOrderFromDailyRoute(params: {
  routeId: string;
  serviceOrderId: string;
}): Promise<RemoveOneTimeOrderActionResult> {
  try {
    if (!params.routeId) {
      throw new Error(
        "Rota não informada.",
      );
    }

    if (!params.serviceOrderId) {
      throw new Error(
        "OS não informada.",
      );
    }

    const response =
      await removeOneTimeOrderFromRoute({
        routeId:
          params.routeId,

        serviceOrderId:
          params.serviceOrderId,
      });

    revalidatePath(
      "/routes/dashboard",
    );

    revalidatePath(
      "/workorders",
    );

    revalidatePath(
      "/workorders/approved",
    );

    return {
      ok: true,

      routeDeleted:
        response.routeDeleted,

      remainingServiceOrders:
        response.remainingServiceOrders,
    };
  } catch (error) {
    console.error(
      "[removeOneTimeOrderFromDailyRoute]",
      error,
    );

    return {
      ok: false,

      error:
        error instanceof Error
          ? error.message
          : "Não foi possível retirar a OS da rota.",
    };
  }
}