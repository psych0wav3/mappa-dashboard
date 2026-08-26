"use client";

import * as React from "react";
import {
  Building2,
  Loader2,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  CompanyItem,
  createCompany,
  createCompanyAdmin,
} from "./select-company.api";

type NewCompanyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyCreated: (company: CompanyItem) => void;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
}

function formatCnpj(value: string) {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
      5,
      8,
    )}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(
    5,
    8,
  )}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatDocument(value: string) {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 11) {
    return formatCpf(digits);
  }

  return formatCnpj(digits);
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function NewCompanyDialog({
  open,
  onOpenChange,
  onCompanyCreated,
}: NewCompanyDialogProps) {
  const [companyName, setCompanyName] = React.useState("");
  const [tradeName, setTradeName] = React.useState("");
  const [document, setDocument] = React.useState("");
  const [companyEmail, setCompanyEmail] = React.useState("");
  const [companyPhone, setCompanyPhone] = React.useState("");

  const [adminName, setAdminName] = React.useState("");
  const [adminEmail, setAdminEmail] = React.useState("");
  const [adminPhone, setAdminPhone] = React.useState("");
  const [adminPassword, setAdminPassword] = React.useState("");

  const [createdCompany, setCreatedCompany] =
    React.useState<CompanyItem | null>(null);

  const [pending, startTransition] = React.useTransition();

  function reset() {
    setCompanyName("");
    setTradeName("");
    setDocument("");
    setCompanyEmail("");
    setCompanyPhone("");
    setAdminName("");
    setAdminEmail("");
    setAdminPhone("");
    setAdminPassword("");
    setCreatedCompany(null);
  }

  function handleOpenChange(value: boolean) {
    if (pending) {
      return;
    }

    if (!value) {
      reset();
    }

    onOpenChange(value);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!companyName.trim()) {
      toast.error("Informe a razão social ou nome.");
      return;
    }

    if (!tradeName.trim()) {
      toast.error("Informe o nome fantasia.");
      return;
    }

    const documentDigits = onlyDigits(document);

    if (
      documentDigits.length !== 11 &&
      documentDigits.length !== 14
    ) {
      toast.error("Informe um CPF ou CNPJ válido.");
      return;
    }

    if (!adminName.trim()) {
      toast.error("Informe o nome do administrador.");
      return;
    }

    if (!adminEmail.trim()) {
      toast.error("Informe o e-mail de acesso do administrador.");
      return;
    }

    if (!adminPassword) {
      toast.error("Informe a senha inicial do administrador.");
      return;
    }

    startTransition(async () => {
      let company = createdCompany;

      try {
        if (!company) {
          company = await createCompany({
            name: companyName,
            tradeName,
            document: documentDigits,
            email: companyEmail,
            phone: companyPhone,
          });

          setCreatedCompany(company);
          onCompanyCreated(company);
        }

        await createCompanyAdmin(company.id, {
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          phone: adminPhone,
        });

        toast.success("Empresa criada com sucesso.", {
          description: `${
            company.tradeName || company.name
          } já possui um administrador com acesso ao Aqua Mappa.`,
        });

        reset();
        onOpenChange(false);
      } catch (error) {
        if (company) {
          toast.error(
            "Empresa criada, mas falta concluir o administrador.",
            {
              description:
                error instanceof Error
                  ? error.message
                  : "Corrija os dados do administrador e tente novamente.",
            },
          );

          return;
        }

        toast.error("Não foi possível criar a empresa.", {
          description:
            error instanceof Error
              ? error.message
              : "Verifique os dados e tente novamente.",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0">
        <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-[#0077C8]">
                <Building2 size={19} />
              </div>

              <div>
                <DialogTitle>Nova empresa</DialogTitle>

                <p className="mt-1 text-xs text-neutral-500">
                  Cadastre a empresa e crie o primeiro administrador
                  responsável.
                </p>
              </div>
            </div>
          </DialogHeader>

          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={pending}
            className="grid h-9 w-9 place-items-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-7 px-6 py-6">
            <section>
              {createdCompany ? (
                <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <strong>
                    {createdCompany.tradeName || createdCompany.name}
                  </strong>{" "}
                  já foi criada. Agora conclua o cadastro do administrador.
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="company-name"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Razão social / Nome *
                  </label>

                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(event) =>
                      setCompanyName(event.target.value)
                    }
                    disabled={pending || Boolean(createdCompany)}
                    className="h-11"
                    placeholder="Piscinas Azul LTDA"
                  />
                </div>

                <div>
                  <label
                    htmlFor="company-trade-name"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Nome fantasia *
                  </label>

                  <Input
                    id="company-trade-name"
                    value={tradeName}
                    onChange={(event) =>
                      setTradeName(event.target.value)
                    }
                    disabled={pending || Boolean(createdCompany)}
                    className="h-11"
                    placeholder="Piscinas Azul"
                  />
                </div>

                <div>
                  <label
                    htmlFor="company-document"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    CPF ou CNPJ *
                  </label>

                  <Input
                    id="company-document"
                    value={formatDocument(document)}
                    onChange={(event) =>
                      setDocument(
                        onlyDigits(event.target.value).slice(0, 14),
                      )
                    }
                    disabled={pending || Boolean(createdCompany)}
                    className="h-11"
                    inputMode="numeric"
                    placeholder="CPF ou CNPJ"
                  />
                </div>

                <div>
                  <label
                    htmlFor="company-email"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    E-mail da empresa
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                    <Input
                      id="company-email"
                      type="email"
                      value={companyEmail}
                      onChange={(event) =>
                        setCompanyEmail(event.target.value)
                      }
                      disabled={pending || Boolean(createdCompany)}
                      className="h-11 pl-10"
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="company-phone"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Telefone da empresa
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                    <Input
                      id="company-phone"
                      value={formatPhone(companyPhone)}
                      onChange={(event) =>
                        setCompanyPhone(
                          onlyDigits(event.target.value).slice(0, 11),
                        )
                      }
                      disabled={pending || Boolean(createdCompany)}
                      className="h-11 pl-10"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-neutral-100" />

            <section>
              <div className="mb-4 flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-[#0077C8]">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Administrador responsável
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    Este usuário poderá entrar diretamente no dashboard da
                    nova empresa.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="admin-name"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Nome completo *
                  </label>

                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                    <Input
                      id="admin-name"
                      value={adminName}
                      onChange={(event) =>
                        setAdminName(event.target.value)
                      }
                      disabled={pending}
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-email"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    E-mail de acesso *
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                    <Input
                      id="admin-email"
                      type="email"
                      value={adminEmail}
                      onChange={(event) =>
                        setAdminEmail(event.target.value)
                      }
                      disabled={pending}
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-phone"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Telefone
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                    <Input
                      id="admin-phone"
                      value={formatPhone(adminPhone)}
                      onChange={(event) =>
                        setAdminPhone(
                          onlyDigits(event.target.value).slice(0, 11),
                        )
                      }
                      disabled={pending}
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Senha inicial *
                  </label>

                  <Input
                    id="admin-password"
                    type="password"
                    autoComplete="new-password"
                    value={adminPassword}
                    onChange={(event) =>
                      setAdminPassword(event.target.value)
                    }
                    disabled={pending}
                    className="h-11"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-neutral-100 bg-neutral-50/60 px-6 py-4">
            {!createdCompany ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={pending}
                className="rounded-xl px-5"
              >
                Cancelar
              </Button>
            ) : null}

            <Button
              type="submit"
              disabled={pending}
              className="btn-brand rounded-xl px-5 text-white"
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : createdCompany ? (
                <ShieldCheck className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}

              {pending
                ? "Salvando..."
                : createdCompany
                  ? "Criar administrador"
                  : "Criar empresa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}