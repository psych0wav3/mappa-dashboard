"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_URL =
  process.env.API_URL ??
  "http://localhost:5264";

type ApiEmployee = {
  id: string;
  userId?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  status?:
    | "ACTIVE"
    | "INACTIVE"
    | string;
};

export type Tech = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  active: boolean;
  role: "OWNER" | "TECH";
};

type ApiError = {
  errors?: Array<{
    statusCode?: number;
    message?: string;
    code?: string;
  }>;
  detail?: string;
  title?: string;
  message?: string;
};

async function getAuthFromCookies() {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    "mappa_access_token",
  )?.value;

  const companyId = cookieStore.get(
    "mappa_company_id",
  )?.value;

  if (!token) {
    throw new Error(
      "Token não encontrado. Faça login novamente.",
    );
  }

  if (!companyId) {
    throw new Error(
      "Empresa não encontrada. Faça login novamente.",
    );
  }

  return {
    token,
    companyId,
  };
}

function parseApiError(
  status: number,
  text: string,
) {
  try {
    const json = JSON.parse(
      text,
    ) as ApiError;

    const message =
      json.errors?.[0]?.message ||
      json.detail ||
      json.title ||
      json.message ||
      text;

    if (status === 401) {
      return "Sessão expirada ou não autorizada. Faça login novamente.";
    }

    if (status === 403) {
      return "Você não tem permissão para executar esta ação.";
    }

    if (status === 409) {
      return (
        message ||
        "Já existe um usuário cadastrado com esse e-mail."
      );
    }

    return `Erro ${status}: ${message}`;
  } catch {
    if (status === 401) {
      return "Sessão expirada ou não autorizada. Faça login novamente.";
    }

    if (status === 403) {
      return "Você não tem permissão para executar esta ação.";
    }

    if (status === 409) {
      return "Já existe um usuário cadastrado com esse e-mail ou o técnico possui registros vinculados.";
    }

    return `Erro ${status}: ${text}`;
  }
}

function splitName(
  name?: string | null,
) {
  const parts = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName:
      parts.slice(1).join(" "),
  };
}

function normalizeEmployee(
  employee: ApiEmployee,
): Tech {
  const {
    firstName,
    lastName,
  } = splitName(employee.name);

  return {
    id: employee.userId || employee.id,
    firstName,
    lastName,
    email: employee.email,
    phone: employee.phone ?? null,
    active:
      employee.status !== "INACTIVE",
    role: "TECH",
  };
}

function extractEmployees(
  payload: unknown,
): ApiEmployee[] {
  if (Array.isArray(payload)) {
    return payload as ApiEmployee[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "items" in payload &&
    Array.isArray(
      (payload as { items?: unknown })
        .items,
    )
  ) {
    return (
      payload as {
        items: ApiEmployee[];
      }
    ).items;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "employees" in payload &&
    Array.isArray(
      (
        payload as {
          employees?: unknown;
        }
      ).employees,
    )
  ) {
    return (
      payload as {
        employees: ApiEmployee[];
      }
    ).employees;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray(
      (payload as { data?: unknown }).data,
    )
  ) {
    return (
      payload as {
        data: ApiEmployee[];
      }
    ).data;
  }

  return [];
}

export async function listTechnicians(): Promise<
  Tech[]
> {
  const { token, companyId } =
    await getAuthFromCookies();

  const response = await fetch(
    `${API_URL}/api/companies/${companyId}/employees`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      parseApiError(
        response.status,
        text,
      ),
    );
  }

  const json = text
    ? JSON.parse(text)
    : [];

  const employees =
    extractEmployees(json);

  return employees
    .map(normalizeEmployee)
    .sort((first, second) => {
      const firstName = [
        first.firstName,
        first.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      const secondName = [
        second.firstName,
        second.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      return firstName.localeCompare(
        secondName,
        "pt-BR",
      );
    });
}

export async function createTechnician(
  data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  },
) {
  const { token, companyId } =
    await getAuthFromCookies();

  const response = await fetch(
    `${API_URL}/api/companies/${companyId}/employees`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: data.name.trim(),
        email: data.email
          .trim()
          .toLocaleLowerCase("pt-BR"),
        password:
          data.password.trim(),
        phone:
          data.phone?.trim() || "",
      }),
      cache: "no-store",
    },
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      parseApiError(
        response.status,
        text,
      ),
    );
  }

  revalidatePath("/technicians");
  revalidatePath("/dashboard");
  revalidatePath("/routes/builder");

  return text
    ? JSON.parse(text)
    : true;
}

export async function deleteTechnician(
  employeeUserId: string,
) {
  if (!employeeUserId) {
    throw new Error(
      "ID do técnico não informado.",
    );
  }

  const { token, companyId } =
    await getAuthFromCookies();

  const response = await fetch(
    `${API_URL}/api/companies/${companyId}/employees/${employeeUserId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      parseApiError(
        response.status,
        text,
      ),
    );
  }

  revalidatePath("/technicians");
  revalidatePath("/dashboard");
  revalidatePath("/routes/builder");

  return true;
}