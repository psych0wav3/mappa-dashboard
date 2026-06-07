"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";

import { createClient } from "@/app/(private)/clients/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const schema = z.object({
  // pessoa
  firstName: z.string().min(2, "Informe o nome"),
  lastName: z.string().min(2, "Informe o sobrenome"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  cpf: z.string().optional(),

  // empresa
  hasCompany: z.boolean().optional(),
  companyName: z.string().optional(),
  cnpj: z.string().optional(),

  // endereço de cobrança
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  uf: z.string().max(2).optional(),

  // informações úteis
  notes: z.string().optional(),

  // localização da piscina
  poolCep: z.string().optional(),
  poolStreet: z.string().optional(),
  poolNumber: z.string().optional(),
  poolDistrict: z.string().optional(),
  poolCity: z.string().optional(),
  poolUf: z.string().max(2).optional(),

  // futuro: atribuição de rota
  technicianId: z.string().optional(),
  days: z
    .array(z.enum(["dom", "seg", "ter", "qua", "qui", "sex", "sab"]))
    .optional(),

  active: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

type TechnicianOpt = {
  id: string;
  name: string;
};

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

function buildDefaults(src?: Partial<Values>): Values {
  return {
    firstName: src?.firstName ?? "",
    lastName: src?.lastName ?? "",
    email: src?.email ?? "",
    phone: src?.phone ?? "",
    cpf: src?.cpf ?? "",

    hasCompany: Boolean(src?.companyName || src?.cnpj),
    companyName: src?.companyName ?? "",
    cnpj: src?.cnpj ?? "",

    cep: src?.cep ?? "",
    street: src?.street ?? "",
    number: src?.number ?? "",
    district: src?.district ?? "",
    city: src?.city ?? "",
    uf: src?.uf ?? "",

    notes: src?.notes ?? "",

    poolCep: src?.poolCep ?? "",
    poolStreet: src?.poolStreet ?? "",
    poolNumber: src?.poolNumber ?? "",
    poolDistrict: src?.poolDistrict ?? "",
    poolCity: src?.poolCity ?? "",
    poolUf: src?.poolUf ?? "",

    technicianId: src?.technicianId ?? "",
    days: src?.days ?? [],

    active: src?.active ?? true,
  };
}

export default function ClientForm({
  id,
  defaultValues,
  trigger = "Novo cliente",
  technicians = [],
}: {
  id?: string;
  defaultValues?: Partial<Values>;
  trigger?: React.ReactNode;
  technicians?: TechnicianOpt[];
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();

  const isEditing = Boolean(id);

  const defaults = React.useMemo(
    () => buildDefaults(defaultValues),
    [defaultValues],
  );

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const hasCompany = form.watch("hasCompany");

  React.useEffect(() => {
    form.reset(defaults);
  }, [id, defaults, form]);

  const copyBillingToPool = () => {
    if (isEditing) {
      toast.message("Edição de cliente ainda não está disponível na API.");
      return;
    }

    const v = form.getValues();

    form.setValue("poolCep", v.cep || "");
    form.setValue("poolStreet", v.street || "");
    form.setValue("poolNumber", v.number || "");
    form.setValue("poolDistrict", v.district || "");
    form.setValue("poolCity", v.city || "");
    form.setValue("poolUf", v.uf || "");

    toast.message("Localização da piscina copiada do endereço de cobrança");
  };

  const tryFillByCep = async (cepField: "cep" | "poolCep") => {
    if (isEditing) {
      return;
    }

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
        form.setValue("street", addr.street);
        form.setValue("district", addr.district);
        form.setValue("city", addr.city);
        form.setValue("uf", addr.uf);
      } else {
        form.setValue("poolStreet", addr.street);
        form.setValue("poolDistrict", addr.district);
        form.setValue("poolCity", addr.city);
        form.setValue("poolUf", addr.uf);
      }

      toast.success("Endereço preenchido pelo CEP");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao consultar CEP");
    }
  };

  const onSubmit = (values: Values) =>
    startTransition(async () => {
      try {
        if (isEditing) {
          toast.error("Edição de cliente ainda não está disponível na API.");
          return;
        }

        if (!values.hasCompany) {
          values.companyName = "";
          values.cnpj = "";
        }

        await createClient(values);

        toast.success("Cliente criado");
        form.reset(buildDefaults({}));
        setOpen(false);
      } catch (e: any) {
        toast.error(e?.message || "Erro ao salvar cliente");
      }
    });

  const handleCancel = () => {
    form.reset(isEditing ? defaults : buildDefaults({}));
    setOpen(false);
  };

  const inputDisabled = isEditing;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (next) {
          form.reset(isEditing ? defaults : buildDefaults({}));
        }
      }}
    >
      <DialogTrigger asChild>
        {typeof trigger === "string" ? (
          <Button className="btn-brand text-white">{trigger}</Button>
        ) : (
          (trigger as React.ReactElement)
        )}
      </DialogTrigger>

      <DialogContent
        className={`
          fixed right-0 top-[24px] bottom-[32px] z-[200] m-0
          h-[calc(100dvh-96px)] w-screen max-w-none rounded-lg p-0 overflow-hidden
          lg:w-[50vw] lg:left-auto
          data-[state=open]:animate-none
        `}
      >
        <div className="flex h-full flex-col bg-white">
          <div className="sticky top-0 z-10 border-b bg-white px-4 py-3 sm:px-6">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Visualizar cliente" : "Novo cliente"}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-28">
            {isEditing && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                A edição, inativação e exclusão de clientes ainda dependem de
                rotas no backend. Por enquanto, os dados ficam apenas para
                visualização.
              </div>
            )}

            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <section className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      name="firstName"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={inputDisabled} />
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
                            <Input {...field} disabled={inputDisabled} />
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
                      disabled={inputDisabled}
                      onChange={(e) =>
                        form.setValue("hasCompany", e.target.checked)
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
                              <Input {...field} disabled={inputDisabled} />
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
                              <MaskedInput
                                mask="99.999.999/9999-99"
                                {...field}
                                disabled={inputDisabled}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            disabled={inputDisabled}
                          />
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
                            <MaskedInput
                              mask="(99) 99999-9999"
                              {...field}
                              disabled={inputDisabled}
                            />
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
                            <MaskedInput
                              mask="999.999.999-99"
                              {...field}
                              disabled={inputDisabled}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <SectionTitle>ENDEREÇO DE COBRANÇA</SectionTitle>

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
                              disabled={inputDisabled}
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
                            <Input {...field} disabled={inputDisabled} />
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
                              disabled={inputDisabled}
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
                            <Input {...field} disabled={inputDisabled} />
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
                            <Input {...field} disabled={inputDisabled} />
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
                            <Input {...field} disabled={inputDisabled} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <SectionTitle>INFORMAÇÕES ÚTEIS</SectionTitle>

                <FormField
                  name="notes"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          {...field}
                          disabled={inputDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <SectionTitle>LOCALIZAÇÃO DA PISCINA</SectionTitle>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyBillingToPool}
                    disabled={inputDisabled}
                  >
                    Usar o mesmo do endereço de cobrança
                  </Button>
                </div>

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
                              disabled={inputDisabled}
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
                            <Input {...field} disabled={inputDisabled} />
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
                              disabled={inputDisabled}
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
                            <Input {...field} disabled={inputDisabled} />
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
                            <Input {...field} disabled={inputDisabled} />
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
                            <Input {...field} disabled={inputDisabled} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              </form>
            </Form>
          </div>

          <div className="sticky bottom-0 z-20 border-t bg-white px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              {isEditing ? (
                <div className="text-xs text-neutral-500">
                  Edição, inativação e exclusão serão liberadas quando a API
                  tiver essas rotas.
                </div>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Fechar
                </Button>

                {!isEditing && (
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={pending}
                    className="btn-brand text-white"
                  >
                    {pending ? "Criando..." : "Criar"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-1">
      <div className="text-sm font-medium text-neutral-800">{children}</div>
      <div className="mt-1 h-px w-full bg-neutral-200" />
    </div>
  );
}