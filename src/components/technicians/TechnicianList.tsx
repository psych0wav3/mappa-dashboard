"use client";

import {
  Pencil,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import TechnicianForm from "./TechnicianForm";

import type {
  Technician,
} from "./technician.types";

import {
  getTechnicianInitials,
  getTechnicianName,
} from "./technician.utils";

type TechnicianListProps = {
  technicians: Technician[];
  onDeactivate: (
    id: string,
  ) => Promise<boolean>;
  onReactivate: (
    id: string,
  ) => Promise<boolean>;
  onDelete: (
    id: string,
  ) => Promise<boolean>;
};

export default function TechnicianList({
  technicians,
  onDeactivate,
  onReactivate,
  onDelete,
}: TechnicianListProps) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Técnico
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contato
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cargo
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {technicians.map((technician) => (
              <tr key={technician.id} className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-xs font-bold text-sky-700">
                      {getTechnicianInitials(technician)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {getTechnicianName(technician) || "—"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Profissional de campo
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <p className="font-medium text-slate-700">
                    {technician.email}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {technician.phone || "Telefone não informado"}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${technician.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                    {technician.active ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {technician.role === "OWNER" ? "Administrador" : "Técnico"}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end">
                    <TechnicianForm id={technician.id} defaultValues={technician} onDeactivate={() => onDeactivate(technician.id)} onReactivate={() => onReactivate(technician.id)} onDelete={() => onDelete(technician.id)} trigger={
                      <Button type="button" variant="outline" size="sm" className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700" title="Visualizar técnico" aria-label="Visualizar técnico">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    } />
                  </div>
                </td>
              </tr>
            ))}

            {technicians.length === 0 ? (
              <tr>
                <td className="px-6 py-14 text-center" colSpan={5}>
                  <UserRound className="mx-auto h-9 w-9 text-slate-300" />

                  <h3 className="mt-3 text-sm font-semibold text-slate-700">
                    Nenhum técnico encontrado
                  </h3>

                  <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                    Não existem profissionais nesta categoria ou nenhum resultado corresponde à sua busca.
                  </p>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}