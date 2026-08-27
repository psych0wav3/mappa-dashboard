"use server";

import {
  extractItems,
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

import { safeData } from "@/lib/mappa/safe-load";

import {
  normalizePlan,
  toApiStatus,
} from "./service-plans.normalizers";

import type {
  ApiServicePlan,
  ListServicePlansFilters,
  ServicePlan,
} from "./service-plans.types";

export async function listServicePlans(
  filters?: ListServicePlansFilters,
): Promise<ServicePlan[]> {
  const companyId =
    await getCompanyId();

  const searchParams =
    new URLSearchParams();

  if (
    filters?.status
  ) {
    searchParams.set(
      "status",
      toApiStatus(
        filters.status,
      ),
    );
  }

  if (
    filters?.customerId
  ) {
    searchParams.set(
      "customerId",
      filters.customerId,
    );
  }

  const query =
    searchParams.toString();

  const response =
    await mappaFetch<unknown>(
      `/api/companies/${companyId}/service-plans${
        query
          ? `?${query}`
          : ""
      }`,
      {
        method:
          "GET",

        cache:
          "no-store",
      },
    );

  const summaries =
    extractItems<ApiServicePlan>(
      response,
    );

  const hydrated =
    await Promise.all(
      summaries.map(
        (summary) =>
          safeData({
            resource:
              `detalhes da rotina ${summary.id}`,

            fallback:
              summary,

            loader:
              async () => {
                const details =
                  await mappaFetch<ApiServicePlan>(
                    `/api/companies/${companyId}/service-plans/${summary.id}`,
                    {
                      method:
                        "GET",

                      cache:
                        "no-store",
                    },
                  );

                return {
                  ...summary,
                  ...details,

                  customerId:
                    details.customerId ||
                    summary.customerId,

                  customerName:
                    details.customerName ||
                    summary.customerName,

                  title:
                    details.title ||
                    summary.title,

                  status:
                    details.status ||
                    summary.status,

                  recurrence:
                    details.recurrence ||
                    summary.recurrence,
                };
              },
          }),
      ),
    );

  return hydrated.map(
    normalizePlan,
  );
}

export async function getServicePlanById(
  servicePlanId: string,
): Promise<ServicePlan> {
  if (
    !servicePlanId
  ) {
    throw new Error(
      "Rotina não informada.",
    );
  }

  const companyId =
    await getCompanyId();

  const response =
    await mappaFetch<ApiServicePlan>(
      `/api/companies/${companyId}/service-plans/${servicePlanId}`,
      {
        method:
          "GET",

        cache:
          "no-store",
      },
    );

  return normalizePlan(
    response,
  );
}
