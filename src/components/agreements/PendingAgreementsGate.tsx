"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  acceptAgreement,
  listMyAgreements,
  type UserAgreement,
} from "@/app/(private)/settings/agreements/actions";

import InlineErrorState from "@/components/feedback/InlineErrorState";
import { Button } from "@/components/ui/button";

import { getErrorMessage } from "@/lib/mappa/errors";

function GateShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-50 p-4">
      <div className="max-h-[85vh] w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {children}
      </div>
    </div>
  );
}

export default function PendingAgreementsGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pending, setPending] = React.useState<UserAgreement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [accepting, setAccepting] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const items = await listMyAgreements(true);

      setPending(items);
    } catch (error) {
      /*
       * Não assumimos que uma falha na consulta significa
       * que o usuário não possui termos pendentes.
       *
       * Enquanto não conseguirmos confirmar o estado real,
       * o conteúdo privado permanece desmontado.
       */
      setPending([]);

      setLoadError(
        getErrorMessage(
          error,
          "Não foi possível verificar os termos pendentes.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const current = pending[0] ?? null;

  const handleAccept = async () => {
    if (!current) {
      return;
    }

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
        getErrorMessage(
          error,
          "Não foi possível aceitar o termo.",
        ),
      );
    } finally {
      setAccepting(false);
    }
  };

  /*
   * Enquanto a situação dos termos não estiver confirmada,
   * NÃO renderizamos children.
   *
   * Isso evita que páginas privadas sejam montadas e executem
   * efeitos/requests antes de sabermos se o usuário pode seguir.
   */
  if (loading) {
    return (
      <GateShell>
        <div className="grid min-h-[280px] place-items-center px-6 py-8">
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-sky-600" />

            <p className="mt-3 text-sm font-medium text-slate-700">
              Verificando termos pendentes...
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Estamos confirmando se existe algum termo que precisa ser aceito.
            </p>
          </div>
        </div>
      </GateShell>
    );
  }

  if (loadError) {
    return (
      <GateShell>
        <InlineErrorState
          title="Não foi possível verificar os termos"
          message={loadError}
          onRetry={() => void load()}
        />
      </GateShell>
    );
  }

  if (current) {
    return (
      <GateShell>
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Aceite de termos
          </h2>

          <p className="text-sm text-slate-600">
            É necessário aceitar os termos para continuar usando a plataforma.
          </p>
        </div>

        <div className="max-h-[50vh] overflow-y-auto px-6 py-4">
          <h3 className="font-semibold text-slate-900">
            {current.title}
          </h3>

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

          <Button
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? "Salvando..." : "Li e aceito"}
          </Button>
        </div>
      </GateShell>
    );
  }

  return <>{children}</>;
}