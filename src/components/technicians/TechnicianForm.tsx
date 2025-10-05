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
} from "@/app/technicians/actions";
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
  firstName: z.string().min(2, "Informe o nome"),
  lastName: z.string().min(2, "Informe o sobrenome"),
  email: z.string().email("Email inválido"),
  role: z.enum(["OWNER", "TECH"]).default("TECH"),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  active: z.boolean().optional(),
});

// ⬅️ use o OUTPUT do schema
type Values = z.infer<typeof schema>;

export default function TechnicianForm({
  id,
  defaultValues,
  trigger = "Novo técnico",
}: {
  id?: string;
  defaultValues?: Partial<Values>;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<Values>({
    // ⬅️ tipar o resolver com <Values, any, Values>
    resolver: zodResolver<Values, any, Values>(schema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      email: defaultValues?.email ?? "",
      role: defaultValues?.role ?? "TECH",
      phone: defaultValues?.phone ?? "",
      cpf: defaultValues?.cpf ?? "",
      active: defaultValues?.active ?? true,
    },
  });

  const isEditing = Boolean(id);
  const isActive = form.watch("active") ?? true;

  const onSubmit: SubmitHandler<Values> = (values: Values) =>
    startTransition(async () => {
      try {
        if (id) {
          await updateTechnician(id, values);
          toast.success("Técnico atualizado");
        } else {
          await createTechnician(values);
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
      if (!id) return;
      try {
        const next = !isActive;
        await updateTechnician(id, { active: next });
        form.setValue("active", next);
        toast.success(next ? "Técnico ativado" : "Técnico inativado");
      } catch (e: any) {
        toast.error(e?.message || "Não foi possível alterar o status");
      }
    });

  const handleDelete = () =>
    startTransition(async () => {
      if (!id) return;
      try {
        await deleteTechnician(id);
        toast.success("Técnico removido");
        setOpen(false);
      } catch (e: any) {
        toast.error(e?.message || "Erro ao remover técnico");
      }
    });

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

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar técnico" : "Novo técnico"}</DialogTitle>
        </DialogHeader>

        {/* ⬅️ usar o genérico ajuda o TS a casar tudo */}
        <Form<Values> {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                name="firstName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input {...field} /></FormControl>
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
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl><MaskedInput mask="(99) 99999-9999" {...field} /></FormControl>
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
                    <FormControl><MaskedInput mask="999.999.999-99" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="role"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <select
                      className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value as Values["role"])}
                    >
                      <option value="TECH">Técnico</option>
                      <option value="OWNER">Administrador</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-700">
              <div><span className="font-medium">Administrador:</span> acesso total ao sistema.</div>
              <div><span className="font-medium">Técnico:</span> acesso aos clientes/visitas atribuídos.</div>
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
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Deseja excluir este técnico? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-blue-600 hover:bg-blue-700 text-white"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isEditing ? "Salvar" : "Criar"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
