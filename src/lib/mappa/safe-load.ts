import {
  isRecoverableMappaApiError,
} from "./errors";

export type SafeLoadResult<T> = {
  data: T;
  failed: boolean;
  resource?: string;
};

type SafeLoadOptions<T> = {
  resource: string;
  loader: () => Promise<T>;
  fallback: T;
};

export async function safeLoad<T>({
  resource,
  loader,
  fallback,
}: SafeLoadOptions<T>): Promise<SafeLoadResult<T>> {
  try {
    const data = await loader();

    return {
      data,
      failed: false,
    };
  } catch (error) {
    /*
     * Só erros realmente recuperáveis
     * podem virar fallback.
     *
     * Exemplos:
     *
     * NETWORK_ERROR
     * TIMEOUT
     * RATE_LIMITED
     * SERVER_ERROR
     * SERVICE_UNAVAILABLE
     * INVALID_RESPONSE
     *
     * Erros como 403, 404, 409 e erros
     * inesperados continuam subindo.
     */
    if (
      !isRecoverableMappaApiError(
        error,
      )
    ) {
      throw error;
    }

    console.error(
      `[safe-load] Falha recuperável ao carregar ${resource}.`,
      {
        code: error.code,
        status: error.status,
        retryable: error.retryable,
        message: error.message,
      },
    );

    return {
      data: fallback,
      failed: true,
      resource,
    };
  }
}

export async function safeData<T>(
  options: SafeLoadOptions<T>,
): Promise<T> {
  const result =
    await safeLoad(options);

  return result.data;
}

export function getFailedResources(
  results: SafeLoadResult<unknown>[],
): string[] {
  return results
    .filter(
      (
        result,
      ): result is SafeLoadResult<unknown> & {
        resource: string;
      } =>
        result.failed &&
        Boolean(
          result.resource,
        ),
    )
    .map(
      (result) =>
        result.resource,
    );
}