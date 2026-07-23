import type {
  Client,
  ClientAddress,
} from "@/app/(private)/clients/actions";

export type AddressFormState = {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

export const emptyAddress: AddressFormState = {
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

export function onlyDigits(value: string) {
  return value.replace(/\D+/g, "");
}

export function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "C";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 1)
      .toLocaleUpperCase("pt-BR");
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`
    .toLocaleUpperCase("pt-BR");
}

export function formatAddress(
  address: ClientAddress,
) {
  const firstLine = [
    address.street,
    address.number,
  ]
    .filter(Boolean)
    .join(", ");

  const secondLine = [
    address.neighborhood,
    address.city &&
      `${address.city}${
        address.state
          ? `/${address.state}`
          : ""
      }`,
    address.zipCode,
  ]
    .filter(Boolean)
    .join(" • ");

  return {
    firstLine:
      firstLine ||
      "Endereço não informado",
    secondLine,
  };
}

export function getClientAddresses(
  client: Client,
) {
  const addresses =
    client.addresses || [];

  if (addresses.length > 0) {
    return addresses;
  }

  if (client.mainAddress) {
    return [client.mainAddress];
  }

  return [];
}

export async function fetchViaCep(
  zipCode: string,
) {
  const digits = onlyDigits(zipCode);

  if (digits.length !== 8) {
    throw new Error(
      "O CEP deve possuir 8 dígitos.",
    );
  }

  const response = await fetch(
    `https://viacep.com.br/ws/${digits}/json/`,
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível consultar o CEP.",
    );
  }

  const data = await response.json();

  if (data?.erro) {
    throw new Error(
      "CEP não encontrado.",
    );
  }

  return {
    street: String(
      data.logradouro || "",
    ),
    neighborhood: String(
      data.bairro || "",
    ),
    city: String(
      data.localidade || "",
    ),
    state: String(
      data.uf || "",
    ),
  };
}