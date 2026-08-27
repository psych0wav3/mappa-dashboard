import {
  extractItems,
} from "@/lib/mappa/api";

import type {
  ApiAddress,
  ApiCustomer,
  Client,
  ClientAddress,
  ClientStatus,
} from "./clients.types";

function normalizeStatus(
  value?: string | null,
): ClientStatus {
  const normalized = String(
    value || "ACTIVE",
  )
    .replace(
      /[_\s-]/g,
      "",
    )
    .toUpperCase();

  return normalized ===
    "INACTIVE"
    ? "INACTIVE"
    : "ACTIVE";
}

export function normalizeAddress(
  address?: ApiAddress | null,
): ClientAddress | null {
  if (!address) {
    return null;
  }

  return {
    id:
      address.id || "",

    street:
      address.street ||
      "Endereço não informado",

    number:
      address.number ??
      null,

    complement:
      address.complement ??
      null,

    neighborhood:
      address.neighborhood ??
      null,

    city:
      address.city ||
      "Cidade não informada",

    state:
      address.state ||
      "Estado não informado",

    zipCode:
      address.zipCode ??
      null,

    latitude:
      address.latitude ??
      null,

    longitude:
      address.longitude ??
      null,

    isMain:
      address.isMain ===
      true,
  };
}

export function normalizeCustomer(
  customer: ApiCustomer,
): Client {
  const addresses =
    Array.isArray(
      customer.addresses,
    )
      ? customer.addresses
          .map(
            normalizeAddress,
          )
          .filter(
            (
              address,
            ): address is ClientAddress =>
              Boolean(
                address,
              ),
          )
      : [];

  const normalizedMainAddress =
    normalizeAddress(
      customer.mainAddress,
    );

  const mainAddress =
    normalizedMainAddress ||
    addresses.find(
      (address) =>
        address.isMain,
    ) ||
    addresses[0] ||
    null;

  const mergedAddresses =
    mainAddress &&
    !addresses.some(
      (address) =>
        address.id &&
        address.id ===
          mainAddress.id,
    )
      ? [
          mainAddress,
          ...addresses,
        ]
      : addresses;

  const status =
    normalizeStatus(
      customer.status,
    );

  return {
    id:
      customer.id,

    userId:
      customer.userId ??
      null,

    companyId:
      customer.companyId ??
      null,

    name:
      customer.name ||
      "Cliente sem nome",

    email:
      customer.email ||
      "",

    phone:
      customer.phone ??
      null,

    document:
      customer.document ??
      null,

    status,

    active:
      status === "ACTIVE",

    mainAddress,

    addresses:
      mergedAddresses,
  };
}

export function extractCustomers(
  payload: unknown,
): ApiCustomer[] {
  return extractItems<ApiCustomer>(
    payload,
    ["customers"],
  );
}
