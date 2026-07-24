import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5264";

type ApiError = {
  errors?: unknown;
  detail?: string;
  title?: string;
  message?: string;
};

type AuthCookies = {
  token: string;
  companyId: string;
};

type SessionReason =
  | "session-required"
  | "company-required"
  | "session-expired";

function redirectToSessionLogout(
  reason: SessionReason,
): never {
  redirect(
    `/api/auth/session-expired?reason=${encodeURIComponent(
      reason,
    )}`,
  );
}

export async function getAuthFromCookies(): Promise<AuthCookies> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      "mappa_access_token",
    )?.value;

  const companyId =
    cookieStore.get(
      "mappa_company_id",
    )?.value;

  if (!token) {
    redirectToSessionLogout(
      "session-required",
    );
  }

  if (!companyId) {
    redirectToSessionLogout(
      "company-required",
    );
  }

  return {
    token,
    companyId,
  };
}

export async function getCompanyId() {
  const { companyId } =
    await getAuthFromCookies();

  return companyId;
}

function formatValidationErrors(
  errors: unknown,
) {
  if (!errors) {
    return "";
  }

  if (Array.isArray(errors)) {
    return errors
      .map((item) => {
        if (
          typeof item === "object" &&
          item !== null
        ) {
          const record =
            item as Record<
              string,
              unknown
            >;

          const message =
            record.message ||
            record.errorMessage;

          if (
            typeof message ===
            "string"
          ) {
            return message;
          }
        }

        if (
          typeof item === "string"
        ) {
          return item;
        }

        try {
          return JSON.stringify(item);
        } catch {
          return String(item);
        }
      })
      .filter(Boolean)
      .join(" | ");
  }

  if (
    typeof errors === "object"
  ) {
    return Object.entries(
      errors as Record<
        string,
        unknown
      >,
    )
      .map(
        ([
          field,
          messages,
        ]) => {
          if (
            Array.isArray(messages)
          ) {
            return `${field}: ${messages.join(
              ", ",
            )}`;
          }

          if (
            typeof messages ===
            "string"
          ) {
            return `${field}: ${messages}`;
          }

          try {
            return `${field}: ${JSON.stringify(
              messages,
            )}`;
          } catch {
            return `${field}: ${String(
              messages,
            )}`;
          }
        },
      )
      .join(" | ");
  }

  return String(errors);
}

export function parseApiError(
  status: number,
  text: string,
) {
  if (status === 403) {
    return (
      "Acesso negado. Esta ação exige " +
      "permissão de administrador da empresa."
    );
  }

  const lowerText = String(
    text || "",
  ).toLowerCase();

  if (
    lowerText.includes(
      "dateonly",
    ) ||
    lowerText.includes(
      "cannot be used as a parameter value",
    )
  ) {
    return (
      "Erro no backend com campo DateOnly. " +
      "O backend precisa converter a data " +
      "antes de gravar."
    );
  }

  if (
    lowerText.includes(
      "relation",
    ) ||
    lowerText.includes(
      "does not exist",
    )
  ) {
    return (
      "Erro no backend ou banco de dados: " +
      "uma estrutura esperada não foi encontrada."
    );
  }

  try {
    const error =
      JSON.parse(
        text,
      ) as ApiError;

    const validationDetails =
      formatValidationErrors(
        error.errors,
      );

    const message =
      validationDetails ||
      error.detail ||
      error.title ||
      error.message ||
      JSON.stringify(error);

    return `Erro ${status}: ${message}`;
  } catch {
    return (
      `Erro ${status}: ` +
      `${
        text ||
        "Falha na API."
      }`
    );
  }
}

export async function mappaFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const { token } =
    await getAuthFromCookies();

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,

      cache: "no-store",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,

        ...(options?.headers ||
          {}),
      },
    },
  );

  if (response.status === 401) {
    redirectToSessionLogout(
      "session-expired",
    );
  }

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      parseApiError(
        response.status,
        text,
      ),
    );
  }

  if (
    response.status === 204 ||
    !text
  ) {
    return null as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      "A API retornou uma resposta inválida.",
    );
  }
}

export function extractItems<T>(
  payload: unknown,
): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    typeof payload !== "object" ||
    payload === null
  ) {
    return [];
  }

  const record =
    payload as Record<
      string,
      unknown
    >;

  const possibleKeys = [
    "items",
    "data",
    "templates",
    "measurementFields",
    "measurementTemplates",
    "servicePlans",
    "plans",
    "routes",
    "serviceOrders",
    "orders",
    "customers",
    "employees",
    "fields",
    "checklistTemplates",
  ];

  for (
    const key of possibleKeys
  ) {
    const value =
      record[key];

    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
}