"use client";

import * as React from "react";
import { ArrowRight, CalendarClock, Check, CreditCard, Receipt, Repeat2, WalletCards } from "lucide-react";

import { getAquaMappaWhatsAppUrl } from "@/lib/contact";

export default function BillingFeatureBlocks() {
  const whatsappUrl = getAquaMappaWhatsAppUrl(
    "Olá! Gostaria de saber quando os recursos de cobrança e pagamentos do Aqua Mappa estarão disponíveis.",
  );

  return (
    <section className="overflow-hidden bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
            Em desenvolvimento
          </span>

          <h2 className="mt-5 text-balance text-4xl font-extrabold tracking-tight text-[#173F76] sm:text-5xl">
            Do serviço realizado ao recebimento.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            O objetivo é reduzir tarefas manuais e conectar o financeiro aos serviços que já acontecem dentro do Aqua Mappa.
          </p>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute left-[15%] right-[15%] top-7 hidden h-px bg-gradient-to-r from-sky-100 via-[#08A8CF] to-sky-100 md:block" />

          <div className="relative grid gap-8 md:grid-cols-4">
            <FlowItem number="01" icon={<Check className="h-5 w-5" />} title="Serviço realizado" description="O atendimento é concluído e registrado na operação." />
            <FlowItem number="02" icon={<Receipt className="h-5 w-5" />} title="Faturamento" description="O serviço poderá alimentar o processo de faturamento." />
            <FlowItem number="03" icon={<CreditCard className="h-5 w-5" />} title="Cobrança" description="Cobranças e recorrências dentro do mesmo fluxo." />
            <FlowItem number="04" icon={<WalletCards className="h-5 w-5" />} title="Recebimento" description="Mais visibilidade sobre o que foi recebido e o que está pendente." />
          </div>
        </div>

        <div className="mt-20 grid gap-10 border-y border-slate-200 py-10 md:grid-cols-3">
          <FutureFeature icon={<Receipt className="h-6 w-6" />} title="Faturas a partir dos serviços" description="Reduza retrabalho conectando o que foi executado ao processo financeiro." />
          <FutureFeature icon={<Repeat2 className="h-6 w-6" />} title="Cobranças recorrentes" description="Uma experiência pensada para empresas que trabalham com manutenção recorrente." />
          <FutureFeature icon={<CalendarClock className="h-6 w-6" />} title="Mais visibilidade financeira" description="Acompanhe o fluxo com mais clareza sem separar operação e financeiro." />
        </div>
      </div>
    </section>
  );
}

function FlowItem({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="relative text-center">
      <span className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#0789C8] to-[#08B3D3] text-white shadow-md">
        {icon}
      </span>

      <p className="mt-5 text-[10px] font-bold tracking-[0.18em] text-[#08A8CF]">
        {number}
      </p>

      <h3 className="mt-2 text-lg font-extrabold text-[#173F76]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

function FutureFeature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div>
      <span className="text-[#08A8CF]">
        {icon}
      </span>

      <h3 className="mt-4 text-xl font-extrabold text-[#173F76]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>

      <p className="mt-4 text-xs font-bold uppercase tracking-[0.13em] text-amber-600">
        Em desenvolvimento
      </p>
    </div>
  );
}