"use client";

import {
  ClipboardList,
  X,
} from "lucide-react";

export default function WorkOrderDetailsHeader({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold tracking-tight text-slate-950">
              Detalhes da ordem de serviço
            </h2>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              Consulte os dados, itens, valores e situação da ordem.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes da ordem"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}