"use client";

import * as React from "react";
import {
  Building2,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

import FormSection from "@/components/form-layout/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  type CompanyProfile,
  updateAccountCompany,
} from "./actions";

type CompanyProfileClientProps = {
  company: CompanyProfile | null;
};

type EditableField =
  | "tradeName"
  | "email"
  | "phone";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatTaxId(
  value: string | null,
) {
  if (!value) {
    return "Não informado";
  }

  const digits =
    onlyDigits(value);

  if (digits.length === 14) {
    return digits.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5",
    );
  }

  if (digits.length === 11) {
    return digits.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      "$1.$2.$3-$4",
    );
  }

  return value;
}

function formatPhone(
  value: string,
) {
  const digits =
    onlyDigits(value).slice(
      0,
      11,
    );

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(
      0,
      2,
    )}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(
      0,
      2,
    )}) ${digits.slice(
      2,
      6,
    )}-${digits.slice(6)}`;
  }

  return `(${digits.slice(
    0,
    2,
  )}) ${digits.slice(
    2,
    7,
  )}-${digits.slice(7)}`;
}

function getStatusLabel(
  status: string | null,
) {
  if (!status) {
    return "Não informado";
  }

  const normalized =
    status
      .trim()
      .toUpperCase();

  if (normalized === "ACTIVE") {
    return "Ativa";
  }

  if (
    normalized === "INACTIVE"
  ) {
    return "Inativa";
  }

  return status;
}

function isActiveStatus(
  status: string | null,
) {
  return (
    status
      ?.trim()
      .toUpperCase() ===
    "ACTIVE"
  );
}

export default function CompanyProfileClient({
  company,
}: CompanyProfileClientProps) {
  const [
    currentCompany,
    setCurrentCompany,
  ] = React.useState(company);

  const [
    isPending,
    startTransition,
  ] = React.useTransition();

  const [
    editingField,
    setEditingField,
  ] =
    React.useState<EditableField | null>(
      null,
    );

  const [
    tradeName,
    setTradeName,
  ] = React.useState(
    company?.tradeName ||
      company?.name ||
      "",
  );

  const [
    email,
    setEmail,
  ] = React.useState(
    company?.email || "",
  );

  const [
    phone,
    setPhone,
  ] = React.useState(
    company?.phone || "",
  );

  const tradeNameRef =
    React.useRef<HTMLInputElement>(
      null,
    );

  const emailRef =
    React.useRef<HTMLInputElement>(
      null,
    );

  const phoneRef =
    React.useRef<HTMLInputElement>(
      null,
    );

  const isEditing =
    editingField !== null;

  const hasChanges =
    React.useMemo(() => {
      if (!currentCompany) {
        return false;
      }

      const currentTradeName =
        (
          currentCompany.tradeName ||
          currentCompany.name ||
          ""
        ).trim();

      const currentEmail =
        (
          currentCompany.email ||
          ""
        ).trim();

      const currentPhone =
        onlyDigits(
          currentCompany.phone ||
            "",
        );

      return (
        tradeName.trim() !==
          currentTradeName ||
        email.trim() !==
          currentEmail ||
        onlyDigits(phone) !==
          currentPhone
      );
    }, [
      currentCompany,
      tradeName,
      email,
      phone,
    ]);

  function handleEdit(
    field: EditableField,
  ) {
    setEditingField(field);

    window.requestAnimationFrame(
      () => {
        if (
          field ===
          "tradeName"
        ) {
          tradeNameRef.current?.focus();
          tradeNameRef.current?.select();
        }

        if (
          field === "email"
        ) {
          emailRef.current?.focus();
          emailRef.current?.select();
        }

        if (
          field === "phone"
        ) {
          phoneRef.current?.focus();
          phoneRef.current?.select();
        }
      },
    );
  }

  function handleCancel() {
    if (!currentCompany) {
      return;
    }

    setTradeName(
      currentCompany.tradeName ||
        currentCompany.name ||
        "",
    );

    setEmail(
      currentCompany.email || "",
    );

    setPhone(
      currentCompany.phone || "",
    );

    setEditingField(null);
  }

  function handleSave() {
    startTransition(
      async () => {
        try {
          const updated =
            await updateAccountCompany(
              {
                tradeName,
                email,
                phone,
              },
            );

          if (!updated) {
            throw new Error(
              "Não foi possível atualizar os dados da empresa.",
            );
          }

          setCurrentCompany(
            updated,
          );

          setTradeName(
            updated.tradeName ||
              updated.name,
          );

          setEmail(
            updated.email || "",
          );

          setPhone(
            updated.phone || "",
          );

          setEditingField(null);

          toast.success(
            "Dados da empresa atualizados com sucesso.",
          );
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Não foi possível atualizar os dados da empresa.",
          );
        }
      },
    );
  }

  if (!currentCompany) {
    return (
      <FormSection
        icon={Building2}
        title="Empresa"
        description="Informações cadastrais da empresa selecionada."
      >
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
          <Building2 className="mx-auto h-7 w-7 text-slate-300" />

          <p className="mt-3 text-sm font-semibold text-slate-700">
            Dados da empresa indisponíveis
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Não foi possível carregar as informações da empresa selecionada.
          </p>
        </div>
      </FormSection>
    );
  }

  return (
    <FormSection
      icon={Building2}
      title={
        currentCompany.tradeName ||
        currentCompany.name
      }
      description="Informações cadastradas para esta empresa no Aqua Mappa."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="company-trade-name"
            className="mb-2 block text-xs font-semibold text-slate-700"
          >
            Nome fantasia
          </label>

          <div className="relative">
            <Input
              ref={tradeNameRef}
              id="company-trade-name"
              value={tradeName}
              onChange={(event) =>
                setTradeName(
                  event.target.value,
                )
              }
              readOnly={
                editingField !==
                "tradeName"
              }
              disabled={isPending}
              className={`h-11 pr-11 transition-all ${
                editingField ===
                "tradeName"
                  ? "border-sky-300 bg-white text-slate-900 shadow-sm focus-visible:border-sky-500 focus-visible:ring-sky-100"
                  : "cursor-default border-slate-200 bg-slate-50 text-slate-700"
              }`}
            />

            <button
              type="button"
              onClick={() =>
                handleEdit(
                  "tradeName",
                )
              }
              disabled={isPending}
              aria-label="Editar nome fantasia"
              title="Editar nome fantasia"
              className={`absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg transition ${
                editingField ===
                "tradeName"
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-400 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-slate-700">
            Razão social
          </p>

          <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700">
            {currentCompany.name ||
              "Não informado"}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-slate-700">
            CNPJ / Documento
          </p>

          <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700">
            {formatTaxId(
              currentCompany.taxId,
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="company-email"
            className="mb-2 block text-xs font-semibold text-slate-700"
          >
            E-mail da empresa
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              ref={emailRef}
              id="company-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              readOnly={
                editingField !==
                "email"
              }
              disabled={isPending}
              placeholder="contato@empresa.com.br"
              className={`h-11 pl-10 pr-11 transition-all ${
                editingField ===
                "email"
                  ? "border-sky-300 bg-white text-slate-900 shadow-sm focus-visible:border-sky-500 focus-visible:ring-sky-100"
                  : "cursor-default border-slate-200 bg-slate-50 text-slate-700"
              }`}
            />

            <button
              type="button"
              onClick={() =>
                handleEdit("email")
              }
              disabled={isPending}
              aria-label="Editar e-mail da empresa"
              title="Editar e-mail"
              className={`absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg transition ${
                editingField ===
                "email"
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-400 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="company-phone"
            className="mb-2 block text-xs font-semibold text-slate-700"
          >
            Telefone da empresa
          </label>

          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              ref={phoneRef}
              id="company-phone"
              type="tel"
              value={formatPhone(
                phone,
              )}
              onChange={(event) =>
                setPhone(
                  onlyDigits(
                    event.target.value,
                  ).slice(
                    0,
                    11,
                  ),
                )
              }
              readOnly={
                editingField !==
                "phone"
              }
              disabled={isPending}
              placeholder="(11) 99999-9999"
              className={`h-11 pl-10 pr-11 transition-all ${
                editingField ===
                "phone"
                  ? "border-sky-300 bg-white text-slate-900 shadow-sm focus-visible:border-sky-500 focus-visible:ring-sky-100"
                  : "cursor-default border-slate-200 bg-slate-50 text-slate-700"
              }`}
            />

            <button
              type="button"
              onClick={() =>
                handleEdit("phone")
              }
              disabled={isPending}
              aria-label="Editar telefone da empresa"
              title="Editar telefone"
              className={`absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg transition ${
                editingField ===
                "phone"
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-400 hover:bg-sky-50 hover:text-sky-700"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-slate-700">
            Status
          </p>

          <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700">
            <span
              className={`inline-flex items-center gap-2 font-medium ${
                isActiveStatus(
                  currentCompany.status,
                )
                  ? "text-emerald-700"
                  : "text-slate-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isActiveStatus(
                    currentCompany.status,
                  )
                    ? "bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />

              {getStatusLabel(
                currentCompany.status,
              )}
            </span>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2">
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                className="rounded-xl border-slate-200 px-5 text-slate-700"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}

            <Button
              type="button"
              onClick={handleSave}
              disabled={
                isPending ||
                !tradeName.trim() ||
                !hasChanges
              }
              className="btn-brand rounded-xl px-5 text-white shadow-sm transition hover:opacity-90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </FormSection>
  );
}