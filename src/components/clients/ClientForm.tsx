// src/components/clients/ClientForm.tsx
"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useTransition } from "react";
import { toast } from "sonner";
import { createClient, updateClient } from "@/app/clients/actions";

const schema = z.object({
  firstName: z.string().min(2, "Informe o nome"),
  lastName: z.string().min(2, "Informe o sobrenome"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  uf: z.string().max(2).optional(),
  cep: z.string().optional(),
  poolSize: z.string().optional(),
  cleaningFrequency: z.coerce.number().optional(),
  cleaningWindow: z.string().optional(),
  payDay: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function ClientForm({
  id,
  defaultValues,
  trigger = "Novo cliente",
}: {
  id?: string;
  defaultValues?: Partial<Values>;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      cpf: defaultValues?.cpf ?? "",
      street: defaultValues?.street ?? "",
      number: defaultValues?.number ?? "",
      district: defaultValues?.district ?? "",
      city: defaultValues?.city ?? "",
      uf: defaultValues?.uf ?? "",
      cep: defaultValues?.cep ?? "",
      poolSize: defaultValues?.poolSize ?? "",
      cleaningFrequency: defaultValues?.cleaningFrequency ?? 3,
      cleaningWindow: defaultValues?.cleaningWindow ?? "",
      payDay: defaultValues?.payDay ?? 20,
      notes: defaultValues?.notes ?? "",
    },
  });

  const onSubmit = (values: Values) => {
    startTransition(async () => {
      try {
        if (id) {
          await updateClient(id, values);
          toast.success("Cliente atualizado");
        } else {
          await createClient(values);
          toast.success("Cliente criado");
        }
        setOpen(false);
      } catch (e: any) {
        toast.error(e?.message || "Erro ao salvar cliente");
      }
    });
  };

  const handleCancel = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {typeof trigger === "string" ? (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            {trigger}
          </Button>
        ) : (
          (trigger as React.ReactElement)
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{id ? "Editar cliente" : "Novo cliente"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <FormField
              name="street"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rua</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="number"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="district"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                name="city"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
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
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="cep"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <MaskedInput mask="99999-999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="poolSize"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho da piscina</FormLabel>
                    <FormControl>
                      <Input placeholder="ex.: 8x4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="cleaningFrequency"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodicidade de limpeza (dias)</FormLabel>
                    <FormControl>
                      <select
                        className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
                        value={field.value ?? 3}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="cleaningWindow"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Janela de horário</FormLabel>
                    <FormControl>
                      <Input placeholder="ex.: 8h–12h" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="payDay"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de pagamento</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={31} {...field} />
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
                  <FormLabel>Informações úteis</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              {/* 🔵 Salvar/Criar em azul */}
              <Button
                type="submit"
                disabled={pending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {id ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
