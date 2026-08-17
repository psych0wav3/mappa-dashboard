"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SESSION_KEYS } from "@/lib/mappa/session";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5264";

type MyAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: (user: SessionUser) => void;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  roles?: unknown[];
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function readString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string") {
      return value;
    }
  }

  return null;
}

function normalizeUser(value: unknown): SessionUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  const id = readString(record, "id", "Id");
  const name = readString(record, "name", "Name");
  const email = readString(record, "email", "Email");
  const roles = record.roles ?? record.Roles;

  if (!id || !name || !email) {
    return null;
  }

  return {
    id,
    name,
    email,
    phone: readString(record, "phone", "Phone"),
    roles: Array.isArray(roles) ? roles : [],
  };
}

function getStoredUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEYS.user);

    if (!raw) {
      return null;
    }

    return normalizeUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

function persistUser(user: SessionUser) {
  try {
    const raw = localStorage.getItem(SESSION_KEYS.user);
    const current = raw ? JSON.parse(raw) : {};

    localStorage.setItem(
      SESSION_KEYS.user,
      JSON.stringify({
        ...current,
        ...user,
        roles: user.roles?.length ? user.roles : current?.roles ?? [],
      }),
    );
  } catch {
    localStorage.setItem(
      SESSION_KEYS.user,
      JSON.stringify(user),
    );
  }

  window.dispatchEvent(
    new CustomEvent("mappa:user-updated", {
      detail: user,
    }),
  );
}

async function readApiError(response: Response) {
  const text = await response.text();

  if (!text) {
    return `Erro ${response.status}.`;
  }

  try {
    const payload = JSON.parse(text) as Record<string, unknown>;

    const message =
      readString(payload, "message", "Message") ||
      readString(payload, "detail", "Detail") ||
      readString(payload, "title", "Title");

    if (message) {
      return message;
    }

    const errors =
      payload.errors ??
      payload.Errors;

    if (
      errors &&
      typeof errors === "object" &&
      !Array.isArray(errors)
    ) {
      const values = Object.values(
        errors as Record<string, unknown>,
      );

      for (const value of values) {
        if (
          Array.isArray(value) &&
          typeof value[0] === "string"
        ) {
          return value[0];
        }
      }
    }
  } catch {}

  return text;
}

async function authenticatedFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token =
    localStorage.getItem(
      SESSION_KEYS.token,
    );

  if (!token) {
    throw new Error(
      "Sessão não encontrada.",
    );
  }

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
        ...(options?.headers || {}),
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await readApiError(response),
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  const text =
    await response.text();

  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

async function updateProfile(input: {
  name: string;
  email: string;
  phone: string;
}) {
  const payload =
    await authenticatedFetch<unknown>(
      "/api/me/profile",
      {
        method: "PATCH",
        body: JSON.stringify({
          name:
            input.name.trim(),
          email:
            input.email
              .trim()
              .toLowerCase(),
          phone:
            onlyDigits(
              input.phone,
            ) || null,
        }),
      },
    );

  const user =
    normalizeUser(payload);

  if (!user) {
    throw new Error(
      "Os dados foram atualizados, mas a resposta da API é inválida.",
    );
  }

  persistUser(user);

  return user;
}

async function updatePassword(
  currentPassword: string,
  newPassword: string,
) {
  await authenticatedFetch<unknown>(
    "/api/me/password",
    {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    },
  );
}

export default function MyAccountDialog({
  open,
  onOpenChange,
  onUserUpdated,
}: MyAccountDialogProps) {
  const [mounted, setMounted] =
    React.useState(false);

  const [name, setName] =
    React.useState("");

  const [email, setEmail] =
    React.useState("");

  const [phone, setPhone] =
    React.useState("");

  const [savedName, setSavedName] =
    React.useState("");

  const [savedEmail, setSavedEmail] =
    React.useState("");

  const [savedPhone, setSavedPhone] =
    React.useState("");

  const [
    currentPassword,
    setCurrentPassword,
  ] = React.useState("");

  const [
    newPassword,
    setNewPassword,
  ] = React.useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = React.useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = React.useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = React.useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = React.useState(false);

  const [
    savingProfile,
    startProfileTransition,
  ] = React.useTransition();

  const [
    savingPassword,
    startPasswordTransition,
  ] = React.useTransition();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const user =
      getStoredUser();

    const initialName =
      user?.name ?? "";

    const initialEmail =
      user?.email ?? "";

    const initialPhone =
      user?.phone ?? "";

    setName(initialName);
    setEmail(initialEmail);
    setPhone(initialPhone);

    setSavedName(initialName);
    setSavedEmail(initialEmail);
    setSavedPhone(initialPhone);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, [open]);

  const pending =
    savingProfile ||
    savingPassword;

  React.useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !pending
      ) {
        onOpenChange(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    open,
    pending,
    onOpenChange,
  ]);

  const hasProfileChanges =
    name.trim() !==
      savedName.trim() ||
    email
      .trim()
      .toLowerCase() !==
      savedEmail
        .trim()
        .toLowerCase() ||
    onlyDigits(phone) !==
      onlyDigits(savedPhone);

  function handleClose() {
    if (pending) {
      return;
    }

    onOpenChange(false);
  }

  function handleProfileSave() {
    if (!name.trim()) {
      toast.error(
        "Informe o seu nome.",
      );

      return;
    }

    if (!email.trim()) {
      toast.error(
        "Informe o seu e-mail.",
      );

      return;
    }

    startProfileTransition(
      async () => {
        try {
          const updated =
            await updateProfile({
              name,
              email,
              phone,
            });

          setName(updated.name);
          setEmail(updated.email);
          setPhone(
            updated.phone ?? "",
          );

          setSavedName(
            updated.name,
          );

          setSavedEmail(
            updated.email,
          );

          setSavedPhone(
            updated.phone ?? "",
          );

          onUserUpdated?.(
            updated,
          );

          toast.success(
            "Dados da conta atualizados com sucesso.",
          );
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Não foi possível atualizar sua conta.",
          );
        }
      },
    );
  }

  function handlePasswordSave() {
    if (!currentPassword) {
      toast.error(
        "Informe a senha atual.",
      );

      return;
    }

    if (!newPassword) {
      toast.error(
        "Informe a nova senha.",
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      toast.error(
        "A confirmação da nova senha não confere.",
      );

      return;
    }

    startPasswordTransition(
      async () => {
        try {
          await updatePassword(
            currentPassword,
            newPassword,
          );

          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");

          setShowCurrentPassword(false);
          setShowNewPassword(false);
          setShowConfirmPassword(false);

          toast.success(
            "Senha alterada com sucesso.",
          );
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Não foi possível alterar a senha.",
          );
        }
      },
    );
  }

  if (
    !mounted ||
    !open
  ) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-[1px] sm:p-6"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="my-account-title"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
        onMouseDown={(
          event,
        ) =>
          event.stopPropagation()
        }
      >
        <div className="flex shrink-0 items-start justify-between border-b border-neutral-100 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-[#0077C8]">
              <UserRound
                size={19}
              />
            </div>

            <div>
              <h2
                id="my-account-title"
                className="text-lg font-semibold text-neutral-900"
              >
                Minha conta
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                Gerencie seus dados de acesso ao Aqua Mappa.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleClose
            }
            disabled={
              pending
            }
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-6 px-6 py-6">
            <section>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Seus dados
                </h3>

                <p className="mt-1 text-xs text-neutral-500">
                  Estes são os dados da sua conta de acesso, não os dados cadastrais da empresa.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="account-name"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Nome
                  </label>

                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                    <Input
                      id="account-name"
                      value={name}
                      onChange={(
                        event,
                      ) =>
                        setName(
                          event.target
                            .value,
                        )
                      }
                      className="h-11 pl-10"
                      disabled={
                        pending
                      }
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="account-email"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    E-mail de acesso
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                    <Input
                      id="account-email"
                      type="email"
                      value={
                        email
                      }
                      onChange={(
                        event,
                      ) =>
                        setEmail(
                          event.target
                            .value,
                        )
                      }
                      className="h-11 pl-10"
                      disabled={
                        pending
                      }
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="account-phone"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Telefone
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                    <Input
                      id="account-phone"
                      value={formatPhone(
                        phone,
                      )}
                      onChange={(
                        event,
                      ) =>
                        setPhone(
                          onlyDigits(
                            event.target
                              .value,
                          ).slice(
                            0,
                            11,
                          ),
                        )
                      }
                      className="h-11 pl-10"
                      disabled={
                        pending
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={
                    handleProfileSave
                  }
                  disabled={
                    pending ||
                    !name.trim() ||
                    !email.trim() ||
                    !hasProfileChanges
                  }
                  className="btn-brand rounded-xl px-5 text-white"
                >
                  {savingProfile ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}

                  {savingProfile
                    ? "Salvando..."
                    : "Salvar alterações"}
                </Button>
              </div>
            </section>

            <div className="h-px bg-neutral-100" />

            <section>
              <div className="mb-4 flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-[#0077C8]">
                  <KeyRound
                    size={17}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Alterar senha
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    Informe sua senha atual antes de definir uma nova.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label
                    htmlFor="current-password"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Senha atual
                  </label>

                  <div className="relative">
                    <Input
                      id="current-password"
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={
                        currentPassword
                      }
                      onChange={(
                        event,
                      ) =>
                        setCurrentPassword(
                          event.target
                            .value,
                        )
                      }
                      className="h-11 pr-11"
                      disabled={
                        pending
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (current) =>
                            !current,
                        )
                      }
                      disabled={
                        pending
                      }
                      className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:pointer-events-none disabled:opacity-50"
                      aria-label={
                        showCurrentPassword
                          ? "Ocultar senha atual"
                          : "Mostrar senha atual"
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="new-password"
                      className="mb-2 block text-xs font-semibold text-neutral-700"
                    >
                      Nova senha
                    </label>

                    <div className="relative">
                      <Input
                        id="new-password"
                        type={
                          showNewPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        value={
                          newPassword
                        }
                        onChange={(
                          event,
                        ) =>
                          setNewPassword(
                            event.target
                              .value,
                          )
                        }
                        className="h-11 pr-11"
                        disabled={
                          pending
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword(
                            (current) =>
                              !current,
                          )
                        }
                        disabled={
                          pending
                        }
                        className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:pointer-events-none disabled:opacity-50"
                        aria-label={
                          showNewPassword
                            ? "Ocultar nova senha"
                            : "Mostrar nova senha"
                        }
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="mb-2 block text-xs font-semibold text-neutral-700"
                    >
                      Confirmar nova senha
                    </label>

                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        value={
                          confirmPassword
                        }
                        onChange={(
                          event,
                        ) =>
                          setConfirmPassword(
                            event.target
                              .value,
                          )
                        }
                        className="h-11 pr-11"
                        disabled={
                          pending
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (current) =>
                              !current,
                          )
                        }
                        disabled={
                          pending
                        }
                        className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:pointer-events-none disabled:opacity-50"
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar confirmação da senha"
                            : "Mostrar confirmação da senha"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={
                    handlePasswordSave
                  }
                  disabled={
                    pending ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className="btn-brand rounded-xl px-5 text-white"
                >
                  {savingPassword ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 h-4 w-4" />
                  )}

                  {savingPassword
                    ? "Alterando..."
                    : "Alterar senha"}
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}