// components/site/BackofficeFeatureTable.tsx
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Dados ---------- */
type FeatureRow = { name: string; desc: string };
type Group = { id: string; title: string; rows: FeatureRow[] };

const GROUPS: Group[] = [
  {
    id: "work",
    title: "Gestão de Trabalho",
    rows: [
      { name: "Agenda", desc: "Calendário semanal com arrastar-e-soltar, reagendamentos em massa e visão por técnico." },
      { name: "Construtor de Rotas", desc: "Monte rotas rapidamente, compare cenários e distribua clientes por técnico." },
      { name: "Otimização de Rotas", desc: "Sugestão de melhor ordem de visita dentro da rota considerando distância/tempo." },
      { name: "Painel de Rotas", desc: "Acompanhe progresso do dia, atrasos, bloqueios e mudanças em tempo real." },
      { name: "Serviços/Obras (em breve)", desc: "Ordem de serviço com etapas, responsáveis, materiais/horas e fotos por etapa." },
      { name: "Checklists", desc: "Checklist por tipo de visita/cliente, com campos obrigatórios, leituras e fotos." },
      { name: "Etiquetas e Prioridades", desc: "Classifique por janelas de atendimento, criticidade e tags personalizadas." },
      { name: "Integrações LaMotte / LSI (em breve)", desc: "Leituras e dosagens com cálculo LSI e recomendações, registradas na visita." },
    ],
  },
  {
    id: "billing",
    title: "Cobrança & Faturamento",
    rows: [
      { name: "Cobrança por visita/recorrência", desc: "Gere cobranças automáticas por período ou por serviço executado, com status." },
      { name: "Recibos por e-mail", desc: "Envio automático de recibos e comprovantes com log de entrega e leitura." },
      { name: "Vários meios de pagamento (em breve)", desc: "Cartão, Pix/TEF, boleto, AutoPay/recorrente e repasse de taxas." },
      { name: "Relatórios", desc: "Visão de receitas, inadimplência, pagamentos e exportação para planilha." },
      { name: "Orçamentos (em breve)", desc: "Propostas com fotos/observações; aprovação pelo cliente vira ordem de serviço." },
    ],
  },
  {
    id: "comm",
    title: "Comunicação com o Cliente",
    rows: [
      { name: "Relatório de Serviço", desc: "Envio de relatório com fotos do antes/depois, leituras e observações via link seguro." },
      { name: "Alertas", desc: "Notificações de visita realizada, reagendada ou cancelada, por e-mail/SMS (se ativado)." },
      { name: "Mensagens Rápidas", desc: "Templates personalizáveis por cliente/ocorrência para agilizar a comunicação." },
      { name: "Histórico Centralizado", desc: "Linha do tempo com visitas, anexos, mensagens e cobranças para cada cliente." },
      { name: "Portal do Cliente (em breve)", desc: "Acesso 24/7 a histórico, faturas, pagamentos e solicitações." },
    ],
  },
  {
    id: "cx",
    title: "Experiência do Cliente",
    rows: [
      { name: "Onboarding assistido", desc: "Apoio na configuração inicial, importação de clientes e melhores práticas do setor." },
      { name: "Suporte humano", desc: "Atendimento por pessoas de verdade quando você precisa — nada de labirinto de bot." },
      { name: "Segurança e auditoria", desc: "Logs por visita/ação, controle de permissões e trilha completa de mudanças." },
    ],
  },
];

/* ---------- Subcomponentes ---------- */
function TableLike({ rows }: { rows: FeatureRow[] }) {
  return (
    <div className="overflow-hidden rounded-b-xl border-x border-b border-slate-200">
      {/* Cabeçalho visual */}
      <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
      </div>

      {/* Linhas */}
      <div className="divide-y divide-slate-200">
        {rows.map((r) => (
          <div
            key={r.name}
            className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[240px_1fr]"
          >
            <div className="font-medium text-slate-900">{r.name}</div>
            <div className="text-sm leading-relaxed text-slate-700">{r.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Componente principal ---------- */
export default function BackofficeFeatureTable() {
  // Set para permitir múltiplas seções abertas
  const [open, setOpen] = React.useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isOpen = (id: string) => open.has(id);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h3 className="mb-2 text-center text-2xl font-bold tracking-tight text-slate-900">
          Veja todos os recursos
        </h3>
        <p className="mb-6 text-center text-sm text-slate-600">
          Nosso conjunto completo de funcionalidades para quem vive de serviços de piscina.
        </p>

        <div className="space-y-3">
          {GROUPS.map((g) => {
            const openNow = isOpen(g.id);
            return (
              <div key={g.id} className="border-0">
                {/* Barra azul */}
                <button
                  type="button"
                  onClick={() => toggle(g.id)}
                  aria-expanded={openNow}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-white shadow-sm",
                    "bg-[color:var(--ac-blue-600,#1d6fbf)] hover:bg-[color:var(--ac-blue-700,#195fa3)]",
                    openNow && "rounded-b-none"
                  )}
                >
                  <span className="text-sm font-semibold tracking-wide">
                    {g.title.toUpperCase()}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      openNow && "rotate-180"
                    )}
                  />
                </button>

                {/* Conteúdo */}
                <div className={cn("overflow-hidden", !openNow && "hidden")}>
                  <TableLike rows={g.rows} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
