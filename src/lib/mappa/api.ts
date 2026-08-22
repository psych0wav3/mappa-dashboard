import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getBackendApiBaseUrl } from "@/lib/browser-api";

import {
  getHttpErrorCode,
  isRetryableHttpStatus,
  MappaApiError,
} from "./errors";

import {
  isSuperAdminRole,
  normalizeRole,
  SESSION_KEYS,
} from "./session";

const API_URL =
  getBackendApiBaseUrl() || "http://localhost:5264";

const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;

const REQUEST_TIMEOUT_MS = (() => {
  const configured = Number(
    process.env.MAPPA_API_TIMEOUT_MS,
  );

  if (
    Number.isFinite(configured) &&
    configured > 0
  ) {
    return configured;
  }

  return DEFAULT_REQUEST_TIMEOUT_MS;
})();

type ApiError = {
  errors?: unknown;
  detail?: string;
  title?: string;
  message?: string;
};

type AuthCookies = {
  token: string;
  companyId: string | null;
  role: string | null;
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
  const cookieStore = await cookies();

  const token = cookieStore.get(
    SESSION_KEYS.token,
  )?.value;

  const companyId =
    cookieStore.get(
      SESSION_KEYS.companyId,
    )?.value ?? null;

  const role = normalizeRole(
    cookieStore.get(
      SESSION_KEYS.role,
    )?.value ?? "",
  );

  if (!token) {
    redirectToSessionLogout(
      "session-required",
    );
  }

  return {
    token,
    companyId,
    role: role || null,
  };
}

export async function getAccessToken() {
  const { token } =
    await getAuthFromCookies();

  return token;
}

export const SUPER_ADMIN_COMPANY_REQUIRED =
  "Selecione uma empresa no topo para continuar.";

export async function getCompanyId() {
  const { companyId, role } =
    await getAuthFromCookies();

  if (companyId) {
    return companyId;
  }

  if (isSuperAdminRole(role)) {
    redirect("/select-company");
  }

  redirectToSessionLogout(
    "company-required",
  );
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
            typeof message === "string"
          ) {
            return message;
          }
        }

        return String(item);
      })
      .filter(Boolean)
      .join(" ");
  }

  if (
    typeof errors === "object"
  ) {
    return Object.values(
      errors as Record<
        string,
        unknown
      >,
    )
      .flat()
      .map(String)
      .join(" ");
  }

  return String(errors);
}

function getFallbackStatusMessage(
  status: number,
) {
  switch (status) {
    case 400:
      return "A solicitação enviada é inválida.";

    case 403:
      return "Você não tem permissão para realizar esta ação.";

    case 404:
      return "O recurso solicitado não foi encontrado.";

    case 409:
      return "Não foi possível concluir a operação por causa de um conflito nos dados.";

    case 422:
      return "Alguns dados informados são inválidos.";

    case 429:
      return "Muitas solicitações foram realizadas. Tente novamente em instantes.";

    case 500:
      return "O servidor encontrou um erro ao processar a solicitação.";

    case 502:
    case 503:
    case 504:
      return "O serviço está temporariamente indisponível. Tente novamente em instantes.";

    default:
      return `Não foi possível concluir a solicitação. Erro ${status}.`;
  }
}

export async function parseApiError(
  status: number,
  text: string,
) {
  const normalizedText =
    text.trim();

  if (!normalizedText) {
    return getFallbackStatusMessage(
      status,
    );
  }

  try {
    const json =
      JSON.parse(
        normalizedText,
      ) as ApiError;

    if (
      Array.isArray(json.errors)
    ) {
      const first =
        json.errors[0] as
          | Record<
              string,
              unknown
            >
          | string
          | undefined;

      if (
        typeof first === "string" &&
        first.trim()
      ) {
        return first;
      }

      if (
        first &&
        typeof first ===
          "object" &&
        typeof first.message ===
          "string" &&
        first.message.trim()
      ) {
        return first.message;
      }

      const formatted =
        formatValidationErrors(
          json.errors,
        );

      if (formatted) {
        return formatted;
      }
    }

    if (json.errors) {
      const formatted =
        formatValidationErrors(
          json.errors,
        );

      if (formatted) {
        return formatted;
      }
    }

    const message =
      json.message ||
      json.detail ||
      json.title;

    if (
      typeof message === "string" &&
      message.trim()
    ) {
      return message;
    }

    return getFallbackStatusMessage(
      status,
    );
  } catch {
    /*
     * Algumas respostas da API podem
     * vir como texto puro.
     *
     * Para mensagens pequenas,
     * continuamos aproveitando o texto.
     *
     * Evitamos exibir respostas enormes,
     * páginas HTML ou dumps do servidor.
     */
    if (
      normalizedText.length <= 300
    ) {
      return normalizedText;
    }

    return getFallbackStatusMessage(
      status,
    );
  }
}

function createRequestSignal(
  externalSignal?: AbortSignal | null,
) {
  const controller =
    new AbortController();

  let timedOut = false;

  const timeoutId = setTimeout(
    () => {
      timedOut = true;
      controller.abort();
    },
    REQUEST_TIMEOUT_MS,
  );

  const abortFromExternalSignal =
    () => {
      controller.abort();
    };

  if (externalSignal) {
    if (
      externalSignal.aborted
    ) {
      controller.abort();
    } else {
      externalSignal.addEventListener(
        "abort",
        abortFromExternalSignal,
        {
          once: true,
        },
      );
    }
  }

  return {
    signal: controller.signal,

    didTimeout: () =>
      timedOut,

    cleanup: () => {
      clearTimeout(
        timeoutId,
      );

      externalSignal?.removeEventListener(
        "abort",
        abortFromExternalSignal,
      );
    },
  };
}

export async function mappaFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const { token } =
    await getAuthFromCookies();

  const requestSignal =
    createRequestSignal(
      options?.signal,
    );

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${path}`,
      {
        ...options,

        cache: "no-store",

        signal:
          requestSignal.signal,

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
  } catch (error) {
    requestSignal.cleanup();

    if (
      requestSignal.didTimeout()
    ) {
      throw new MappaApiError({
        code: "TIMEOUT",

        message:
          "O servidor demorou para responder. Tente novamente em instantes.",

        retryable: true,

        cause: error,
      });
    }

    /*
     * Caso quem chamou o mappaFetch
     * tenha abortado propositalmente
     * a requisição, preservamos o erro
     * original.
     */
    if (
      options?.signal?.aborted
    ) {
      throw error;
    }

    throw new MappaApiError({
      code: "NETWORK_ERROR",

      message:
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",

      retryable: true,

      cause: error,
    });
  }

  /*
   * 401 continua seguindo o fluxo
   * atual do Aqua Mappa:
   *
   * limpa/encerra a sessão e
   * redireciona o usuário.
   */
  if (
    response.status === 401
  ) {
    requestSignal.cleanup();

    redirectToSessionLogout(
      "session-expired",
    );
  }

  let text: string;

  try {
    text =
      await response.text();
  } catch (error) {
    if (
      requestSignal.didTimeout()
    ) {
      throw new MappaApiError({
        status:
          response.status,

        code: "TIMEOUT",

        message:
          "O servidor demorou para concluir a resposta. Tente novamente em instantes.",

        retryable: true,

        cause: error,
      });
    }

    throw new MappaApiError({
      status:
        response.status,

      code:
        "INVALID_RESPONSE",

      message:
        "Não foi possível ler a resposta da API.",

      retryable: true,

      cause: error,
    });
  } finally {
    requestSignal.cleanup();
  }

  if (!response.ok) {
    throw new MappaApiError({
      status:
        response.status,

      code:
        getHttpErrorCode(
          response.status,
        ),

      message:
        await parseApiError(
          response.status,
          text,
        ),

      retryable:
        isRetryableHttpStatus(
          response.status,
        ),
    });
  }

  if (
    response.status === 204 ||
    !text
  ) {
    return null as T;
  }

  try {
    return JSON.parse(
      text,
    ) as T;
  } catch (error) {
    throw new MappaApiError({
      status:
        response.status,

      code:
        "INVALID_RESPONSE",

      message:
        "A API retornou uma resposta inválida.",

      retryable: true,

      cause: error,
    });
  }
}

export function extractItems<T>(
  payload: unknown,
  additionalKeys: readonly string[] = [],
): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  const defaultKeys = [
    "items",
    "Items",
    "data",
    "Data",
  ] as const;

  const collectionKeys =
    Array.from(
      new Set([
        ...defaultKeys,
        ...additionalKeys,
      ]),
    );

  if (
    payload &&
    typeof payload === "object"
  ) {
    const record =
      payload as Record<
        string,
        unknown
      >;

    for (
      const key of collectionKeys
    ) {
      if (
        key in record &&
        Array.isArray(
          record[key],
        )
      ) {
        return record[
          key
        ] as T[];
      }
    }

    throw new MappaApiError({
      code:
        "INVALID_RESPONSE",

      message:
        "A API retornou uma coleção em formato inesperado.",

      retryable:
        false,

      details: {
        expected:
          collectionKeys,

        receivedKeys:
          Object.keys(
            record,
          ).slice(0, 20),
      },
    });
  }

  throw new MappaApiError({
    code:
      "INVALID_RESPONSE",

    message:
      "A API retornou uma coleção em formato inesperado.",

    retryable:
      false,

    details: {
      expected:
        collectionKeys,

      receivedType:
        payload === null
          ? "null"
          : typeof payload,
    },
  });
}

export { API_URL };