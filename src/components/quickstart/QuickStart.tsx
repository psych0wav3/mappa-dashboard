"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, ExternalLink, SkipForward } from "lucide-react";
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
  subtitulo = "Siga os passos abaixo para colocar o Aqua Check para rodar rapidinho.",
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
    <div className={cn("rounded-xl border bg-white", classe)}>
      {/* Cabeçalho */}
      <div className="border-b px-4 py-3">
        <div className="text-lg font-semibold">Guia Aqua Check</div>
      </div>

      {/* Título + Progresso */}
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-bold text-neutral-800">{titulo}</h1>
        <p className="mt-1 text-neutral-600">{subtitulo}</p>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">Progresso</span>
            <span className="text-neutral-600">{pct}% concluído</span>
          </div>
          <div className="h-2 rounded bg-neutral-100">
            <div
              className="h-2 rounded bg-blue-600 transition-all"
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
                        className="bg-blue-600 hover:bg-blue-700 text-white"
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
  );
}
