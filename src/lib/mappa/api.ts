import "server-only";

import { cookies } from "next/headers";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5264";

type ApiError = {
  errors?: any;
  detail?: string;
  title?: string;
  message?: string;
};

export async function getAuthFromCookies() {
  const cookieStore = await cookies();

  const token = cookieStore.get("mappa_access_token")?.value;
  const companyId = cookieStore.get("mappa_company_id")?.value;

  if (!token) {
    throw new Error("Token não encontrado. Faça login novamente.");
  }

  if (!companyId) {
    throw new Error("Empresa não encontrada. Faça login novamente.");
  }

  return {
    token,
    companyId,
  };
}

export async function getCompanyId() {
  const { companyId } = await getAuthFromCookies();

  return companyId;
}

function formatValidationErrors(errors: any) {
  if (!errors) return "";

  if (Array.isArray(errors)) {
    return errors
      .map((item) => item?.message || item?.errorMessage || JSON.stringify(item))
      .filter(Boolean)
      .join(" | ");
  }

  if (typeof errors === "object") {
    return Object.entries(errors)
      .map(([field, messages]) => {
        if (Array.isArray(messages)) {
          return `${field}: ${messages.join(", ")}`;
        }

        if (typeof messages === "string") {
          return `${field}: ${messages}`;
        }

        return `${field}: ${JSON.stringify(messages)}`;
      })
      .join(" | ");
  }

  return String(errors);
}

export function parseApiError(status: number, text: string) {
  if (status === 401) {
    return "Sessão expirada ou usuário sem autorização. Faça login novamente.";
  }

  if (status === 403) {
    return "Acesso negado. Esta ação exige permissão de administrador da empresa.";
  }

  const lowerText = String(text || "").toLowerCase();

  if (status === 409 || lowerText.includes("status inválido")) {
    return "Ordem com status inválido. Apenas OS com status Aguardando execução podem entrar em rota.";
  }

  if (
    lowerText.includes("execution_order_positive") ||
    lowerText.includes("ck_execution_order_positive")
  ) {
    return "A ordem de execução precisa começar em 1. Corrija o executionOrder enviado para a rota.";
  }

  if (
    lowerText.includes("dateonly") ||
    lowerText.includes("routedate") ||
    lowerText.includes("scheduleddate") ||
    lowerText.includes("cannot be used as a parameter value")
  ) {
    return "Erro no backend com campo de data DateOnly. O front está enviando a data como yyyy-MM-dd, mas o backend ainda precisa converter a data antes de gravar no banco.";
  }

  if (
    lowerText.includes("checklist_templates") ||
    lowerText.includes("relation") ||
    lowerText.includes("does not exist")
  ) {
    return "Erro no backend/banco: alguma tabela esperada não existe no banco atual. Recrie o volume do Postgres local ou rode o script SQL atualizado.";
  }

  try {
    const error = JSON.parse(text) as ApiError;

    const validationDetails = formatValidationErrors(error?.errors);

    const message =
      validationDetails ||
      error?.detail ||
      error?.title ||
      error?.message ||
      JSON.stringify(error);

    return `Erro ${status}: ${message}`;
  } catch {
    return `Erro ${status}: ${text || "Falha na API."}`;
  }
}

export async function mappaFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const { token } = await getAuthFromCookies();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(parseApiError(response.status, text));
  }

  if (response.status === 204 || !text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

export function extractItems<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.routes)) return payload.routes;
  if (Array.isArray(payload?.serviceOrders)) return payload.serviceOrders;
  if (Array.isArray(payload?.employees)) return payload.employees;
  if (Array.isArray(payload?.customers)) return payload.customers;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.templates)) return payload.templates;

  return [];
}