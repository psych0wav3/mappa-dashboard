import {
  isMappaApiError,
  MappaApiError,
} from "@/lib/mappa/errors";

type ClientRequestContext =
  | "create"
  | "get"
  | "address"
  | "delete";

function throwClientApiError(
  error: unknown,
  context: ClientRequestContext,
): never {
  if (!isMappaApiError(error)) {
    throw error;
  }

  const normalizedMessage =
    error.message.toLowerCase();

  let message = error.message;

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

export async function runClientRequest<T>(
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
