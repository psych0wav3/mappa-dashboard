// src/components/visits/VisitPlanTable.tsx
"use client";

import * as React from "react";
import VisitPlanForm from "./VisitPlanForm";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useTransition } from "react";
import { deleteVisitPlan } from "@/app/(private)/visits/actions";
import { Eye, Pencil, Trash2 } from "lucide-react";

function windowLabel(s: number, e: number) {
  return `${String(s).padStart(2,"0")}:00–${String(e).padStart(2,"0")}:00`;
}
const WD = ["","Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

export default function VisitPlanTable({
  initialData,
  technicians,
  clients,
}: {
  initialData: any[];
  technicians: { id: string; firstName: string; lastName: string }[];
  clients: { id: string; firstName: string; lastName: string; street?: string; number?: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <div />
        <VisitPlanForm trigger="Nova visita" technicians={technicians} clients={clients} />
      </div>

      <div className="grid gap-3">
        {initialData.map((p) => (
          <div key={p.id} className="rounded-lg border p-4 flex items-start justify-between">
            <div>
              <div className="font-medium">
                {p.client.firstName} {p.client.lastName}
              </div>
              <div className="text-sm text-neutral-600">
                {p.client.street ?? ""}{p.client.number ? `, ${p.client.number}` : ""}
              </div>
              <div className="mt-1 text-sm">
                Janela: <strong>{windowLabel(p.windowStart, p.windowEnd)}</strong> • Dias:{" "}
                <strong>{p.weekdays.map((d: number) => WD[d]).join(", ")}</strong>
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Técnico: {p.technician.firstName} {p.technician.lastName}
              </div>
            </div>

            <div className="flex gap-2">
              {/* Visualizar simples (reusa o form em modo read-only no futuro; por ora apenas Eye sem ação) */}
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 text-white" title="Ver">
                <Eye size={16} />
              </Button>

              <VisitPlanForm
                id={p.id}
                defaultValues={{
                  technicianId: p.technicianId,
                  clientId: p.clientId,
                  weekdays: p.weekdays,
                  windowStart: p.windowStart,
                  windowEnd: p.windowEnd,
                  notes: p.notes ?? "",
                }}
                technicians={technicians}
                clients={clients}
                trigger={
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-orange-500 hover:bg-orange-600 text-white" title="Editar">
                    <Pencil size={16} />
                  </Button>
                }
              />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-red-500 hover:bg-red-600 text-white" disabled={pending} title="Excluir">
                    <Trash2 size={16} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir visita</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir a visita de <strong>{p.client.firstName} {p.client.lastName}</strong>?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        startTransition(async () => {
                          try {
                            await deleteVisitPlan(p.id);
                            toast.success("Visita removida");
                          } catch (e: any) {
                            toast.error(e?.message || "Erro ao remover visita");
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
          </div>
        ))}

        {initialData.length === 0 && (
          <div className="p-6 text-center text-neutral-500 border rounded-lg">
            Nenhuma visita cadastrada.
          </div>
        )}
      </div>
    </div>
  );
}
