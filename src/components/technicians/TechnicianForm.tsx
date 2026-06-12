"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { AlertTriangle, Trash2, UserCheck, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type TechDefaults = Partial<{
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  active: boolean;
}>;

function getFullName(defaultValues?: TechDefaults) {
  return (
    defaultValues?.name ??
    `${defaultValues?.firstName ?? ""} ${defaultValues?.lastName ?? ""}`.trim()
  );
}

export default function TechnicianForm({
  id,
  defaultValues,
  trigger = "Novo Técnico",
  onDeactivate,
  onReactivate,
  onDelete,
}: {
  id?: string;
  defaultValues?: TechDefaults;
  trigger?: React.ReactNode;
  onDeactivate?: () => void;
  onReactivate?: () => void;
  onDelete?: () => Promise<void> | void;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();

  const isEditing = Boolean(id);
  const isActive = defaultValues?.active !== false;

  const name = getFullName(defaultValues);
  const email = defaultValues?.email ?? "";
  const phone = defaultValues?.phone ?? "";
  const cpf = defaultValues?.cpf ?? "";

  function handleDeactivate() {
    if (!onDeactivate) return;

    onDeactivate();
    setOpen(false);
  }

  function handleReactivate() {
    if (!onReactivate) return;

    onReactivate();
    setOpen(false);
  }

  function handleDelete() {
    if (!onDelete) return;

    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este técnico definitivamente? Essa ação não poderá ser desfeita.",
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await onDelete();
        setOpen(false);
      } catch (error: any) {
        toast.error(error?.message || "Erro ao excluir técnico.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Nome completo
              </label>

              <Input value={name || "—"} readOnly />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>

              <Input value={email || "—"} readOnly />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Telefone
              </label>

              <Input value={phone || "—"} readOnly />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                CPF
              </label>

              <Input value={cpf || "—"} readOnly />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Status
              </label>

              <Input value={isActive ? "Ativo" : "Inativo"} readOnly />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Cargo
              </label>

              <Input value="Técnico" readOnly />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {isActive ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={handleDeactivate}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Inativar técnico
                </Button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    onClick={handleReactivate}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Reativar
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={pending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {pending ? "Excluindo..." : "Excluir definitivamente"}
                  </Button>
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}