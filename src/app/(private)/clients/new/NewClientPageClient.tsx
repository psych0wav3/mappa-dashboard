"use client";

import * as React from "react";
import { useTransition } from "react";

import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  MapPin,
  UserRound,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/app/(private)/clients/actions";

import FormActionBar from "@/components/ui/FormActionBar";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/MaskedInput";

type FormState = {
  name: string;
  document: string;
  phone: string;
  email: string;
  password: string;

  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

const initialState: FormState = {
  name: "",
  document: "",
  phone: "",
  email: "",
  password: "123456",

  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

function onlyDigits(value: string) {
  return value.replace(/\D+/g, "");
}

async function fetchViaCep(
  zipCode: string,
) {
  const digits =
    onlyDigits(zipCode);

  if (digits.length !== 8) {
    throw new Error(
      "O CEP deve possuir 8 dígitos.",
    );
  }

  const response = await fetch(
    `https://viacep.com.br/ws/${digits}/json/`,
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível consultar o CEP.",
    );
  }

  const data = await response.json();

  if (data?.erro) {
    throw new Error(
      "CEP não encontrado.",
    );
  }

  return {
    street:
      data.logradouro || "",

    neighborhood:
      data.bairro || "",

    city:
      data.localidade || "",

    state:
      data.uf || "",
  };
}

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {children}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
        {icon}
      </div>

      <div>
        <h2 className="font-bold text-slate-950">
          {title}
        </h2>

        <p className="mt-0.5 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function NewClientPageClient() {
  const router =
    useRouter();

  const [
    form,
    setForm,
  ] = React.useState<FormState>(
    initialState,
  );

  const [
    showPassword,
    setShowPassword,
  ] = React.useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = React.useState<
    string | null
  >(null);

  const [
    pending,
    startTransition,
  ] = useTransition();

  const canSubmit =
    form.name.trim().length >= 2 &&
    form.email.includes("@") &&
    form.password.length >= 6 &&
    form.street.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.state.trim().length === 2 &&
    !pending;

  function updateField<
    Key extends keyof FormState,
  >(
    field: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleZipCodeBlur() {
    const digits =
      onlyDigits(
        form.zipCode,
      );

    if (!digits) {
      return;
    }

    try {
      const address =
        await fetchViaCep(
          digits,
        );

      setForm((current) => ({
        ...current,
        ...address,
      }));

      toast.success(
        "Endereço preenchido pelo CEP.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar o CEP.",
      );
    }
  }

  function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    startTransition(async () => {
      try {
        setErrorMessage(null);

        await createClient({
          name:
            form.name,

          email:
            form.email,

          password:
            form.password,

          phone:
            form.phone,

          document:
            form.document,

          address: {
            zipCode:
              form.zipCode,

            street:
              form.street,

            number:
              form.number,

            complement:
              form.complement,

            neighborhood:
              form.neighborhood,

            city:
              form.city,

            state:
              form.state,

            latitude:
              null,

            longitude:
              null,
          },
        });

        toast.success(
          "Cliente cadastrado com sucesso.",
        );

        router.push(
          "/clients",
        );

        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar o cliente.";

        setErrorMessage(
          message,
        );

        toast.error(
          message,
        );
      }
    });
  }

  function handleBack() {
    if (pending) {
      return;
    }

    router.back();
  }

  function handleCancel() {
    if (pending) {
      return;
    }

    router.push(
      "/clients",
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 pb-28"
    >
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader
          icon={
            <UserRound className="h-5 w-5" />
          }
          title="Identificação do cliente"
          description="Informe os dados principais do responsável ou da empresa."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel required>
              Nome completo ou razão social
            </FieldLabel>

            <Input
              value={
                form.name
              }
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value,
                )
              }
              placeholder="Ex.: Magno Nascimento ou Piscinas Azul Ltda."
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </div>

          <div>
            <FieldLabel>
              CPF ou CNPJ
            </FieldLabel>

            <Input
              value={
                form.document
              }
              onChange={(event) =>
                updateField(
                  "document",
                  event.target.value,
                )
              }
              placeholder="Informe somente se necessário"
              className="h-11 rounded-xl"
              disabled={pending}
            />

            <p className="mt-1.5 text-xs text-slate-400">
              O sistema enviará
              somente os números para
              a API.
            </p>
          </div>

          <div>
            <FieldLabel>
              Telefone
            </FieldLabel>

            <MaskedInput
              mask="(99) 99999-9999"
              value={
                form.phone
              }
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value,
                )
              }
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader
          icon={
            <KeyRound className="h-5 w-5" />
          }
          title="Acesso ao aplicativo"
          description="Essas informações serão utilizadas pelo cliente para acessar o app."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel required>
              E-mail de acesso
            </FieldLabel>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                type="email"
                value={
                  form.email
                }
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value,
                  )
                }
                placeholder="cliente@email.com"
                className="h-11 rounded-xl pl-10"
                disabled={pending}
              />
            </div>
          </div>

          <div>
            <FieldLabel required>
              Senha inicial
            </FieldLabel>

            <div className="relative">
              <Input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={
                  form.password
                }
                onChange={(event) =>
                  updateField(
                    "password",
                    event.target.value,
                  )
                }
                className="h-11 rounded-xl pr-11"
                disabled={pending}
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current,
                  )
                }
                disabled={pending}
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
              Mínimo de 6
              caracteres.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionHeader
          icon={
            <MapPin className="h-5 w-5" />
          }
          title="Endereço principal da piscina"
          description="Este endereço será utilizado automaticamente nas ordens, planos recorrentes e rotas."
        />

        <div className="grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <FieldLabel>
              CEP
            </FieldLabel>

            <MaskedInput
              mask="99999-999"
              value={
                form.zipCode
              }
              onChange={(event) =>
                updateField(
                  "zipCode",
                  event.target.value,
                )
              }
              onBlur={
                handleZipCodeBlur
              }
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </div>

          <div className="sm:col-span-7">
            <FieldLabel required>
              Cidade
            </FieldLabel>

            <Input
              value={
                form.city
              }
              onChange={(event) =>
                updateField(
                  "city",
                  event.target.value,
                )
              }
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </div>

          <div className="sm:col-span-2">
            <FieldLabel required>
              UF
            </FieldLabel>

            <Input
              maxLength={2}
              value={
                form.state
              }
              onChange={(event) =>
                updateField(
                  "state",
                  event.target.value.toUpperCase(),
                )
              }
              className="h-11 rounded-xl text-center"
              disabled={pending}
            />
          </div>

          <div className="sm:col-span-8">
            <FieldLabel required>
              Endereço
            </FieldLabel>

            <Input
              value={
                form.street
              }
              onChange={(event) =>
                updateField(
                  "street",
                  event.target.value,
                )
              }
              placeholder="Rua, avenida ou estrada"
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </div>

          <div className="sm:col-span-4">
            <FieldLabel>
              Número
            </FieldLabel>

            <Input
              value={
                form.number
              }
              onChange={(event) =>
                updateField(
                  "number",
                  event.target.value,
                )
              }
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </div>

          <div className="sm:col-span-6">
            <FieldLabel>
              Bairro
            </FieldLabel>

            <Input
              value={
                form.neighborhood
              }
              onChange={(event) =>
                updateField(
                  "neighborhood",
                  event.target.value,
                )
              }
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </div>

          <div className="sm:col-span-6">
            <FieldLabel>
              Complemento
            </FieldLabel>

            <Input
              value={
                form.complement
              }
              onChange={(event) =>
                updateField(
                  "complement",
                  event.target.value,
                )
              }
              placeholder="Casa, bloco, referência..."
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

          <p className="leading-6">
            Outros endereços ou
            piscinas poderão ser
            adicionados depois, nos
            detalhes do cliente.
          </p>
        </div>
      </section>

      <FormActionBar
        primaryLabel="Criar cliente"
        loadingLabel="Criando cliente..."
        pending={pending}
        disabled={!canSubmit}
        onBack={handleBack}
        onCancel={handleCancel}
        submitType="submit"
      />
    </form>
  );
}