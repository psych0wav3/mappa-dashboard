import type {
  AddClientAddressInput,
  CreateClientInput,
} from "./clients.types";

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

export function validateCreateInput(
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

export function validateAddressInput(
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
