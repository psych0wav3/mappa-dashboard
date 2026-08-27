"use server";

import {
  extractItems,
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

import { safeData } from "@/lib/mappa/safe-load";

import {
  normalizeServiceOrderOrigin,
  normalizeWorkOrder,
  toApiDate,
  toApiStatus,
} from "./workorders.helpers";

import type {
  ApiServiceOrder,
  WorkOrderListItem,
} from "./workorders.types";

export async function listWorkOrders(
  options?: {
    status?: string;
    customerId?: string;
    scheduledDate?: string;
    hideServicePlanExecutions?: boolean;
  },
): Promise<WorkOrderListItem[]> {
  const companyId =
    await getCompanyId();

  const params =
    new URLSearchParams();

  const status =
    toApiStatus(
      options?.status,
    );

  if (status) {
    params.set(
      "status",
      status,
    );
  }

  if (options?.customerId) {
    params.set(
      "customerId",
      options.customerId,
    );
  }

  if (options?.scheduledDate) {
    params.set(
      "scheduledDate",
      toApiDate(
        options.scheduledDate,
      ),
    );
  }

  const query =
    params.toString();

  const data =
    await mappaFetch<unknown>(
      `/api/companies/${companyId}/service-orders${
        query
          ? `?${query}`
          : ""
      }`,
    );

  const summaries =
    extractItems<ApiServiceOrder>(
      data,
    );

  const summariesToHydrate =
    options?.hideServicePlanExecutions
      ? summaries.filter(
          (order) => {
            const origin =
              normalizeServiceOrderOrigin(
                order.origin,
              );

            return (
              !origin ||
              origin !==
                "SERVICEPLANEXECUTION"
            );
          },
        )
      : summaries;

  const hydrated =
    await Promise.all(
      summariesToHydrate.map(
        (summary) =>
          safeData({
            resource:
              `detalhes da ordem de serviço ${summary.id}`,

            fallback:
              summary,

            loader:
              async () => {
                const details =
                  await mappaFetch<ApiServiceOrder>(
                    `/api/companies/${companyId}/service-orders/${summary.id}`,
                  );

                return {
                  ...summary,
                  ...details,

                  serviceOrderType:
                    details.serviceOrderType ??
                    summary.serviceOrderType,

                  origin:
                    details.origin ??
                    summary.origin,

                  customerName:
                    details.customerName ||
                    summary.customerName,

                  customerId:
                    details.customerId ||
                    summary.customerId,

                  customerAddressId:
                    details.customerAddressId ||
                    summary.customerAddressId,

                  address:
                    details.address ||
                    summary.address,
                };
              },
          }),
      ),
    );

  const visibleOrders =
    options?.hideServicePlanExecutions
      ? hydrated.filter(
          (order) =>
            normalizeServiceOrderOrigin(
              order.origin,
            ) !==
            "SERVICEPLANEXECUTION",
        )
      : hydrated;

  return visibleOrders.map(
    normalizeWorkOrder,
  );
}

export async function getWorkOrderById(
  serviceOrderId: string,
) {
  const companyId =
    await getCompanyId();

  if (!serviceOrderId) {
    throw new Error(
      "ID da ordem de serviço não informado.",
    );
  }

  const data =
    await mappaFetch<ApiServiceOrder>(
      `/api/companies/${companyId}/service-orders/${serviceOrderId}`,
    );

  return normalizeWorkOrder(
    data,
  );
}
