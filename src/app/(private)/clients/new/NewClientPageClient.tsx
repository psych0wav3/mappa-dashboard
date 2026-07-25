"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  MapPin,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/app/(private)/clients/actions";

import FormField from "@/components/form-layout/FormField";
import FormInfoBox from "@/components/form-layout/FormInfoBox";
import FormSection from "@/components/form-layout/FormSection";
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

async function fetchViaCep(zipCode: string) {
  const digits = onlyDigits(zipCode);

  if (digits.length !== 8) {
    throw new Error("O CEP deve possuir 8 dígitos.");
  }

  const response = await fetch(
    `https://viacep.com.br/ws/${digits}/json/`,
  );

  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP.");
  }

  const data = await response.json();

  if (data?.erro) {
    throw new Error("CEP não encontrado.");
  }

  return {
    street: data.logradouro || "",
    neighborhood: data.bairro || "",
    city: data.localidade || "",
    state: data.uf || "",
  };
}

export default function NewClientPageClient() {
  const router = useRouter();

  const [form, setForm] =
    React.useState<FormState>(initialState);

  const [showPassword, setShowPassword] =
    React.useState(false);

  const [errorMessage, setErrorMessage] =
    React.useState<string | null>(null);

  const [pending, startTransition] = useTransition();

  const canSubmit =
    form.name.trim().length >= 2 &&
    form.email.includes("@") &&
    form.password.length >= 6 &&
    form.street.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.state.trim().length === 2 &&
    !pending;

  function updateField<Key extends keyof FormState>(
    field: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleZipCodeBlur() {
    const digits = onlyDigits(form.zipCode);

    if (!digits) {
      return;
    }

    try {
      const address = await fetchViaCep(digits);

      setForm((current) => ({
        ...current,
        ...address,
      }));

      toast.success("Endereço preenchido pelo CEP.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar o CEP.",
      );
    }
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    startTransition(async () => {
      try {
        setErrorMessage(null);

        await createClient({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          document: form.document,

          address: {
            zipCode: form.zipCode,
            street: form.street,
            number: form.number,
            complement: form.complement,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
            latitude: null,
            longitude: null,
          },
        });

        toast.success(
          "Cliente cadastrado com sucesso.",
        );

        router.push("/clients");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar o cliente.";

        setErrorMessage(message);
        toast.error(message);
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

    router.push("/clients");
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

      <FormSection
        icon={UserRound}
        title="Identificação do cliente"
        description="Informe os dados principais do responsável ou da empresa."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            htmlFor="client-name"
            label="Nome completo ou razão social"
            required
            className="sm:col-span-2"
          >
            <Input
              id="client-name"
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value,
                )
              }
              placeholder="Ex.: João da Silva ou Piscinas Azul Ltda."
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </FormField>

          <FormField
            htmlFor="client-document"
            label="CPF ou CNPJ"
            optional
            description="O sistema enviará somente os números para a API."
          >
            <Input
              id="client-document"
              value={form.document}
              onChange={(event) =>
                updateField(
                  "document",
                  event.target.value,
                )
              }
              placeholder="xxx.xxx.xxx-xx ou xx.xxx.xxx/xxxx-xx"
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </FormField>

          <FormField
            htmlFor="client-phone"
            label="Telefone"
            optional
          >
            <MaskedInput
              id="client-phone"
              mask="(99) 99999-9999"
              value={form.phone}
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value,
                )
              }
              placeholder="(00) 00000-0000"
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        icon={KeyRound}
        title="Acesso ao aplicativo"
        description="Essas informações serão utilizadas pelo cliente para acessar o aplicativo."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            htmlFor="client-email"
            label="E-mail de acesso"
            required
          >
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                id="client-email"
                type="email"
                autoComplete="email"
                value={form.email}
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
          </FormField>

          <FormField
            htmlFor="client-password"
            label="Senha inicial"
            required
            description="A senha deve possuir pelo menos 6 caracteres."
          >
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                id="client-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                value={form.password}
                onChange={(event) =>
                  updateField(
                    "password",
                    event.target.value,
                  )
                }
                className="h-11 rounded-xl px-10"
                disabled={pending}
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
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
          </FormField>
        </div>
      </FormSection>

      <FormSection
        icon={MapPin}
        title="Endereço principal da piscina"
        description="Este endereço será utilizado automaticamente nas ordens, rotinas de atendimento e rotas."
      >
        <div className="grid gap-4 sm:grid-cols-12">
          <FormField
            htmlFor="client-zip-code"
            label="CEP"
            optional
            className="sm:col-span-3"
          >
            <MaskedInput
              id="client-zip-code"
              mask="99999-999"
              value={form.zipCode}
              onChange={(event) =>
                updateField(
                  "zipCode",
                  event.target.value,
                )
              }
              onBlur={handleZipCodeBlur}
              placeholder="00000-000"
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </FormField>

          <FormField
            htmlFor="client-city"
            label="Cidade"
            required
            className="sm:col-span-7"
          >
            <Input
              id="client-city"
              value={form.city}
              onChange={(event) =>
                updateField(
                  "city",
                  event.target.value,
                )
              }
              placeholder="Ex.: São Paulo"
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </FormField>

          <FormField
            htmlFor="client-state"
            label="UF"
            required
            className="sm:col-span-2"
          >
            <Input
              id="client-state"
              maxLength={2}
              value={form.state}
              onChange={(event) =>
                updateField(
                  "state",
                  event.target.value.toUpperCase(),
                )
              }
              placeholder="SP"
              className="h-11 rounded-xl text-center uppercase"
              disabled={pending}
            />
          </FormField>

          <FormField
            htmlFor="client-street"
            label="Endereço"
            required
            className="sm:col-span-8"
          >
            <Input
              id="client-street"
              value={form.street}
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
          </FormField>

          <FormField
            htmlFor="client-number"
            label="Número"
            optional
            className="sm:col-span-4"
          >
            <Input
              id="client-number"
              value={form.number}
              onChange={(event) =>
                updateField(
                  "number",
                  event.target.value,
                )
              }
              placeholder="Ex.: 125"
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </FormField>

          <FormField
            htmlFor="client-neighborhood"
            label="Bairro"
            optional
            className="sm:col-span-6"
          >
            <Input
              id="client-neighborhood"
              value={form.neighborhood}
              onChange={(event) =>
                updateField(
                  "neighborhood",
                  event.target.value,
                )
              }
              placeholder="Ex.: Centro"
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </FormField>

          <FormField
            htmlFor="client-complement"
            label="Complemento"
            optional
            className="sm:col-span-6"
          >
            <Input
              id="client-complement"
              value={form.complement}
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
          </FormField>
        </div>

        <FormInfoBox
          icon={MapPin}
          className="mt-5"
        >
          Outros endereços ou piscinas poderão ser adicionados
          depois, nos detalhes do cliente.
        </FormInfoBox>
      </FormSection>

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