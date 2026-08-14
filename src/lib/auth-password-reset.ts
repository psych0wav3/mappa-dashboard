const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5264";

type ApiErrorBody = {
  errors?: Array<{
    statusCode?: number;
    StatusCode?: number;
    message?: string;
    Message?: string;
    code?: string;
    Code?: string;
  }>;
};

export type ForgotPasswordResult = {
  message: string;
  expiresInMinutes: number;
};

export type VerifyResetCodeResult = {
  valid: boolean;
};

export type ResetPasswordResult = {
  message: string;
};

export async function parseApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    const message = body.errors?.[0]?.message || body.errors?.[0]?.Message;
    if (message) return message;
  } catch {
    // ignore parse errors
  }

  return fallback;
}

async function postJson<T>(
  path: string,
  body: Record<string, unknown>,
  fallbackError: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseApiErrorMessage(response, fallbackError));
  }

  return response.json() as Promise<T>;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function forgotPassword(email: string) {
  const data = await postJson<ForgotPasswordResult & { ExpiresInMinutes?: number; Message?: string }>(
    "/api/auth/forgot-password",
    { email: normalizeEmail(email) },
    "Não foi possível enviar o código.",
  );

  return {
    message:
      data.message ||
      data.Message ||
      "Se o e-mail estiver cadastrado, enviaremos um código de verificação em instantes.",
    expiresInMinutes: data.expiresInMinutes ?? data.ExpiresInMinutes ?? 15,
  };
}

export async function verifyResetCode(email: string, code: string) {
  const data = await postJson<VerifyResetCodeResult & { Valid?: boolean }>(
    "/api/auth/verify-reset-code",
    {
      email: normalizeEmail(email),
      code: code.trim(),
    },
    "Código inválido ou expirado.",
  );

  return {
    valid: data.valid ?? data.Valid ?? true,
  };
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  const data = await postJson<ResetPasswordResult & { Message?: string }>(
    "/api/auth/reset-password",
    {
      email: normalizeEmail(email),
      code: code.trim(),
      newPassword,
    },
    "Não foi possível redefinir a senha.",
  );

  return {
    message:
      data.message ||
      data.Message ||
      "Senha alterada com sucesso. Você já pode fazer login.",
  };
}
