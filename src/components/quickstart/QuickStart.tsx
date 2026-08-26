"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Rocket,
  SkipForward,
} from "lucide-react";

import FormPageHeader from "@/components/form-layout/FormPageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  titulo: string;
  descricao?: string;
  acao?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
};

type Props = {
  titulo?: string;
  subtitulo?: string;
  storageKey?: string;
  passos: Step[];
  classe?: string;
};

export default function QuickStart({
  titulo = "Bem-vindo(a)! Vamos começar",
  subtitulo = "Siga os passos abaixo para colocar o Aqua Mappa para rodar rapidinho.",
  storageKey = "quickstart:aquacheck",
  passos,
  classe,
}: Props) {
  const router = useRouter();
  const [done, setDone] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);

      if (raw) {
        setDone(JSON.parse(raw));
      }
    } catch {}
  }, [storageKey]);

  React.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(done));
    } catch {}
  }, [done, storageKey]);

  const total = passos.length;
  const concluidos = passos.filter((passo) => done[passo.id]).length;
  const pct = Math.round((concluidos / Math.max(1, total)) * 100);

  const toggle = (id: string) => {
    setDone((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  return (
    <div className={cn("min-w-0 space-y-4 sm:space-y-5", classe)}>
      <FormPageHeader icon={Rocket} title={titulo} description={subtitulo} />

      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="text-sm font-semibold text-slate-900">
            Guia Aqua Mappa
          </div>
        </div>

        <div className="px-4 pt-5 sm:px-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium text-slate-800">Progresso</span>
            <span className="text-xs text-neutral-600 sm:text-sm">
              {pct}% concluído
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="btn-brand h-2 rounded-full transition-all"
              style={{ width: `${pct}%` }}
              aria-label={`Progresso: ${pct}%`}
            />
          </div>
        </div>

        <ol className="space-y-3 px-3 py-5 sm:space-y-4 sm:px-4 sm:py-6">
          {passos.map((passo, index) => {
            const feito = !!done[passo.id];

            return (
              <li
                key={passo.id}
                className={cn(
                  "min-w-0 rounded-xl border px-3 py-3 sm:px-4",
                  feito
                    ? "border-blue-200 bg-blue-50/40"
                    : "border-slate-200 bg-white",
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    type="button"
                    aria-label={
                      feito ? "Desmarcar passo" : "Marcar como concluído"
                    }
                    className={cn(
                      "mt-0.5 shrink-0 rounded-full transition",
                      feito
                        ? "text-blue-600"
                        : "text-neutral-400 hover:text-neutral-600",
                    )}
                    onClick={() => toggle(passo.id)}
                  >
                    {feito ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700">
                        {index + 1}
                      </span>

                      <h3 className="min-w-0 break-words text-sm font-semibold leading-6 text-neutral-900 sm:text-base">
                        {passo.titulo}
                      </h3>
                    </div>

                    {passo.descricao ? (
                      <p className="mt-1.5 break-words text-xs leading-5 text-neutral-600 sm:text-sm sm:leading-6">
                        {passo.descricao}
                      </p>
                    ) : null}

                    {passo.acao ? (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <Button
                          size="sm"
                          className="btn-brand w-full justify-center text-white sm:w-auto"
                          onClick={() => {
                            if (passo.acao?.onClick) {
                              passo.acao.onClick();
                            }

                            if (passo.acao?.href) {
                              router.push(passo.acao.href);
                            }
                          }}
                        >
                          <span className="truncate">{passo.acao.label}</span>
                          <ExternalLink className="ml-2 h-4 w-4 shrink-0" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-center sm:w-auto"
                          onClick={() => toggle(passo.id)}
                        >
                          {feito ? "Desmarcar" : "Marcar como concluído"}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center text-xs text-neutral-600 sm:text-left sm:text-sm">
            {concluidos} de {total} passos concluídos
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 sm:w-auto"
            onClick={() => {
              setDone(
                Object.fromEntries(passos.map((passo) => [passo.id, true])),
              );
            }}
          >
            <SkipForward className="h-4 w-4" />
            Pular onboarding
          </Button>
        </div>
      </div>
    </div>
  );
}
