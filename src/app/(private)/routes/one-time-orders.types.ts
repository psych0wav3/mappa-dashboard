import type { AvailableRouteWorkOrder } from "./routes.types";

export type ListOneTimeServiceOrdersForDateResult =
  | { ok: true; orders: AvailableRouteWorkOrder[] }
  | { ok: false; orders: []; error: string };

export type RemoveOneTimeOrderActionResult = {
  ok: boolean;
  routeDeleted?: boolean;
  remainingServiceOrders?: number;
  error?: string;
};
