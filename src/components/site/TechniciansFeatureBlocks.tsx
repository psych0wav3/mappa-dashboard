"use client";

import * as React from "react";
import Image from "next/image";
import { Camera, Check, CheckCircle2, ClipboardCheck, FlaskConical } from "lucide-react";

type StoryProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  visual: React.ReactNode;
  flip?: boolean;
};

export default function TechniciansFeatureBlocks() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-20 text-center sm:px-6 sm:pt-24">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#08A8CF]">
          Feito para quem está em campo
        </span>

        <h2 className="mx-auto mt-3 max-w-3xl text-balance text-4xl font-extrabold tracking-tight text-[#173F76] sm:text-5xl">
          O atendimento inteiro na mão do técnico.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          A rotina fica simples: saber onde ir, o que fazer e o que precisa ser registrado.
        </p>
      </div>

      <Story
        eyebrow="Rota do dia"
        title="Sua rota do dia na mão."
        description="O técnico visualiza os atendimentos programados e segue a rotina definida pela empresa sem depender de papel, planilhas ou mensagens espalhadas."
        bullets={[
          "Atendimentos organizados por dia",
          "Informações do cliente disponíveis no app",
          "Mais clareza para a rotina em campo",
        ]}
        visual={<PhoneVisual />}
      />

      <Story
        flip
        eyebrow="Execução padronizada"
        title="Tudo que precisa ser feito, na ordem certa."
        description="Checklists ajudam a padronizar a execução e deixam claro o que precisa ser concluído em cada atendimento."
        bullets={[
          "Checklists por tipo de serviço",
          "Itens obrigatórios e orientações",
          "Registro simples da execução",
        ]}
        visual={<ChecklistVisual />}
      />

      <Story
        eyebrow="Registro do atendimento"
        title="Serviço realizado. Tudo registrado."
        description="Fotos, medições e observações permanecem ligadas ao atendimento e ao histórico da piscina."
        bullets={[
          "Fotos do serviço",
          "Medições e parâmetros da piscina",
          "Histórico organizado por cliente",
        ]}
        visual={<MeasurementVisual />}
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

function PhoneVisual() {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[30px] bg-gradient-to-br from-[#087BC2] to-[#08B5D1]">
      <div className="absolute -right-20 top-8 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute left-1/2 top-7 h-[370px] w-[220px] -translate-x-1/2 overflow-hidden rounded-[38px] border-[7px] border-[#13243d] bg-[#101828] shadow-[0_25px_55px_rgba(2,31,55,.30)]">
        <div className="absolute left-1/2 top-3 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-[#0b1320]" />

        <div className="absolute inset-[7px] overflow-hidden rounded-[28px] bg-white">
          <Image src="/hero.png" alt="Aplicativo Aqua Mappa" fill className="object-cover object-top" />
        </div>
      </div>
    </div>
  );
}

function ChecklistVisual() {
  const items = [
    ["Conferir aspecto da água", true],
    ["Registrar nível de cloro", true],
    ["Verificar pH", true],
    ["Adicionar observações", false],
  ];

  return (
    <div className="min-h-[400px] rounded-[30px] bg-[#F5FBFE] p-7">
      <div className="mx-auto max-w-[450px] rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_22px_50px_rgba(4,72,108,.12)]">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#0789C8] to-[#08B3D3] text-white">
            <ClipboardCheck className="h-5 w-5" />
          </span>

          <div>
            <p className="font-extrabold text-[#173F76]">Checklist do atendimento</p>
            <p className="text-xs text-slate-500">Piscina residencial</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {items.map(([label, checked]) => (
            <div key={String(label)} className="flex items-center gap-3">
              <span className={`grid h-7 w-7 place-items-center rounded-full ${checked ? "bg-[#E7F8FC] text-[#08A8CF]" : "border border-slate-200 text-slate-300"}`}>
                {checked && <CheckCircle2 className="h-4 w-4" />}
              </span>

              <span className={`text-sm ${checked ? "font-medium text-slate-700" : "text-slate-500"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MeasurementVisual() {
  return (
    <div className="min-h-[400px] rounded-[30px] bg-gradient-to-br from-[#EAF7FD] to-white p-7">
      <div className="mx-auto grid max-w-[470px] gap-4">
        <div className="flex items-center justify-between rounded-[22px] bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E7F8FC] text-[#079CCB]">
              <FlaskConical className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-slate-400">pH</p>
              <p className="font-extrabold text-[#173F76]">7,4</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600">OK</span>
        </div>

        <div className="flex items-center justify-between rounded-[22px] bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E7F8FC] text-[#079CCB]">
              <FlaskConical className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-slate-400">Cloro</p>
              <p className="font-extrabold text-[#173F76]">2,0 ppm</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600">OK</span>
        </div>

        <div className="flex items-center gap-3 rounded-[22px] bg-white px-5 py-4 shadow-sm">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E7F8FC] text-[#079CCB]">
            <Camera className="h-5 w-5" />
          </span>

          <div>
            <p className="font-bold text-[#173F76]">Fotos do atendimento</p>
            <p className="text-xs text-slate-500">4 registros adicionados</p>
          </div>
        </div>
      </div>
    </div>
  );
}