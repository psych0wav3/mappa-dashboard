"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
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
import { MaskedInput } from "@/components/ui/MaskedInput";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  createTechnician,
  updateTechnician,
  deleteTechnician,
} from "@/app/(private)/technicians/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const schema = z.object({
  name: z.string().min(2, "Informe o nome completo"),
  email: z.string().email("Email inválido"),
  password: z.string().optional(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

export default function TechnicianForm({
  id,
  defaultValues,
  trigger = "Novo Técnico",
}: {
  id?: string;
  defaultValues?: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    active: boolean;
  }>;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();

  const isEditing = Boolean(id);

  const fullName = `${defaultValues?.firstName ?? ""} ${
    defaultValues?.lastName ?? ""
  }`.trim();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: fullName,
      email: defaultValues?.email ?? "",
      password: "123456",
      phone: defaultValues?.phone ?? "",
      active: defaultValues?.active ?? true,
    },
  });

  const isActive = form.watch("active") ?? true;

  const onSubmit: SubmitHandler<Values> = (values) =>
    startTransition(async () => {
      try {
        if (id) {
          await updateTechnician();
          toast.success("Técnico atualizado");
        } else {
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
        }

        setOpen(false);
      } catch (e: any) {
        toast.error(e?.message || "Erro ao salvar técnico");
      }
    });

  const handleCancel = () => {
    form.reset();
    setOpen(false);
  };

  const handleToggleActive = () =>
    startTransition(async () => {
      try {
        await updateTechnician();
        toast.error("Ativar/Inativar ainda não existe na API.");
      } catch (e: any) {
        toast.error(e?.message || "Não foi possível alterar o status");
      }
    });

  const handleDelete = () =>
    startTransition(async () => {
      try {
        await deleteTechnician();
      } catch (e: any) {
        toast.error(e?.message || "Erro ao remover técnico");
      }
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {typeof trigger === "string" ? (
          <Button className="btn-brand text-white">{trigger}</Button>
        ) : (
          trigger as React.ReactElement
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Técnico" : "Novo Técnico"}
          </DialogTitle>
        </DialogHeader>

        <Form<Values> {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input type="email" {...field} />
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
                    <MaskedInput mask="(99) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-700">
              O cadastro será enviado para a API do Aqua Mappa como funcionário
              da empresa.
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-neutral-400 text-neutral-700"
                    onClick={handleToggleActive}
                    disabled={pending}
                  >
                    {isActive ? "Inativar" : "Ativar"}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-500 text-red-600"
                        disabled={pending}
                      >
                        Excluir
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirmar exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Deseja excluir este técnico? Esta ação não pode ser
                          desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="btn-brand text-white"
                          onClick={handleDelete}
                        >
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={pending}
                  className="btn-brand text-white"
                >
                  {pending ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}