"use server";

import {
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

import {
  safeData,
} from "@/lib/mappa/safe-load";

import {
  extractCustomers,
  normalizeCustomer,
} from "./clients.normalizers";

import {
  runClientRequest,
} from "./clients.request";

import type {
  ApiCustomer,
  Client,
  ClientStatus,
} from "./clients.types";

export async function listClients(
  options?: {
    search?: string;
    status?: ClientStatus;
  },
): Promise<Client[]> {
  const companyId =
    await getCompanyId();

  const params =
    new URLSearchParams();

  if (
    options?.search?.trim()
  ) {
    params.set(
      "search",
      options.search.trim(),
    );
  }

  if (
    options?.status
  ) {
    params.set(
      "status",
      options.status,
    );
  }

  const query =
    params.toString();

  const data =
    await mappaFetch<unknown>(
      `/api/companies/${companyId}/customers${
        query
          ? `?${query}`
          : ""
      }`,
    );

  const summaries =
    extractCustomers(
      data,
    );

  const hydratedCustomers =
    await Promise.all(
      summaries.map(
        (summary) =>
          safeData({
            resource:
              `detalhes do cliente ${summary.id}`,

            fallback:
              summary,

            loader:
              () =>
                mappaFetch<ApiCustomer>(
                  `/api/companies/${companyId}/customers/${summary.id}`,
                ),
          }),
      ),
    );

  return hydratedCustomers
    .map(
      normalizeCustomer,
    )
    .sort(
      (
        first,
        second,
      ) =>
        first.name.localeCompare(
          second.name,
          "pt-BR",
        ),
    );
}

export async function getClientById(
  customerId: string,
): Promise<Client> {
  const companyId =
    await getCompanyId();

  if (
    !customerId
  ) {
    throw new Error(
      "ID do cliente não informado.",
    );
  }

  const customer =
    await runClientRequest(
      "get",
      () =>
        mappaFetch<ApiCustomer>(
          `/api/companies/${companyId}/customers/${customerId}`,
        ),
    );

  return normalizeCustomer(
    customer,
  );
}
