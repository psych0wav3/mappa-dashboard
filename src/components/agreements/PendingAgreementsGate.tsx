"use client";

import * as React from "react";
import { toast } from "sonner";
import { acceptAgreement, listMyAgreements, type UserAgreement } from "@/app/(private)/settings/agreements/actions";
import { Button } from "@/components/ui/button";

export default function PendingAgreementsGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pending, setPending] = React.useState<UserAgreement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [accepting, setAccepting] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const items = await listMyAgreements(true);
      setPending(items);
    } catch {
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const current = pending[0] ?? null;

  const handleAccept = async () => {
    if (!current) return;

    try {
      setAccepting(true);
      await acceptAgreement(current.id);
      const rest = pending.slice(1);
      setPending(rest);
      if (rest.length === 0) {
        toast.success("Termos aceitos.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível aceitar o termo.",
      );
    } finally {
      setAccepting(false);
    }
  };

  return (
    <>
      {children}
      {!loading && current ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[85vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Aceite de termos
              </h2>
              <p className="text-sm text-slate-600">
                É necessário aceitar os termos para continuar usando a
                plataforma.
              </p>
            </div>
            <div className="max-h-[50vh] overflow-y-auto px-6 py-4">
              <h3 className="font-semibold text-slate-900">{current.title}</h3>
              <p className="mt-1 text-xs text-slate-500">
                Versão {current.version}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                {current.content}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
              <span className="text-xs text-slate-500">
                {pending.length} pendente(s)
              </span>
              <Button onClick={handleAccept} disabled={accepting}>
                {accepting ? "Salvando..." : "Li e aceito"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
