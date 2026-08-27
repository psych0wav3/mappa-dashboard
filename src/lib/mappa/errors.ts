export type MappaApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "INVALID_RESPONSE"
  | "UNKNOWN_ERROR";

type MappaApiErrorOptions = {
  message: string;
  code?: MappaApiErrorCode;
  status?: number | null;
  retryable?: boolean;
  details?: unknown;
  cause?: unknown;
};

export class MappaApiError extends Error {
  readonly code: MappaApiErrorCode;
  readonly status: number | null;
  readonly retryable: boolean;
  readonly details?: unknown;

  constructor({
    message,
    code = "UNKNOWN_ERROR",
    status = null,
    retryable = false,
    details,
    cause,
  }: MappaApiErrorOptions) {
    super(message);

    this.name = "MappaApiError";

    if (cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = cause;
    }

    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.details = details;
  }
}

export function isMappaApiError(
  error: unknown,
): error is MappaApiError {
  return error instanceof MappaApiError;
}

export function isRecoverableMappaApiError(
  error: unknown,
): error is MappaApiError {
  return (
    isMappaApiError(error) &&
    error.retryable
  );
}

export function getErrorMessage(
  error: unknown,
  fallback = "Ocorreu um erro inesperado. Tente novamente.",
) {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  if (
    typeof error === "string" &&
    error.trim()
  ) {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

export function getHttpErrorCode(
  status: number,
): MappaApiErrorCode {
  switch (status) {
    case 400:
      return "BAD_REQUEST";

    case 401:
      return "UNAUTHORIZED";

    case 403:
      return "FORBIDDEN";

    case 404:
      return "NOT_FOUND";

    case 408:
      return "TIMEOUT";

    case 409:
      return "CONFLICT";

    case 422:
      return "VALIDATION_ERROR";

    case 429:
      return "RATE_LIMITED";

    case 502:
    case 503:
    case 504:
      return "SERVICE_UNAVAILABLE";

    default:
      return status >= 500
        ? "SERVER_ERROR"
        : "UNKNOWN_ERROR";
  }
}

export function isRetryableHttpStatus(
  status: number,
) {
  return (
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status >= 500
  );
}