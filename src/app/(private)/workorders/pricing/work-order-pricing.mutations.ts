"use server";

import { revalidatePath } from "next/cache";
import { getCompanyId, mappaFetch } from "@/lib/mappa/api";
import type {
  PriceWorkOrderInput,
  PriceWorkOrderResponse,
} from "./work-order-pricing.types";
import { validatePriceWorkOrderInput } from "./work-order-pricing.validation";

export async function priceWorkOrder(input: PriceWorkOrderInput) {
  const companyId = await getCompanyId();
  const { serviceOrderId, payload } = validatePriceWorkOrderInput(input);
  const updated = await mappaFetch<PriceWorkOrderResponse>(
    `/api/companies/${companyId}/service-orders/${serviceOrderId}/pricing`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );

  revalidatePath("/workorders");
  revalidatePath("/workorders/pricing");
  revalidatePath("/workorders/customer-approval");
  revalidatePath("/routes/builder");
  revalidatePath("/routes/dashboard");
  return updated;
}
