"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { createTechnician } from "@/app/(private)/technicians/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function formatPhone(value: string) {
  const digits = normalizePhone(value);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(
      2,
      6,
    )}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(
    2,
    7,
  )}-${digits.slice(7)}`;
}

export default function NewTechnicianClient() {
  const router = useRouter();

  const [name, setName] =
    React.useState("");

  const [email, setEmail] =
    React.useState("");

  const [password, setPassword] =
    React.useState("123456");

  const [phone, setPhone] =
    React.useState("");

  const [
    showPassword,
    setShowPassword,
  ] = React.useState(false);

  const [
    submitting,
    setSubmitting,
  ] = React.useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = React.useState<string | null>(null);

  const normalizedPhone =
    normalizePhone(phone);

  const isNameValid =
    name.trim().length >= 2;

  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim(),
    );

  const isPasswordValid =
    password.trim().length >= 6;

  const isPhoneValid =
    !normalizedPhone ||
    normalizedPhone.length === 10 ||
    normalizedPhone.length === 11;

  const canSubmit =
    isNameValid &&
    isEmailValid &&
    isPasswordValid &&
    isPhoneValid &&
    !submitting;

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      await createTechnician({
        name: name.trim(),
        email: email
          .trim()
          .toLocaleLowerCase("pt-BR"),
        password: password.trim(),
        phone: normalizedPhone || undefined,
      });

      router.push(
        "/technicians?created=1",
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao criar técnico.",
      );

      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
            <UserRound className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Identificação
            </h2>

            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              Informe os dados principais do
              profissional.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="technician-name"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Nome completo
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                id="technician-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Ex.: Lucas Richter"
                className="h-11 rounded-xl pl-10"
                aria-invalid={
                  name.length > 0 &&
                  !isNameValid
                }
              />
            </div>

            {name.length > 0 &&
              !isNameValid && (
                <p className="mt-1.5 text-xs text-red-600">
                  Informe o nome completo do
                  técnico.
                </p>
              )}
          </div>

          <div>
            <label
              htmlFor="technician-phone"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Telefone
              <span className="ml-1 font-normal text-slate-400">
                opcional
              </span>
            </label>

            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                id="technician-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    formatPhone(
                      event.target.value,
                    ),
                  )
                }
                placeholder="(00) 00000-0000"
                className="h-11 rounded-xl pl-10"
                aria-invalid={
                  phone.length > 0 &&
                  !isPhoneValid
                }
              />
            </div>

            {phone.length > 0 &&
              !isPhoneValid && (
                <p className="mt-1.5 text-xs text-red-600">
                  Informe um telefone com DDD.
                </p>
              )}
          </div>

          <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />

              <p className="text-xs leading-5 text-sky-800">
                O profissional será cadastrado com
                o cargo de{" "}
                <strong>Técnico</strong> e poderá
                acessar o aplicativo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
            <KeyRound className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Acesso ao aplicativo
            </h2>

            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              Crie as credenciais iniciais que
              serão usadas pelo técnico.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="technician-email"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              E-mail de acesso
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                id="technician-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="tecnico@email.com"
                className="h-11 rounded-xl pl-10"
                aria-invalid={
                  email.length > 0 &&
                  !isEmailValid
                }
              />
            </div>

            {email.length > 0 &&
              !isEmailValid && (
                <p className="mt-1.5 text-xs text-red-600">
                  Informe um endereço de e-mail
                  válido.
                </p>
              )}
          </div>

          <div>
            <label
              htmlFor="technician-password"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Senha inicial
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                id="technician-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                className="h-11 rounded-xl px-10"
                aria-invalid={
                  password.length > 0 &&
                  !isPasswordValid
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={
                  showPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="mt-1.5 text-xs text-slate-400">
              A senha deve possuir pelo menos 6
              caracteres.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />

          <p className="text-xs leading-5 text-amber-800">
            Oriente o técnico a alterar a senha
            inicial após o primeiro acesso ao
            aplicativo.
          </p>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Voltar
        </Button>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() =>
              router.push("/technicians")
            }
            disabled={submitting}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            className="btn-brand rounded-xl px-6 text-white"
            disabled={!canSubmit}
          >
            <Save className="mr-2 h-4 w-4" />

            {submitting
              ? "Criando técnico..."
              : "Criar técnico"}
          </Button>
        </div>
      </div>
    </form>
  );
}