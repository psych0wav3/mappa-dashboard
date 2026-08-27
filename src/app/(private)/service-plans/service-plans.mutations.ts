"use server";

import { revalidatePath } from "next/cache";

import {
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

import {
  normalizePlan,
} from "./service-plans.normalizers";

import {
  buildCreateServicePlanPayload,
} from "./service-plans.validation";

import type {
  ApiServicePlan,
  SaveServicePlanInput,
  ServicePlan,
} from "./service-plans.types";

export async function createServicePlan(
  input: SaveServicePlanInput,
): Promise<ServicePlan> {
  const companyId =
    await getCompanyId();

  const payload =
    buildCreateServicePlanPayload(
      input,
    );

  const response =
    await mappaFetch<ApiServicePlan>(
      `/api/companies/${companyId}/service-plans`,
      {
        method:
          "POST",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  revalidatePath(
    "/service-plans",
  );

  revalidatePath(
    "/workorders",
  );

  revalidatePath(
    "/workorders/customer-approval",
  );

  revalidatePath(
    "/routes/builder",
  );

  return normalizePlan(
    response,
  );
}

export async function updateServicePlanStatus(
  servicePlanId: string,
  status:
    | "ACTIVE"
    | "PAUSED",
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
      `/api/companies/${companyId}/service-plans/${servicePlanId}/status`,
      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            status:
              status ===
              "ACTIVE"
                ? "Active"
                : "Paused",
          }),
      },
    );

  revalidatePath(
    "/service-plans",
  );

  revalidatePath(
    "/workorders",
  );

  revalidatePath(
    "/routes/builder",
  );

  return normalizePlan(
    response,
  );
}

export async function generateServicePlanOrders(
  servicePlanId: string,
) {
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
    await mappaFetch<{
      ordersGenerated?: number;
    }>(
      `/api/companies/${companyId}/service-plans/${servicePlanId}/generate-orders`,
      {
        method:
          "POST",
      },
    );

  revalidatePath(
    "/service-plans",
  );

  revalidatePath(
    "/workorders",
  );

  revalidatePath(
    "/routes/builder",
  );

  revalidatePath(
    "/routes/dashboard",
  );

  return {
    ordersGenerated:
      Number(
        response.ordersGenerated ||
        0,
      ),
  };
}
