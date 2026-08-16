"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, ExternalLink, Rocket, SkipForward } from "lucide-react";
import FormPageHeader from "@/components/form-layout/FormPageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  titulo: string;
  descricao?: string;
  acao?: { label: string; href?: string; onClick?: () => void };
};

type Props = {
  titulo?: string;
  subtitulo?: string;
  storageKey?: string;       // onde salvar o progresso
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

  // carregar progresso
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  // salvar progresso
  React.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(done));
    } catch {}
  }, [done, storageKey]);

  const total = passos.length;
  const concluidos = passos.filter((p) => done[p.id]).length;
  const pct = Math.round((concluidos / Math.max(1, total)) * 100);

  const toggle = (id: string) =>
    setDone((cur) => ({ ...cur, [id]: !cur[id] }));

  return (
    <div className={cn("space-y-5", classe)}>
      <FormPageHeader icon={Rocket} title={titulo} description={subtitulo} />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">Guia Aqua Mappa</div>
        </div>

        {/* Progresso */}
        <div className="px-5 pt-5">
          <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">Progresso</span>
            <span className="text-neutral-600">{pct}% concluído</span>
          </div>
          <div className="h-2 rounded bg-neutral-100">
            <div
              className="h-2 rounded btn-brand transition-all"
              style={{ width: `${pct}%` }}
              aria-label={`Progresso: ${pct}%`}
            />
          </div>
        </div>
      </div>

      {/* Lista de passos */}
      <ol className="px-4 py-6 space-y-4">
        {passos.map((p, i) => {
          const feito = !!done[p.id];
          return (
            <li
              key={p.id}
              className={cn(
                "rounded-lg border px-4 py-3",
                feito ? "bg-blue-50/40 border-blue-200" : "bg-white"
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  aria-label={feito ? "Desmarcar passo" : "Marcar como concluído"}
                  className={cn(
                    "mt-0.5 rounded-full",
                    feito ? "text-blue-600" : "text-neutral-400 hover:text-neutral-600"
                  )}
                  onClick={() => toggle(p.id)}
                >
                  {feito ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700">
                      {i + 1}
                    </span>
                    <h3 className="font-medium text-neutral-900">{p.titulo}</h3>
                  </div>

                  {p.descricao && (
                    <p className="mt-1 text-sm text-neutral-600">{p.descricao}</p>
                  )}

                  {p.acao && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="btn-brand hover:bg-blue-700 text-white"
                        onClick={() => {
                          if (p.acao?.onClick) p.acao.onClick();
                          if (p.acao?.href) router.push(p.acao.href);
                        }}
                      >
                        {p.acao.label}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>

                      {/* botão pular/mark complete */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggle(p.id)}
                      >
                        {feito ? "Desmarcar" : "Marcar como concluído"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Rodapé */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="text-sm text-neutral-600">
            {concluidos} de {total} passos concluídos
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              // marcar todos como concluídos rapidamente
              setDone(Object.fromEntries(passos.map((p) => [p.id, true])));
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
