"use client";

import * as React from "react";
import { Camera, Check, CheckCircle2, ClipboardCheck, FlaskConical, History, MessageCircle, UserCheck } from "lucide-react";

type StoryProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  visual: React.ReactNode;
  flip?: boolean;
};

export default function ClientsFeatureBlocks() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-20 text-center sm:px-6 sm:pt-24">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#08A8CF]">Serviço que gera confiança</span>

        <h2 className="mx-auto mt-3 max-w-3xl text-balance text-4xl font-extrabold tracking-tight text-[#173F76] sm:text-5xl">
          O cliente percebe quando existe organização.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
          Cada atendimento deixa um histórico claro para sua empresa e uma experiência mais profissional para quem contrata o serviço.
        </p>
      </div>

      <Story
        eyebrow="Histórico organizado"
        title="Cada atendimento deixa um histórico."
        description="Serviços, fotos, medições e observações permanecem organizados por cliente e por piscina."
        bullets={["Histórico completo de visitas", "Fotos ligadas ao atendimento", "Medições e observações centralizadas"]}
        visual={<HistoryVisual />}
      />

      <Story
        flip
        eyebrow="Mais transparência"
        title="Seu cliente sabe o que foi feito."
        description="O registro de cada visita ajuda sua empresa a demonstrar o serviço realizado e entregar uma experiência muito mais profissional."
        bullets={["Checklist do serviço realizado", "Fotos e informações da visita", "Mais clareza na comunicação"]}
        visual={<ServiceVisual />}
      />

      <Story
        eyebrow="Aprovação de serviços"
        title="Solicitações dentro do mesmo fluxo."
        description="Quando aparece a necessidade de um serviço adicional, a solicitação permanece vinculada ao atendimento e pode seguir para aprovação do cliente."
        bullets={["Solicitação registrada pela equipe", "Aprovação vinculada ao cliente", "Histórico completo do processo"]}
        visual={<ApprovalVisual />}
      />
    </section>
  );
}

function Story({ eyebrow, title, description, bullets, visual, flip = false }: StoryProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <div className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${flip ? "lg:[&>div:first-child]:order-2" : ""}`}>
        <div>{visual}</div>

        <div>
          <span className="text-xs font-bold uppercase tracking-[0.17em] text-[#08A8CF]">{eyebrow}</span>

          <h3 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-[#173F76] sm:text-4xl">{title}</h3>

          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">{description}</p>

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

function HistoryVisual() {
  return (
    <div className="min-h-[400px] rounded-[30px] bg-[#F5FBFE] p-7">
      <div className="mx-auto max-w-[460px] rounded-[24px] bg-white p-6 shadow-[0_22px_50px_rgba(4,72,108,.11)]">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#0789C8] to-[#08B3D3] text-white">
            <History className="h-5 w-5" />
          </span>

          <div>
            <p className="font-extrabold text-[#173F76]">Histórico da piscina</p>
            <p className="text-xs text-slate-500">Residência Silva</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <HistoryRow date="18 AGO" title="Manutenção realizada" description="Checklist concluído" icon={<ClipboardCheck className="h-4 w-4" />} />
          <HistoryRow date="11 AGO" title="Fotos do serviço" description="4 registros adicionados" icon={<Camera className="h-4 w-4" />} />
          <HistoryRow date="04 AGO" title="Medições registradas" description="pH e cloro atualizados" icon={<FlaskConical className="h-4 w-4" />} />
        </div>
      </div>
    </div>
  );
}

function HistoryRow({ date, title, description, icon }: { date: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#EAF7FD] text-[#0789C8]">{icon}</span>

      <div className="flex-1">
        <p className="text-sm font-bold text-[#173F76]">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>

      <span className="text-[10px] font-bold text-slate-400">{date}</span>
    </div>
  );
}

function ServiceVisual() {
  return (
    <div className="min-h-[400px] rounded-[30px] bg-gradient-to-br from-[#087BC2] to-[#08B5D1] p-8">
      <div className="mx-auto max-w-[430px] rounded-[24px] bg-white p-6 shadow-[0_24px_55px_rgba(2,31,55,.18)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08A8CF]">Resumo do atendimento</p>
            <h4 className="mt-1 text-xl font-extrabold text-[#173F76]">Serviço concluído</h4>
          </div>

          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
        </div>

        <div className="mt-6 grid gap-3">
          <ServiceRow icon={<ClipboardCheck className="h-4 w-4" />} label="Checklist" value="8 de 8 concluídos" />
          <ServiceRow icon={<Camera className="h-4 w-4" />} label="Fotos" value="4 registros" />
          <ServiceRow icon={<FlaskConical className="h-4 w-4" />} label="Medições" value="Atualizadas" />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#173F76]">
            <MessageCircle className="h-4 w-4 text-[#08A8CF]" />
            Informações organizadas em um único registro.
          </p>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#F5FBFE] px-4 py-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#0789C8]">{icon}</span>

      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-bold text-[#173F76]">{value}</p>
      </div>
    </div>
  );
}

function ApprovalVisual() {
  return (
    <div className="min-h-[400px] rounded-[30px] bg-[#F5FBFE] p-8">
      <div className="mx-auto max-w-[450px] rounded-[24px] bg-white p-6 shadow-[0_20px_45px_rgba(4,72,108,.11)]">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#EAF7FD] text-[#0789C8]">
            <UserCheck className="h-5 w-5" />
          </span>

          <div>
            <p className="font-extrabold text-[#173F76]">Serviço adicional</p>
            <p className="text-xs text-slate-500">Solicitação vinculada ao atendimento</p>
          </div>
        </div>

        <div className="my-6 h-px bg-slate-100" />

        <p className="text-sm font-medium text-[#173F76]">Troca de componente</p>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Necessidade identificada durante a manutenção e registrada pela equipe.
        </p>

        <div className="mt-6 flex items-center justify-between rounded-xl bg-[#F5FBFE] px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Status</p>
            <p className="mt-0.5 text-sm font-bold text-[#173F76]">Aprovado pelo cliente</p>
          </div>

          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        </div>
      </div>
    </div>
  );
}