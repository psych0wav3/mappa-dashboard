"use server";

import { revalidatePath } from "next/cache";

import {
  extractItems,
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

import {
  isMappaApiError,
  MappaApiError,
} from "@/lib/mappa/errors";

import {
  safeData,
} from "@/lib/mappa/safe-load";

export type ClientStatus =
  | "ACTIVE"
  | "INACTIVE";

export type ClientAddress = {
  id: string;
  street: string;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isMain: boolean;
};

export type Client = {
  id: string;
  userId?: string | null;
  companyId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  document?: string | null;
  status: ClientStatus;
  active: boolean;
  mainAddress?: ClientAddress | null;
  addresses: ClientAddress[];
};

export type CreateClientInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  document?: string;

  address: {
    street: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
};

export type AddClientAddressInput = {
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  isMain?: boolean;
};

type ApiAddress = {
  id?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isMain?: boolean | null;
};

type ApiCustomer = {
  id: string;
  userId?: string | null;
  companyId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  status?: string | null;
  mainAddress?: ApiAddress | null;
  addresses?: ApiAddress[] | null;
};

type ClientRequestContext =
  | "create"
  | "get"
  | "address"
  | "delete";

function throwClientApiError(
  error: unknown,
  context: ClientRequestContext,
): never {
  /*
   * Erros que não vieram da nossa camada
   * de API não devem ser transformados.
   *
   * Isso é importante principalmente para
   * redirects internos do Next.js e bugs
   * inesperados.
   */
  if (!isMappaApiError(error)) {
    throw error;
  }

  const normalizedMessage =
    error.message.toLowerCase();

  let message = error.message;

  /*
   * Mantemos a mensagem amigável que já
   * existia no fluxo de cadastro.
   *
   * A API/Postgres pode devolver nomes de
   * constraints em determinados conflitos.
   * Isso nunca deve aparecer para o usuário.
   */
  if (
    context === "create" &&
    (
      normalizedMessage.includes(
        "uq_users_email",
      ) ||
      normalizedMessage.includes(
        "duplicate key",
      ) ||
      normalizedMessage.includes(
        "users_email",
      )
    )
  ) {
    message =
      "Já existe um usuário cadastrado com este e-mail.";
  }

  /*
   * A exclusão de um cliente com vínculos
   * continua obedecendo a regra atual.
   */
  if (
    context === "delete" &&
    error.status === 409
  ) {
    message =
      "Não é possível excluir este cliente porque ele possui ordens de serviço vinculadas.";
  }

  if (error.status === 404) {
    message =
      "Cliente não encontrado.";
  }

  if (message === error.message) {
    throw error;
  }

  throw new MappaApiError({
    message,
    code: error.code,
    status: error.status,
    retryable: error.retryable,
    details: error.details,
    cause: error,
  });
}

async function runClientRequest<T>(
  context: ClientRequestContext,
  request: () => Promise<T>,
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throwClientApiError(
      error,
      context,
    );
  }
}

function cleanText(
  value?: string | null,
) {
  return String(
    value || "",
  ).trim();
}

function optionalText(
  value?: string | null,
) {
  const cleaned =
    cleanText(value);

  return cleaned || null;
}

function onlyDigits(
  value?: string | null,
) {
  const digits = String(
    value || "",
  ).replace(
    /\D+/g,
    "",
  );

  return digits || null;
}

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

function normalizeAddress(
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

function normalizeCustomer(
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

function extractCustomers(
  payload: unknown,
): ApiCustomer[] {
  return extractItems<ApiCustomer>(
    payload,
    ["customers"],
  );
}

function validateCreateInput(
  input: CreateClientInput,
) {
  const name =
    cleanText(
      input.name,
    );

  const email =
    cleanText(
      input.email,
    ).toLowerCase();

  const password =
    cleanText(
      input.password,
    );

  const address =
    input.address;

  if (
    name.length < 2
  ) {
    throw new Error(
      "Informe o nome do cliente.",
    );
  }

  if (
    !email ||
    !email.includes("@")
  ) {
    throw new Error(
      "Informe um e-mail válido.",
    );
  }

  if (
    password.length < 6
  ) {
    throw new Error(
      "A senha inicial deve possuir pelo menos 6 caracteres.",
    );
  }

  if (
    !cleanText(
      address.street,
    )
  ) {
    throw new Error(
      "Informe o endereço principal.",
    );
  }

  if (
    !cleanText(
      address.city,
    )
  ) {
    throw new Error(
      "Informe a cidade.",
    );
  }

  if (
    cleanText(
      address.state,
    ).length !== 2
  ) {
    throw new Error(
      "Informe a UF com duas letras.",
    );
  }

  return {
    name,

    email,

    password,

    phone:
      onlyDigits(
        input.phone,
      ),

    document:
      onlyDigits(
        input.document,
      ),

    address: {
      street:
        cleanText(
          address.street,
        ),

      number:
        optionalText(
          address.number,
        ),

      complement:
        optionalText(
          address.complement,
        ),

      neighborhood:
        optionalText(
          address.neighborhood,
        ),

      city:
        cleanText(
          address.city,
        ),

      state:
        cleanText(
          address.state,
        ).toUpperCase(),

      zipCode:
        onlyDigits(
          address.zipCode,
        ),

      latitude:
        address.latitude ??
        null,

      longitude:
        address.longitude ??
        null,
    },
  };
}

function validateAddressInput(
  input: AddClientAddressInput,
) {
  if (
    !cleanText(
      input.street,
    )
  ) {
    throw new Error(
      "Informe o endereço.",
    );
  }

  if (
    !cleanText(
      input.city,
    )
  ) {
    throw new Error(
      "Informe a cidade.",
    );
  }

  if (
    cleanText(
      input.state,
    ).length !== 2
  ) {
    throw new Error(
      "Informe a UF com duas letras.",
    );
  }

  return {
    street:
      cleanText(
        input.street,
      ),

    number:
      optionalText(
        input.number,
      ),

    complement:
      optionalText(
        input.complement,
      ),

    neighborhood:
      optionalText(
        input.neighborhood,
      ),

    city:
      cleanText(
        input.city,
      ),

    state:
      cleanText(
        input.state,
      ).toUpperCase(),

    zipCode:
      onlyDigits(
        input.zipCode,
      ),

    latitude:
      input.latitude ??
      null,

    longitude:
      input.longitude ??
      null,

    isMain:
      input.isMain ===
      true,
  };
}

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

  /*
   * O endpoint de listagem retorna
   * dados resumidos.
   *
   * Para montar endereço principal e
   * demais endereços buscamos os
   * detalhes individualmente.
   *
   * Um erro conhecido da API em apenas
   * um detalhe NÃO deve derrubar a
   * listagem inteira.
   *
   * Porém redirects do Next ou erros de
   * programação não podem ser engolidos.
   */
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