"use client";

import * as React from "react";
import Image from "next/image";
import { CalendarDays, Check, ClipboardCheck, History, Route as RouteIcon, Users } from "lucide-react";

type StoryProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  visual: React.ReactNode;
  flip?: boolean;
};

export default function BackofficeFeatureBlocks() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-20 text-center sm:px-6 sm:pt-24">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#08A8CF]">
          Feito para organizar sua operação
        </span>

        <h2 className="mx-auto mt-3 max-w-3xl text-balance text-4xl font-extrabold tracking-tight text-[#173F76] sm:text-5xl">
          Gestão clara do começo ao fim.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          Menos informação espalhada e mais clareza para planejar, distribuir e acompanhar cada atendimento.
        </p>
      </div>

      <Story
        eyebrow="Planejamento de rotas"
        title="Organize a semana da sua equipe."
        description="Defina a rotina de cada técnico, distribua os atendimentos pelos dias da semana e tenha uma visão clara da operação."
        bullets={[
          "Planejamento semanal por técnico",
          "Atendimentos organizados por dia",
          "Rotina da equipe em uma única visão",
        ]}
        visual={<RoutesVisual />}
      />

      <Story
        flip
        eyebrow="Controle da operação"
        title="Saiba o que está acontecendo em campo."
        description="Acompanhe técnicos, rotas e serviços sem depender de mensagens espalhadas ou planilhas paralelas."
        bullets={[
          "Visão consolidada dos técnicos",
          "Acompanhamento dos atendimentos",
          "Serviços e clientes conectados",
        ]}
        visual={<OperationVisual />}
      />

      <Story
        eyebrow="Histórico"
        title="Cada atendimento vira informação útil."
        description="Serviços, fotos, medições e registros permanecem vinculados ao cliente e podem ser consultados quando você precisar."
        bullets={[
          "Histórico completo por cliente",
          "Registros dos serviços realizados",
          "Mais rastreabilidade para a empresa",
        ]}
        visual={<HistoryVisual />}
      />
    </section>
  );
}

function Story({ eyebrow, title, description, bullets, visual, flip = false }: StoryProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <div className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${flip ? "lg:[&>div:first-child]:order-2" : ""}`}>
        <div>
          {visual}
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-[0.17em] text-[#08A8CF]">
            {eyebrow}
          </span>

          <h3 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-[#173F76] sm:text-4xl">
            {title}
          </h3>

          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
            {description}
          </p>

          <div className="mt-7 grid gap-3">
            {bullets.map((bullet) => (
              <div key={bullet} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E8F8FC] text-[#079CCB]">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>

                {bullet}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoutesVisual() {
  return (
    <div className="relative min-h-[400px] overflow-hidden rounded-[30px] bg-[#EAF7FD] p-5">
      <div className="relative min-h-[360px] overflow-hidden rounded-[24px] bg-white shadow-[0_22px_50px_rgba(4,72,108,.12)]">
        <Image src="/hero-backoffice-b.png" alt="Planejamento de rotas do Aqua Mappa" fill className="object-cover" />
      </div>
    </div>
  );
}

function OperationVisual() {
  return (
    <div className="relative min-h-[400px] overflow-hidden rounded-[30px] bg-gradient-to-br from-[#087BC2] to-[#08B5D1] p-8">
      <div className="mx-auto max-w-[460px] overflow-hidden rounded-[24px] bg-white shadow-[0_24px_55px_rgba(2,31,55,.18)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#08A8CF]">
              Semana da equipe
            </p>

            <p className="mt-1 text-lg font-extrabold text-[#173F76]">
              Controle das rotas
            </p>
          </div>

          <CalendarDays className="h-5 w-5 text-[#08A8CF]" />
        </div>

        <div className="grid gap-4 p-6">
          <OperationRow icon={<Users className="h-4 w-4" />} title="Bento" detail="Seg • Qua • Sex" status="3 dias" />
          <OperationRow icon={<RouteIcon className="h-4 w-4" />} title="Lucas" detail="Ter • Qui" status="2 dias" />
          <OperationRow icon={<ClipboardCheck className="h-4 w-4" />} title="Gabriel" detail="Quarta-feira" status="1 dia" />
        </div>
      </div>
    </div>
  );
}

function OperationRow({ icon, title, detail, status }: { icon: React.ReactNode; title: string; detail: string; status: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#EAF7FD] text-[#0789C8]">
        {icon}
      </span>

      <div className="flex-1">
        <p className="text-sm font-bold text-[#173F76]">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {detail}
        </p>
      </div>

      <span className="text-xs font-semibold text-[#079CCB]">
        {status}
      </span>
    </div>
  );
}

function HistoryVisual() {
  return (
    <div className="relative min-h-[400px] rounded-[30px] bg-[#F5FBFE] p-8">
      <div className="mx-auto max-w-[460px]">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#0789C8] to-[#08B3D3] text-white">
            <History className="h-5 w-5" />
          </span>

          <div>
            <p className="font-extrabold text-[#173F76]">
              Histórico do cliente
            </p>

            <p className="text-xs text-slate-500">
              Tudo registrado no mesmo fluxo
            </p>
          </div>
        </div>

        <div className="border-l-2 border-sky-100 pl-6">
          <TimelineItem date="18 AGO" title="Serviço realizado" description="Checklist concluído • 4 fotos registradas" />
          <TimelineItem date="11 AGO" title="Medições registradas" description="pH, cloro e observações atualizados" />
          <TimelineItem date="04 AGO" title="Visita concluída" description="Histórico do cliente atualizado" last />
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ date, title, description, last = false }: { date: string; title: string; description: string; last?: boolean }) {
  return (
    <div className={`relative ${last ? "" : "pb-8"}`}>
      <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#08A8CF] shadow" />

      <p className="text-[10px] font-bold tracking-[0.14em] text-[#08A8CF]">
        {date}
      </p>

      <p className="mt-1 text-sm font-bold text-[#173F76]">
        {title}
      </p>

      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}