"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  createTechnician,
  updateTechnician,
  toggleTechnicianActive,
} from "@/app/technicians/actions";
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
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/MaskedInput";
import { toast } from "sonner";

const schema = z.object({
  firstName: z.string().min(2, "Informe o primeiro nome"),
  lastName: z.string().min(2, "Informe o sobrenome"),
  email: z.string().email("Informe um email válido"),
  phone: z.string().optional().or(z.literal("")),
  cpf: z.string().optional().or(z.literal("")),
  role: z.enum(["OWNER", "TECH"]).default("TECH"),
});

type TechnicianFormInput = z.input<typeof schema>;
type TechnicianFormOutput = z.output<typeof schema>;

export default function TechnicianForm({
  defaultValues,
  trigger = "Novo técnico",
  id,
}: {
  id?: string;
  defaultValues?: Partial<TechnicianFormInput & { active?: boolean }>;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<TechnicianFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName:  defaultValues?.lastName  ?? "",
      email:     defaultValues?.email     ?? "",
      phone:     defaultValues?.phone     ?? "",
      cpf:       defaultValues?.cpf       ?? "",
      role:      (defaultValues?.role as "OWNER" | "TECH") ?? "TECH",
    },
  });

  const isEditing = Boolean(id);
  const isActive  = defaultValues?.active !== false;

  const onSubmit = (rawValues: TechnicianFormInput) =>
    startTransition(async () => {
      try {
        const values: TechnicianFormOutput = schema.parse(rawValues);

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

  const toggleActive = () =>
    id &&
    startTransition(async () => {
      try {
        await toggleTechnicianActive(id, !isActive);
        toast.success(isActive ? "Técnico inativado" : "Técnico ativado");
        setOpen(false);
      } catch (e: any) {
        toast.error(e?.message || "Falha ao alterar status");
      }
    });

  const remove = () => {
    toast.message("Excluir: abrir confirmação aqui.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {typeof trigger === "string" ? <Button>{trigger}</Button> : (trigger as React.ReactElement)}
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar técnico" : "Novo técnico"}</DialogTitle>
        </DialogHeader>

        {/* Agora Form aceita generics corretamente */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                      className="h-10 w-full rounded-md border border-neutral-300 px-2 text-sm"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="TECH">Técnico</option>
                      <option value="OWNER">Administrador</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md border bg-neutral-50 p-3 text-sm leading-relaxed">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="font-medium">Administrador</div>
                  <p className="text-neutral-600">
                    Acesso total ao sistema: pode ver e editar rotas, clientes, técnicos e configurações.
                  </p>
                </div>
                <div>
                  <div className="font-medium">Técnico</div>
                  <p className="text-neutral-600">
                    Vê apenas sua própria rota e registra serviços no app.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={isActive ? "border-orange-500 text-orange-600" : "border-green-600 text-green-700"}
                    disabled={pending}
                    onClick={toggleActive}
                  >
                    {isActive ? "Inativar" : "Ativar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-500 text-red-600"
                    disabled={pending}
                    onClick={remove}
                  >
                    Excluir
                  </Button>
                </div>
              ) : <span />}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
                <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700 text-white">
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
