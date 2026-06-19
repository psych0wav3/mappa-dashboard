"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { toast } from "sonner";
import { createClient } from "@/app/(private)/clients/actions";

const schema = z.object({
  firstName: z.string().min(2, "Informe o nome"),
  lastName: z.string().min(2, "Informe o sobrenome"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  cpf: z.string().optional(),

  hasCompany: z.boolean().optional(),
  companyName: z.string().optional(),
  cnpj: z.string().optional(),

  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  uf: z.string().max(2).optional(),

  notes: z.string().optional(),

  poolCep: z.string().optional(),
  poolStreet: z.string().optional(),
  poolNumber: z.string().optional(),
  poolDistrict: z.string().optional(),
  poolCity: z.string().optional(),
  poolUf: z.string().max(2).optional(),

  technicianId: z.string().optional(),
  days: z
    .array(z.enum(["dom", "seg", "ter", "qua", "qui", "sex", "sab"]))
    .optional(),

  active: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

type SectionKey = "client" | "billing" | "pool";

const onlyDigits = (s: string) => s.replace(/\D+/g, "");

async function fetchViaCep(cepDigits: string) {
  const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);

  if (!res.ok) {
    throw new Error("Falha ao consultar CEP");
  }

  const data = await res.json();

  if (data?.erro) {
    return null;
  }

  return {
    street: data?.logradouro ?? "",
    district: data?.bairro ?? "",
    city: data?.localidade ?? "",
    uf: data?.uf ?? "",
  };
}

function buildDefaults(): Values {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cpf: "",

    hasCompany: false,
    companyName: "",
    cnpj: "",

    cep: "",
    street: "",
    number: "",
    district: "",
    city: "",
    uf: "",

    notes: "",

    poolCep: "",
    poolStreet: "",
    poolNumber: "",
    poolDistrict: "",
    poolCity: "",
    poolUf: "",

    technicianId: "",
    days: [],

    active: true,
  };
}

function hasText(value?: string | null) {
  return Boolean(String(value ?? "").trim());
}

function hasDigits(value?: string | null) {
  return onlyDigits(String(value ?? "")).length > 0;
}

function isEmailValid(value?: string | null) {
  return z.string().email().safeParse(value).success;
}

export default function NewClientPageClient() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [openSection, setOpenSection] = React.useState<SectionKey>("client");

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaults(),
  });

  const watchedValues = form.watch();
  const hasCompany = watchedValues.hasCompany;

  const canSubmit = React.useMemo(() => {
    const hasClientData =
      hasText(watchedValues.firstName) &&
      hasText(watchedValues.lastName) &&
      isEmailValid(watchedValues.email) &&
      hasDigits(watchedValues.phone) &&
      hasDigits(watchedValues.cpf);

    const hasCompanyData = watchedValues.hasCompany
      ? hasText(watchedValues.companyName) && hasDigits(watchedValues.cnpj)
      : true;

    const hasBillingAddress =
      hasDigits(watchedValues.cep) &&
      hasText(watchedValues.street) &&
      hasText(watchedValues.number) &&
      hasText(watchedValues.district) &&
      hasText(watchedValues.city) &&
      hasText(watchedValues.uf);

    const hasPoolAddress =
      hasDigits(watchedValues.poolCep) &&
      hasText(watchedValues.poolStreet) &&
      hasText(watchedValues.poolNumber) &&
      hasText(watchedValues.poolDistrict) &&
      hasText(watchedValues.poolCity) &&
      hasText(watchedValues.poolUf);

    return (
      hasClientData &&
      hasCompanyData &&
      hasBillingAddress &&
      hasPoolAddress
    );
  }, [watchedValues]);

  const copyBillingToPool = () => {
    const v = form.getValues();

    form.setValue("poolCep", v.cep || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("poolStreet", v.street || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("poolNumber", v.number || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("poolDistrict", v.district || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("poolCity", v.city || "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("poolUf", v.uf || "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    setOpenSection("pool");

    toast.message("Localização da piscina copiada do endereço de cobrança");
  };

  const tryFillByCep = async (cepField: "cep" | "poolCep") => {
    const raw = form.getValues(cepField) || "";
    const digits = onlyDigits(raw);

    if (digits.length !== 8) {
      toast.error("CEP deve ter 8 dígitos");
      return;
    }

    try {
      const addr = await fetchViaCep(digits);

      if (!addr) {
        toast.error("CEP não encontrado");
        return;
      }

      if (cepField === "cep") {
        form.setValue("street", addr.street, {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.setValue("district", addr.district, {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.setValue("city", addr.city, {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.setValue("uf", addr.uf, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else {
        form.setValue("poolStreet", addr.street, {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.setValue("poolDistrict", addr.district, {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.setValue("poolCity", addr.city, {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.setValue("poolUf", addr.uf, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      toast.success("Endereço preenchido pelo CEP");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao consultar CEP");
    }
  };

  const onSubmit = (values: Values) =>
    startTransition(async () => {
      try {
        setErrorMessage(null);

        if (!canSubmit) {
          toast.error("Preencha todos os dados obrigatórios antes de salvar.");
          return;
        }

        if (!values.hasCompany) {
          values.companyName = "";
          values.cnpj = "";
        }

        await createClient(values);

        router.push("/clients?created=1");
        router.refresh();
      } catch (e: any) {
        const message = e?.message || "Erro ao salvar cliente";

        setErrorMessage(message);
        toast.error(message);
      }
    });

  const handleCancel = () => {
    form.reset(buildDefaults());
    router.push("/clients");
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <CollapsibleSection
          title="Dados do cliente"
          description="Nome, contato, documento e dados de empresa."
          open={openSection === "client"}
          onOpen={() => setOpenSection("client")}
        >
          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                name="firstName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="lastName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <MaskedInput mask="(99) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="cpf"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <MaskedInput mask="999.999.999-99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <label className="inline-flex select-none items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300"
                checked={!!hasCompany}
                onChange={(e) =>
                  form.setValue("hasCompany", e.target.checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              <span className="text-sm text-neutral-700">
                Cadastrar empresa
              </span>
            </label>

            {hasCompany && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  name="companyName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da empresa</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="cnpj"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <MaskedInput mask="99.999.999/9999-99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </section>
        </CollapsibleSection>

        <CollapsibleSection
          title="Endereço de cobrança e informações úteis"
          description="Endereço principal do cliente e observações internas."
          open={openSection === "billing"}
          onOpen={() => setOpenSection("billing")}
        >
          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <FormField
                name="cep"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <MaskedInput
                        mask="99999-999"
                        {...field}
                        onBlur={async () => {
                          await tryFillByCep("cep");
                        }}
                        onChange={(e) => {
                          field.onChange(e);

                          const digits = onlyDigits(e.target.value);

                          if (digits.length === 8) {
                            tryFillByCep("cep");
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="city"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="uf"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={2}
                        className="text-center sm:max-w-[64px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="district"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-5">
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <FormField
                name="street"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="number"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="notes"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
        </CollapsibleSection>

        <CollapsibleSection
          title="Localização da piscina"
          description="Endereço onde o serviço será realizado."
          open={openSection === "pool"}
          onOpen={() => setOpenSection("pool")}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyBillingToPool}
            >
              Usar o mesmo do endereço de cobrança
            </Button>
          }
        >
          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <FormField
                name="poolCep"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <MaskedInput
                        mask="99999-999"
                        {...field}
                        onBlur={async () => {
                          await tryFillByCep("poolCep");
                        }}
                        onChange={(e) => {
                          field.onChange(e);

                          const digits = onlyDigits(e.target.value);

                          if (digits.length === 8) {
                            tryFillByCep("poolCep");
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="poolCity"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="poolUf"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={2}
                        className="text-center sm:max-w-[64px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="poolDistrict"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-5">
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <FormField
                name="poolStreet"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="poolNumber"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>
        </CollapsibleSection>

        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-slate-300 text-slate-700"
          >
            Voltar
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={pending || !canSubmit}
              className="btn-brand text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Criando..." : "Criar cliente"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

function CollapsibleSection({
  title,
  description,
  open,
  onOpen,
  action,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  onOpen: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-700">
            {open ? "−" : "+"}
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-800">
              {title}
            </span>

            {description && (
              <span className="block truncate text-xs text-slate-500">
                {description}
              </span>
            )}
          </span>
        </button>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {open && <div className="p-4">{children}</div>}
    </section>
  );
}