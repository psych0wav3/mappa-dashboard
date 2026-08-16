"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Loader2,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

import type { Client } from "@/app/(private)/clients/actions";

import { Button } from "@/components/ui/button";

type ClientDetailsFooterProps = {
  client: Client;
  loading: boolean;
  savingAddress: boolean;
  deleting: boolean;
  canDeactivate: boolean;
  canReactivate: boolean;
  onDeactivate: () => void;
  onReactivate: () => void;
  onDelete: () => void;
};

export default function ClientDetailsFooter({
  client,
  loading,
  savingAddress,
  deleting,
  canDeactivate,
  canReactivate,
  onDeactivate,
  onReactivate,
  onDelete,
}: ClientDetailsFooterProps) {
  const busy =
    savingAddress ||
    deleting;

  return (
    <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-8">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {client.active ? (
            <Button type="button" variant="outline" className="w-full rounded-xl border-amber-300 px-4 text-amber-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 sm:w-auto" onClick={onDeactivate} disabled={busy || loading || !canDeactivate}>
              <UserX className="mr-2 h-4 w-4" />
              Inativar cliente
            </Button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="rounded-xl border-emerald-300 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800" onClick={onReactivate} disabled={busy || loading || !canReactivate}>
                <UserCheck className="mr-2 h-4 w-4" />
                Reativar cliente
              </Button>

              <Button type="button" variant="outline" className="rounded-xl border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50 hover:text-red-800" onClick={onDelete} disabled={deleting || savingAddress || loading}>
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}

                {deleting
                  ? "Excluindo..."
                  : "Excluir definitivamente"}
              </Button>
            </div>
          )}
        </div>

        <DialogPrimitive.Close asChild>
          <Button type="button" variant="outline" className="rounded-xl px-6" disabled={busy}>
            Fechar
          </Button>
        </DialogPrimitive.Close>
      </div>
    </footer>
  );
}