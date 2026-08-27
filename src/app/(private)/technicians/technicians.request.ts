import { isMappaApiError, MappaApiError } from "@/lib/mappa/errors";

type TechnicianRequestContext = "create" | "update" | "delete";

function throwTechnicianApiError(error: unknown, context: TechnicianRequestContext): never {
  if (!isMappaApiError(error)) throw error;

  const normalizedMessage = error.message.toLowerCase();
  let message = error.message;

  if (
    context === "create" &&
    error.status === 409 &&
    ["uq_users_email", "duplicate key", "users_email", "email", "e-mail"].some(
      (fragment) => normalizedMessage.includes(fragment),
    )
  ) {
    message = "Já existe um usuário cadastrado com esse e-mail.";
  }

  if (context === "delete" && error.status === 409) {
    message = "Não é possível excluir este técnico porque ele possui registros vinculados.";
  }
  if (error.status === 404) message = "Técnico não encontrado.";
  if (message === error.message) throw error;

  throw new MappaApiError({
    message,
    code: error.code,
    status: error.status,
    retryable: error.retryable,
    details: error.details,
    cause: error,
  });
}

export async function runTechnicianRequest<T>(
  context: TechnicianRequestContext,
  request: () => Promise<T>,
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throwTechnicianApiError(error, context);
  }
}
