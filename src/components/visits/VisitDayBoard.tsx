// src/components/visits/VisitDayBoard.tsx
"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

import VisitPlanForm from "./VisitPlanForm";
import { deleteVisitPlan } from "@/app/(private)/visits/actions";

function windowLabel(s: number, e: number) {
  return `${String(s).padStart(2, "0")}:00–${String(e).padStart(2, "0")}:00`;
}

export default function VisitDayBoard({
  plans,
  technicians,
  clients,
  selectedTechId,
}: {
  plans: any[];
  technicians: { id: string; firstName: string; lastName: string }[];
  clients: {
    id: string;
    firstName: string;
    lastName: string;
    street?: string | null; // <- aceita null
    number?: string | null; // <- aceita null
  }[];
  selectedTechId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const grouped = selectedTechId
    ? { [selectedTechId]: plans }
    : groupBy(plans, (p) => p.technicianId);

  if (plans.length === 0) {
    return (
      <div className="p-6 text-center text-neutral-500 border rounded-lg">
        Nenhuma visita para este dia.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([techId, items]) => {
        const t = (items as any)[0]?.technician;
        return (
          <div key={techId} className="space-y-2">
            <div className="text-sm font-semibold text-neutral-700">
              Técnico: {t?.firstName} {t?.lastName}
            </div>

            <div className="grid gap-3">
              {(items as any[]).map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border p-4 flex items-start justify-between"
                >
                  <div>
                    <div className="font-medium">
                      {p.client.firstName} {p.client.lastName}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {p.client.street ?? ""}
                      {p.client.number ? `, ${p.client.number}` : ""}
                    </div>
                    <div className="mt-1 text-sm">
                      Janela:{" "}
                      <strong>{windowLabel(p.windowStart, p.windowEnd)}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 btn-brand text-white"
                      title="Ver"
                    >
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                          title="Editar"
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
                        >
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir visita</AlertDialogTitle>
                          <AlertDialogDescription>
                            Excluir o plano de visita de{" "}
                            <strong>
                              {p.client.firstName} {p.client.lastName}
                            </strong>
                            ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="btn-brand text-white"
                            onClick={() =>
                              startTransition(async () => {
                                try {
                                  await deleteVisitPlan(p.id);
                                  toast.success("Visita excluída.");
                                  router.refresh();
                                } catch (e: any) {
                                  toast.error(
                                    e?.message ?? "Falha ao excluir a visita."
                                  );
                                }
                              })
                            }
                          >
                            {pending ? "Excluindo..." : "Confirmar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function groupBy<T>(arr: T[], key: (x: T) => string) {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item as any);
    (acc[k] = acc[k] || []).push(item as any);
    return acc;
  }, {});
}
