// src/components/clients/ClientTable.tsx
"use client";

import * as React from "react";
import ClientForm from "./ClientForm";
import ClientViewModal from "./ClientViewModal";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteClient } from "@/app/clients/actions";
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

export default function ClientTable({ initialData }: { initialData: any[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <div />
        {/* 🔵 Botão "Novo cliente" em azul */}
        <ClientForm trigger={<Button className="bg-blue-600 hover:bg-blue-700 text-white">Novo cliente</Button>} />
      </div>

      <div className="border rounded-md overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Sobrenome</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Telefone</th>
              <th className="text-left p-3">CPF</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {initialData.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.firstName}</td>
                <td className="p-3">{c.lastName}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.phone ?? "—"}</td>
                <td className="p-3">{c.cpf ?? "—"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <ClientViewModal
                      client={c}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                          title="Visualizar"
                          aria-label="Visualizar cliente"
                        >
                          <Eye size={16} />
                        </Button>
                      }
                    />

                    <ClientForm
                      id={c.id}
                      defaultValues={c}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                          title="Editar"
                          aria-label="Editar cliente"
                        >
                          <Pencil size={16} />
                        </Button>
                      }
                    />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 bg-red-500 hover:bg-red-600 text-white"
                          disabled={pending}
                          title="Excluir"
                          aria-label="Excluir cliente"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Deseja excluir o cliente{" "}
                            <strong>
                              {c.firstName} {c.lastName}
                            </strong>
                            ? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          {/* 🔵 Confirmar azul */}
                          <AlertDialogAction
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() =>
                              startTransition(async () => {
                                try {
                                  await deleteClient(c.id);
                                  toast.success("Cliente removido");
                                } catch (e: any) {
                                  toast.error(e?.message || "Erro ao remover cliente");
                                }
                              })
                            }
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
            {initialData.length === 0 && (
              <tr>
                <td className="p-6 text-center text-neutral-500" colSpan={6}>
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
