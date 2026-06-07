"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";

import { createTechnician } from "@/app/(private)/technicians/actions";
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
import { MaskedInput } from "@/components/ui/MaskedInput";

const schema = z.object({
  name: z.string().min(2, "Informe o nome completo"),
  email: z.string().email("Email inválido"),
  password: z.string().optional(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

function buildDefaults(defaultValues?: Partial<{
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
}>): Values {
  const fullName =
    defaultValues?.name ??
    `${defaultValues?.firstName ?? ""} ${defaultValues?.lastName ?? ""}`.trim();

  return {
    name: fullName,
    email: defaultValues?.email ?? "",
    password: "123456",
    phone: defaultValues?.phone ?? "",
    active: defaultValues?.active ?? true,
  };
}

export default function TechnicianForm({
  id,
  defaultValues,
  trigger = "Novo Técnico",
}: {
  id?: string;
  defaultValues?: Partial<{
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    phone: string | null;
    active: boolean;
  }>;
  trigger?: React.ReactNode;
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

  React.useEffect(() => {
    form.reset(defaults);
  }, [id, defaults, form]);

  const onSubmit: SubmitHandler<Values> = (values) =>
    startTransition(async () => {
      try {
        if (isEditing) {
          toast.error("Edição de técnico ainda não está disponível na API.");
          return;
        }

        if (!values.password || values.password.trim().length < 6) {
          form.setError("password", {
            message: "Informe uma senha com pelo menos 6 caracteres",
          });
          return;
        }

        await createTechnician({
          name: values.name,
          email: values.email,
          password: values.password,
          phone: values.phone,
        });

        toast.success("Técnico criado");
        form.reset(buildDefaults({}));
        setOpen(false);
      } catch (e: any) {
        toast.error(e?.message || "Erro ao salvar técnico");
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

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Visualizar técnico" : "Novo Técnico"}
          </DialogTitle>
        </DialogHeader>

        {isEditing && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            A edição, inativação e exclusão de técnicos ainda dependem de rotas
            no backend. Por enquanto, os dados ficam apenas para visualização.
          </div>
        )}

        <Form<Values> {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={inputDisabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {!isEditing && (
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha inicial</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            {!isEditing && (
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-700">
                O cadastro será enviado para a API do Aqua Mappa como
                funcionário da empresa.
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2">
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
                  {isEditing ? "Fechar" : "Cancelar"}
                </Button>

                {!isEditing && (
                  <Button
                    type="submit"
                    disabled={pending}
                    className="btn-brand text-white"
                  >
                    {pending ? "Criando..." : "Criar"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}