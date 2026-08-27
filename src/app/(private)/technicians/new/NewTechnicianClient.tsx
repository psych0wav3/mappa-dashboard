"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { createTechnician } from "@/app/(private)/technicians/actions";

import FormField from "@/components/form-layout/FormField";
import FormInfoBox from "@/components/form-layout/FormInfoBox";
import StepFormSection from "@/components/form-layout/StepFormSection";
import FormActionBar from "@/components/ui/FormActionBar";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/mappa/errors";

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

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("123456");
  const [phone, setPhone] = React.useState("");

  const [showPassword, setShowPassword] =
    React.useState(false);

  const [submitting, setSubmitting] =
    React.useState(false);

  const [errorMessage, setErrorMessage] =
    React.useState<string | null>(null);

  const normalizedPhone = normalizePhone(phone);

  const isNameValid = name.trim().length >= 2;

  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const isPasswordValid = password.trim().length >= 6;

  const isPhoneValid =
    normalizedPhone.length === 0 ||
    normalizedPhone.length === 10 ||
    normalizedPhone.length === 11;

  const canSubmit =
    isNameValid &&
    isEmailValid &&
    isPasswordValid &&
    isPhoneValid &&
    !submitting;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
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

      router.push("/technicians?created=1");
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getErrorMessage(
          error,
          "Não foi possível cadastrar o técnico.",
        ),
      );

      setSubmitting(false);
    }
  }

  function handleBack() {
    if (submitting) {
      return;
    }

    router.back();
  }

  function handleCancel() {
    if (submitting) {
      return;
    }

    router.push("/technicians");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 pb-28"
    >
      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <StepFormSection
        step={1}
        icon={UserRound}
        title="Identificação"
        description="Informe os dados principais do profissional."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            htmlFor="technician-name"
            label="Nome completo"
            required
            error={
              name.length > 0 && !isNameValid
                ? "Informe o nome completo do técnico."
                : undefined
            }
            className="sm:col-span-2"
          >
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
                  name.length > 0 && !isNameValid
                }
                disabled={submitting}
              />
            </div>
          </FormField>

          <FormField
            htmlFor="technician-phone"
            label="Telefone"
            optional
            error={
              phone.length > 0 && !isPhoneValid
                ? "Informe um telefone válido com DDD."
                : undefined
            }
          >
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                id="technician-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    formatPhone(event.target.value),
                  )
                }
                placeholder="(00) 00000-0000"
                className="h-11 rounded-xl pl-10"
                aria-invalid={
                  phone.length > 0 && !isPhoneValid
                }
                disabled={submitting}
              />
            </div>
          </FormField>

          <div className="self-end">
            <FormInfoBox
              icon={ShieldCheck}
              compact
            >
              O profissional será cadastrado com acesso ao
              aplicativo para executar os atendimentos da
              empresa.
            </FormInfoBox>
          </div>
        </div>
      </StepFormSection>

      <StepFormSection
        step={2}
        icon={KeyRound}
        title="Acesso ao aplicativo"
        description="Crie as credenciais iniciais que serão utilizadas pelo técnico."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            htmlFor="technician-email"
            label="E-mail de acesso"
            required
            error={
              email.length > 0 && !isEmailValid
                ? "Informe um endereço de e-mail válido."
                : undefined
            }
          >
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
                  email.length > 0 && !isEmailValid
                }
                disabled={submitting}
              />
            </div>
          </FormField>

          <FormField
            htmlFor="technician-password"
            label="Senha inicial"
            required
            description="A senha deve possuir pelo menos 6 caracteres."
            error={
              password.length > 0 && !isPasswordValid
                ? "Informe uma senha com pelo menos 6 caracteres."
                : undefined
            }
          >
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
                  setPassword(event.target.value)
                }
                className="h-11 rounded-xl px-10"
                aria-invalid={
                  password.length > 0 &&
                  !isPasswordValid
                }
                disabled={submitting}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                disabled={submitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
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
          </FormField>
        </div>

        <FormInfoBox
          icon={KeyRound}
          variant="warning"
          className="mt-5"
        >
          Oriente o técnico a alterar a senha inicial após o
          primeiro acesso ao aplicativo.
        </FormInfoBox>
      </StepFormSection>

      <FormActionBar
        primaryLabel="Criar técnico"
        loadingLabel="Criando técnico..."
        pending={submitting}
        disabled={!canSubmit}
        onBack={handleBack}
        onCancel={handleCancel}
        submitType="submit"
      />
    </form>
  );
}