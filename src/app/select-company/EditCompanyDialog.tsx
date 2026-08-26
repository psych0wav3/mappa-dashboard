"use client";

import * as React from "react";
import {
  Building2,
  Loader2,
  Mail,
  Phone,
  Save,
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
  getCompanyById,
  SelectCompanyApiError,
  updateCompany,
} from "./select-company.api";

type EditCompanyDialogProps = {
  open: boolean;
  company: CompanyItem | null;
  onOpenChange: (open: boolean) => void;
  onCompanyUpdated: (
    company: CompanyItem,
  ) => void;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(
    0,
    11,
  );

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(
      0,
      3,
    )}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(
      0,
      3,
    )}.${digits.slice(
      3,
      6,
    )}.${digits.slice(6)}`;
  }

  return `${digits.slice(
    0,
    3,
  )}.${digits.slice(
    3,
    6,
  )}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
}

function formatCnpj(value: string) {
  const digits = onlyDigits(value).slice(
    0,
    14,
  );

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(
      0,
      2,
    )}.${digits.slice(2)}`;
  }

  if (digits.length <= 8) {
    return `${digits.slice(
      0,
      2,
    )}.${digits.slice(
      2,
      5,
    )}.${digits.slice(5)}`;
  }

  if (digits.length <= 12) {
    return `${digits.slice(
      0,
      2,
    )}.${digits.slice(
      2,
      5,
    )}.${digits.slice(
      5,
      8,
    )}/${digits.slice(8)}`;
  }

  return `${digits.slice(
    0,
    2,
  )}.${digits.slice(
    2,
    5,
  )}.${digits.slice(
    5,
    8,
  )}/${digits.slice(
    8,
    12,
  )}-${digits.slice(12)}`;
}

function formatDocument(value: string) {
  const digits = onlyDigits(value).slice(
    0,
    14,
  );

  return digits.length <= 11
    ? formatCpf(digits)
    : formatCnpj(digits);
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(
    0,
    11,
  );

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

export default function EditCompanyDialog({
  open,
  company,
  onOpenChange,
  onCompanyUpdated,
}: EditCompanyDialogProps) {
  const [name, setName] =
    React.useState("");
  const [tradeName, setTradeName] =
    React.useState("");
  const [document, setDocument] =
    React.useState("");
  const [email, setEmail] =
    React.useState("");
  const [phone, setPhone] =
    React.useState("");

  const [
    loadingDetails,
    setLoadingDetails,
  ] = React.useState(false);

  const [pending, startTransition] =
    React.useTransition();

React.useEffect(() => {
  if (!open || !company) {
    return;
  }

  const selectedCompany = company;
  let active = true;

  setName(selectedCompany.name || "");
  setTradeName(selectedCompany.tradeName || "");
  setDocument(selectedCompany.document || "");
  setEmail(selectedCompany.email || "");
  setPhone(selectedCompany.phone || "");

  setLoadingDetails(true);

  async function loadCompany() {
    try {
      const details = await getCompanyById(
        selectedCompany.id,
      );

      if (!active) {
        return;
      }

      setName(details.name || "");
      setTradeName(details.tradeName || "");
      setDocument(details.document || "");
      setEmail(details.email || "");
      setPhone(details.phone || "");
    } catch (error) {
      if (!active) {
        return;
      }

      toast.error(
        "Não foi possível carregar os dados da empresa.",
        {
          description:
            error instanceof Error
              ? error.message
              : "Tente novamente em alguns instantes.",
        },
      );
    } finally {
      if (active) {
        setLoadingDetails(false);
      }
    }
  }

  void loadCompany();

  return () => {
    active = false;
  };
}, [open, company]);

  function handleOpenChange(
    value: boolean,
  ) {
    if (pending) {
      return;
    }

    onOpenChange(value);
  }

function handleSubmit(
  event: React.FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  if (!company) {
    return;
  }

  const selectedCompany = company;

  if (!name.trim()) {
    toast.error(
      "Informe a razão social ou nome.",
    );
    return;
  }

  if (!tradeName.trim()) {
    toast.error(
      "Informe o nome fantasia.",
    );
    return;
  }

  const documentDigits =
    onlyDigits(document);

  if (
    documentDigits.length !== 11 &&
    documentDigits.length !== 14
  ) {
    toast.error(
      "Informe um CPF ou CNPJ válido.",
    );
    return;
  }

  startTransition(async () => {
    try {
      const updated = await updateCompany(
        selectedCompany.id,
        {
          name,
          tradeName,
          document: documentDigits,
          email,
          phone,
        },
      );

      onCompanyUpdated(updated);

      toast.success(
        "Empresa atualizada com sucesso.",
      );

      onOpenChange(false);
    } catch (error) {
      if (
        error instanceof SelectCompanyApiError &&
        error.status === 500
      ) {
        toast.error(
          "A API não conseguiu concluir a edição da empresa.",
          {
            description:
              "O frontend já está preparado. Falta a correção do PATCH de empresa na API.",
          },
        );
        return;
      }

      toast.error(
        "Não foi possível atualizar a empresa.",
        {
          description:
            error instanceof Error
              ? error.message
              : "Verifique os dados e tente novamente.",
        },
      );
    }
  });
}

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0">
        <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-[#0077C8]">
                <Building2 size={19} />
              </div>

              <div>
                <DialogTitle>
                  Editar empresa
                </DialogTitle>

                <p className="mt-1 text-xs text-neutral-500">
                  Atualize os dados
                  cadastrais da empresa
                  selecionada.
                </p>
              </div>
            </div>
          </DialogHeader>

          <button
            type="button"
            onClick={() =>
              handleOpenChange(false)
            }
            disabled={pending}
            className="grid h-9 w-9 place-items-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {loadingDetails ? (
          <div className="flex min-h-[320px] items-center justify-center px-6 py-8">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2
                size={18}
                className="animate-spin"
              />

              Carregando dados da empresa...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-company-name"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Razão social / Nome *
                  </label>

                  <Input
                    id="edit-company-name"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value,
                      )
                    }
                    disabled={pending}
                    className="h-11"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-company-trade-name"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Nome fantasia *
                  </label>

                  <Input
                    id="edit-company-trade-name"
                    value={tradeName}
                    onChange={(event) =>
                      setTradeName(
                        event.target.value,
                      )
                    }
                    disabled={pending}
                    className="h-11"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-company-document"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    CPF ou CNPJ *
                  </label>

                  <Input
                    id="edit-company-document"
                    value={formatDocument(
                      document,
                    )}
                    onChange={(event) =>
                      setDocument(
                        onlyDigits(
                          event.target.value,
                        ).slice(0, 14),
                      )
                    }
                    disabled={pending}
                    className="h-11"
                    inputMode="numeric"
                    placeholder="CPF ou CNPJ"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-company-email"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    E-mail da empresa
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                    <Input
                      id="edit-company-email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value,
                        )
                      }
                      disabled={pending}
                      className="h-11 pl-10"
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="edit-company-phone"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Telefone da empresa
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                    <Input
                      id="edit-company-phone"
                      value={formatPhone(
                        phone,
                      )}
                      onChange={(event) =>
                        setPhone(
                          onlyDigits(
                            event.target.value,
                          ).slice(0, 11),
                        )
                      }
                      disabled={pending}
                      className="h-11 pl-10"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-100 bg-neutral-50/60 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  handleOpenChange(false)
                }
                disabled={pending}
                className="rounded-xl px-5"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={pending}
                className="btn-brand rounded-xl px-5 text-white"
              >
                {pending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}

                {pending
                  ? "Salvando..."
                  : "Salvar alterações"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}