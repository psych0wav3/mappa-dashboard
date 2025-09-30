// src/components/technicians/TechnicianTable.tsx
"use client";

import * as React from "react";
import TechnicianForm from "./TechnicianForm";
import TechnicianViewModal from "./TechnicianViewModal";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTechnician } from "@/app/technicians/actions";
import { Eye, Pencil, Trash2 } from "lucide-react";
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

export default function TechnicianTable({ initialData }: { initialData: any[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <div />
        {/* Botão "Novo técnico" em azul */}
        <TechnicianForm
          trigger={
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Novo técnico
            </Button>
          }
        />
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
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {initialData.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.firstName}</td>
                <td className="p-3">{t.lastName}</td>
                <td className="p-3">{t.email}</td>
                <td className="p-3">{t.phone ?? "—"}</td>
                <td className="p-3">{t.cpf ?? "—"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      t.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {t.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    {/* Visualizar */}
                    <TechnicianViewModal
                      technician={t}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                          aria-label="Visualizar técnico"
                          title="Visualizar"
                        >
                          <Eye size={16} />
                        </Button>
                      }
                    />

                    {/* Editar */}
                    <TechnicianForm
                      id={t.id}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                          aria-label="Editar técnico"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </Button>
                      }
                      defaultValues={t}
                    />

                    {/* Excluir (com confirmação) */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 bg-red-500 hover:bg-red-600 text-white"
                          disabled={pending}
                          aria-label="Excluir técnico"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o técnico{" "}
                            <strong>
                              {t.firstName} {t.lastName}
                            </strong>
                            ? Essa ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() =>
                              startTransition(async () => {
                                try {
                                  await deleteTechnician(t.id);
                                  toast.success("Técnico removido");
                                } catch (e: any) {
                                  toast.error(e.message || "Erro ao remover técnico");
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
                <td className="p-6 text-center text-muted-foreground" colSpan={7}>
                  Nenhum técnico cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
