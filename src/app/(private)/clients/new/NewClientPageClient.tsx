"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/app/(private)/clients/actions";

import FormField from "@/components/form-layout/FormField";
import FormInfoBox from "@/components/form-layout/FormInfoBox";
import StepFormSection from "@/components/form-layout/StepFormSection";
import FormActionBar from "@/components/ui/FormActionBar";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { getErrorMessage } from "@/lib/mappa/errors";

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

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
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

function normalizeDocument(value: string) {
  return onlyDigits(value).slice(0, 14);
}

function formatDocument(value: string) {
  const digits = normalizeDocument(value);

  if (digits.length <= 11) {
    if (digits.length <= 3) {
      return digits;
    }

    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }

    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(
        3,
        6,
      )}.${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(
      3,
      6,
    )}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(
      2,
      5,
    )}.${digits.slice(5)}`;
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(
      2,
      5,
    )}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(
    2,
    5,
  )}.${digits.slice(5, 8)}/${digits.slice(
    8,
    12,
  )}-${digits.slice(12)}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim(),
  );
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

  const data = (await response.json()) as ViaCepResponse;

  if (data.erro) {
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

  const [pending, startTransition] =
    React.useTransition();

  const [searchingZipCode, setSearchingZipCode] =
    React.useState(false);

  const [errorMessage, setErrorMessage] =
    React.useState<string | null>(null);

  const normalizedDocument = normalizeDocument(
    form.document,
  );

  const normalizedPhone = onlyDigits(form.phone);

  const normalizedZipCode = onlyDigits(form.zipCode);

  const isNameValid =
    form.name.trim().length >= 2;

  const isDocumentValid =
    normalizedDocument.length === 0 ||
    normalizedDocument.length === 11 ||
    normalizedDocument.length === 14;

  const isPhoneValid =
    normalizedPhone.length === 0 ||
    normalizedPhone.length === 10 ||
    normalizedPhone.length === 11;

  const isEmailValid = isValidEmail(form.email);

  const isPasswordValid =
    form.password.trim().length >= 6;

  const isZipCodeValid =
    normalizedZipCode.length === 0 ||
    normalizedZipCode.length === 8;

  const isStreetValid =
    form.street.trim().length > 0;

  const isCityValid =
    form.city.trim().length > 0;

  const isStateValid =
    form.state.trim().length === 2;

  const canSubmit =
    isNameValid &&
    isDocumentValid &&
    isPhoneValid &&
    isEmailValid &&
    isPasswordValid &&
    isZipCodeValid &&
    isStreetValid &&
    isCityValid &&
    isStateValid &&
    !pending &&
    !searchingZipCode;

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

    if (digits.length !== 8) {
      toast.error("O CEP deve possuir 8 dígitos.");

      return;
    }

    try {
      setSearchingZipCode(true);

      const address = await fetchViaCep(digits);

      setForm((current) => ({
        ...current,
        ...address,
      }));

      toast.success("Endereço preenchido pelo CEP.");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Não foi possível consultar o CEP.",
        ),
      );
    } finally {
      setSearchingZipCode(false);
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
          name: form.name.trim(),

          email: form.email
            .trim()
            .toLocaleLowerCase("pt-BR"),

          password: form.password.trim(),

          phone:
            normalizedPhone || undefined,

          document:
            normalizedDocument || undefined,

          address: {
            zipCode:
              normalizedZipCode || undefined,

            street: form.street.trim(),

            number:
              form.number.trim() || undefined,

            complement:
              form.complement.trim() || undefined,

            neighborhood:
              form.neighborhood.trim() || undefined,

            city: form.city.trim(),

            state: form.state
              .trim()
              .toUpperCase(),

            latitude: null,
            longitude: null,
          },
        });

        toast.success(
          "Cliente cadastrado com sucesso.",
        );

        router.push("/clients?created=1");
        router.refresh();
      } catch (error) {
        const message =
          getErrorMessage(
            error,
            "Não foi possível cadastrar o cliente.",
          );

        setErrorMessage(message);
        toast.error(message);
      }
    });
  }

  function handleBack() {
    if (pending || searchingZipCode) {
      return;
    }

    router.back();
  }

  function handleCancel() {
    if (pending || searchingZipCode) {
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

      <StepFormSection
        step={1}
        icon={UserRound}
        title="Identificação do cliente"
        description="Informe os dados principais do responsável ou da empresa."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            htmlFor="client-name"
            label="Nome completo ou razão social"
            required
            error={
              form.name.length > 0 && !isNameValid
                ? "Informe o nome completo ou a razão social."
                : undefined
            }
            className="sm:col-span-2"
          >
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                id="client-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value,
                  )
                }
                placeholder="Ex.: João da Silva ou Piscinas Azul Ltda."
                className="h-11 rounded-xl pl-10"
                aria-invalid={
                  form.name.length > 0 &&
                  !isNameValid
                }
                disabled={pending}
              />
            </div>
          </FormField>

          <FormField
            htmlFor="client-document"
            label="CPF ou CNPJ"
            optional
            error={
              form.document.length > 0 &&
              !isDocumentValid
                ? "Informe um CPF com 11 dígitos ou um CNPJ com 14 dígitos."
                : undefined
            }
          >
            <Input
              id="client-document"
              type="text"
              inputMode="numeric"
              value={form.document}
              onChange={(event) =>
                updateField(
                  "document",
                  formatDocument(event.target.value),
                )
              }
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              className="h-11 rounded-xl"
              aria-invalid={
                form.document.length > 0 &&
                !isDocumentValid
              }
              disabled={pending}
            />
          </FormField>

          <FormField
            htmlFor="client-phone"
            label="Telefone"
            optional
            error={
              form.phone.length > 0 && !isPhoneValid
                ? "Informe um telefone válido com DDD."
                : undefined
            }
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
              aria-invalid={
                form.phone.length > 0 &&
                !isPhoneValid
              }
              disabled={pending}
            />
          </FormField>

          <FormInfoBox
            icon={ShieldCheck}
            compact
            className="sm:col-span-2"
          >
            O cliente será vinculado à empresa e poderá
            acompanhar os atendimentos pelo aplicativo.
          </FormInfoBox>
        </div>
      </StepFormSection>

      <StepFormSection
        step={2}
        icon={KeyRound}
        title="Acesso ao aplicativo"
        description="Crie as credenciais iniciais que serão utilizadas pelo cliente."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            htmlFor="client-email"
            label="E-mail de acesso"
            required
            error={
              form.email.length > 0 &&
              !isEmailValid
                ? "Informe um endereço de e-mail válido."
                : undefined
            }
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
                aria-invalid={
                  form.email.length > 0 &&
                  !isEmailValid
                }
                disabled={pending}
              />
            </div>
          </FormField>

          <FormField
            htmlFor="client-password"
            label="Senha inicial"
            required
            description="A senha deve possuir pelo menos 6 caracteres."
            error={
              form.password.length > 0 &&
              !isPasswordValid
                ? "Informe uma senha com pelo menos 6 caracteres."
                : undefined
            }
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
                aria-invalid={
                  form.password.length > 0 &&
                  !isPasswordValid
                }
                disabled={pending}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                disabled={pending}
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
          Oriente o cliente a alterar a senha inicial após o
          primeiro acesso ao aplicativo.
        </FormInfoBox>
      </StepFormSection>

      <StepFormSection
        step={3}
        icon={MapPin}
        title="Endereço principal da piscina"
        description="Cadastre o endereço que será utilizado nas ordens de serviço, rotinas de atendimento e rotas."
      >
        <div className="grid gap-4 sm:grid-cols-12">
          <FormField
            htmlFor="client-zip-code"
            label="CEP"
            optional
            error={
              form.zipCode.length > 0 &&
              !isZipCodeValid
                ? "Informe um CEP com 8 dígitos."
                : undefined
            }
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
              aria-invalid={
                form.zipCode.length > 0 &&
                !isZipCodeValid
              }
              disabled={pending || searchingZipCode}
            />
          </FormField>

          <FormField
            htmlFor="client-city"
            label="Cidade"
            required
            error={
              form.city.length > 0 && !isCityValid
                ? "Informe a cidade."
                : undefined
            }
            className="sm:col-span-7"
          >
            <Input
              id="client-city"
              type="text"
              autoComplete="address-level2"
              value={form.city}
              onChange={(event) =>
                updateField(
                  "city",
                  event.target.value,
                )
              }
              placeholder="Ex.: São Paulo"
              className="h-11 rounded-xl"
              aria-invalid={
                form.city.length > 0 &&
                !isCityValid
              }
              disabled={pending || searchingZipCode}
            />
          </FormField>

          <FormField
            htmlFor="client-state"
            label="UF"
            required
            error={
              form.state.length > 0 &&
              !isStateValid
                ? "Informe a UF."
                : undefined
            }
            className="sm:col-span-2"
          >
            <Input
              id="client-state"
              type="text"
              autoComplete="address-level1"
              maxLength={2}
              value={form.state}
              onChange={(event) =>
                updateField(
                  "state",
                  event.target.value
                    .replace(/[^a-zA-Z]/g, "")
                    .toUpperCase()
                    .slice(0, 2),
                )
              }
              placeholder="SP"
              className="h-11 rounded-xl text-center uppercase"
              aria-invalid={
                form.state.length > 0 &&
                !isStateValid
              }
              disabled={pending || searchingZipCode}
            />
          </FormField>

          <FormField
            htmlFor="client-street"
            label="Endereço"
            required
            error={
              form.street.length > 0 &&
              !isStreetValid
                ? "Informe o endereço."
                : undefined
            }
            className="sm:col-span-8"
          >
            <Input
              id="client-street"
              type="text"
              autoComplete="address-line1"
              value={form.street}
              onChange={(event) =>
                updateField(
                  "street",
                  event.target.value,
                )
              }
              placeholder="Rua, avenida ou estrada"
              className="h-11 rounded-xl"
              aria-invalid={
                form.street.length > 0 &&
                !isStreetValid
              }
              disabled={pending || searchingZipCode}
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
              type="text"
              autoComplete="address-line2"
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
              type="text"
              value={form.neighborhood}
              onChange={(event) =>
                updateField(
                  "neighborhood",
                  event.target.value,
                )
              }
              placeholder="Ex.: Centro"
              className="h-11 rounded-xl"
              disabled={pending || searchingZipCode}
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
              type="text"
              value={form.complement}
              onChange={(event) =>
                updateField(
                  "complement",
                  event.target.value,
                )
              }
              placeholder="Casa, bloco, condomínio ou referência"
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </FormField>
        </div>

        <FormInfoBox
          icon={MapPin}
          className="mt-5"
        >
          Este será o endereço principal da piscina. Outros
          endereços poderão ser adicionados posteriormente nos
          detalhes do cliente.
        </FormInfoBox>
      </StepFormSection>

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