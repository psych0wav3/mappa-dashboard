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

type TechnicianRequestContext =
  | "create"
  | "delete";

function throwTechnicianApiError(
  error: unknown,
  context: TechnicianRequestContext,
): never {
  /*
   * Não transformamos erros que não
   * vieram da camada de API.
   *
   * Assim redirects internos do Next
   * e erros inesperados continuam
   * subindo normalmente.
   */
  if (!isMappaApiError(error)) {
    throw error;
  }

  const normalizedMessage =
    error.message.toLowerCase();

  let message = error.message;

  /*
   * Cadastro duplicado.
   *
   * Nunca exibimos nomes de constraints,
   * mensagens do Postgres ou detalhes
   * internos para o usuário.
   */
  if (
    context === "create" &&
    error.status === 409
  ) {
    if (
      normalizedMessage.includes(
        "uq_users_email",
      ) ||
      normalizedMessage.includes(
        "duplicate key",
      ) ||
      normalizedMessage.includes(
        "users_email",
      ) ||
      normalizedMessage.includes(
        "email",
      ) ||
      normalizedMessage.includes(
        "e-mail",
      )
    ) {
      message =
        "Já existe um usuário cadastrado com esse e-mail.";
    }
  }

  /*
   * Regra já existente:
   * técnico com registros vinculados
   * não deve ser excluído.
   */
  if (
    context === "delete" &&
    error.status === 409
  ) {
    message =
      "Não é possível excluir este técnico porque ele possui registros vinculados.";
  }

  if (error.status === 404) {
    message =
      "Técnico não encontrado.";
  }

  /*
   * Se não precisarmos alterar a
   * mensagem original, preservamos o
   * próprio MappaApiError.
   */
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

async function runTechnicianRequest<T>(
  context: TechnicianRequestContext,
  request: () => Promise<T>,
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throwTechnicianApiError(
      error,
      context,
    );
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
    firstName:
      parts[0] ?? "",

    lastName:
      parts
        .slice(1)
        .join(" "),
  };
}

function normalizeEmployee(
  employee: ApiEmployee,
): Tech {
  const {
    firstName,
    lastName,
  } = splitName(
    employee.name,
  );

  return {
    id:
      employee.userId ||
      employee.id,

    firstName,

    lastName,

    email:
      employee.email,

    phone:
      employee.phone ??
      null,

    active:
      employee.status !==
      "INACTIVE",

    role:
      "TECH",
  };
}

function extractEmployees(
  payload: unknown,
): ApiEmployee[] {
  return extractItems<ApiEmployee>(
    payload,
    ["employees"],
  );
}

export async function listTechnicians(): Promise<
  Tech[]
> {
  const companyId =
    await getCompanyId();

  const payload =
    await mappaFetch<unknown>(
      `/api/companies/${companyId}/employees`,
    );

  const employees =
    extractEmployees(
      payload,
    );

  return employees
    .map(
      normalizeEmployee,
    )
    .sort(
      (
        first,
        second,
      ) => {
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
      },
    );
}

export async function createTechnician(
  data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  },
) {
  const companyId =
    await getCompanyId();

  const payload = {
    name:
      data.name.trim(),

    email:
      data.email
        .trim()
        .toLocaleLowerCase(
          "pt-BR",
        ),

    password:
      data.password.trim(),

    phone:
      data.phone?.trim() ||
      "",
  };

  const created =
    await runTechnicianRequest(
      "create",
      () =>
        mappaFetch<
          ApiEmployee | null
        >(
          `/api/companies/${companyId}/employees`,
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
    "/technicians",
  );

  revalidatePath(
    "/dashboard",
  );

  revalidatePath(
    "/routes/builder",
  );

  return created ?? true;
}

export async function deleteTechnician(
  employeeUserId: string,
) {
  if (!employeeUserId) {
    throw new Error(
      "ID do técnico não informado.",
    );
  }

  const companyId =
    await getCompanyId();

  await runTechnicianRequest(
    "delete",
    () =>
      mappaFetch<null>(
        `/api/companies/${companyId}/employees/${employeeUserId}`,
        {
          method:
            "DELETE",
        },
      ),
  );

  revalidatePath(
    "/technicians",
  );

  revalidatePath(
    "/dashboard",
  );

  revalidatePath(
    "/routes/builder",
  );

  return true;
}