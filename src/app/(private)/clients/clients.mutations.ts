"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

import {
  normalizeAddress,
  normalizeCustomer,
} from "./clients.normalizers";

import {
  runClientRequest,
} from "./clients.request";

import type {
  AddClientAddressInput,
  ApiAddress,
  ApiCustomer,
  CreateClientInput,
} from "./clients.types";

import {
  validateAddressInput,
  validateCreateInput,
} from "./clients.validation";

export async function createClient(
  input: CreateClientInput,
) {
  const companyId =
    await getCompanyId();

  const payload =
    validateCreateInput(
      input,
    );

  const created =
    await runClientRequest(
      "create",
      () =>
        mappaFetch<ApiCustomer>(
          `/api/companies/${companyId}/customers`,
          {
            method:
              "POST",

            body:
              JSON.stringify(
                payload,
              ),
          },
        ),
    );

  revalidatePath(
    "/clients",
  );

  revalidatePath(
    "/workorders",
  );

  revalidatePath(
    "/service-plans",
  );

  revalidatePath(
    "/routes/new",
  );

  return normalizeCustomer(
    created,
  );
}

export async function addClientAddress(
  customerId: string,
  input: AddClientAddressInput,
) {
  const companyId =
    await getCompanyId();

  if (
    !customerId
  ) {
    throw new Error(
      "ID do cliente não informado.",
    );
  }

  const payload =
    validateAddressInput(
      input,
    );

  const address =
    await runClientRequest(
      "address",
      () =>
        mappaFetch<ApiAddress>(
          `/api/companies/${companyId}/customers/${customerId}/addresses`,
          {
            method:
              "POST",

            body:
              JSON.stringify(
                payload,
              ),
          },
        ),
    );

  revalidatePath(
    "/clients",
  );

  revalidatePath(
    "/workorders",
  );

  revalidatePath(
    "/service-plans",
  );

  revalidatePath(
    "/routes/new",
  );

  return normalizeAddress(
    address,
  );
}

export async function deleteClient(
  customerId: string,
) {
  const companyId =
    await getCompanyId();

  if (
    !customerId
  ) {
    throw new Error(
      "ID do cliente não informado.",
    );
  }

  await runClientRequest(
    "delete",
    () =>
      mappaFetch<null>(
        `/api/companies/${companyId}/customers/${customerId}`,
        {
          method:
            "DELETE",
        },
      ),
  );

  revalidatePath(
    "/clients",
  );

  return true;
}
