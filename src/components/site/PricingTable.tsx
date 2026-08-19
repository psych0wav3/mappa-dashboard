"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";

type Tier = {
  key: string;
  name: string;
  price: string;
  limit: string;
  description: string;
  features: string[];
  badge?: string;
  popular?: boolean;
};

const WHATSAPP_NUMBER = "5511960120258";

const tiers: Tier[] = [
  {
    key: "starter",
    name: "STARTER",
    price: "R$ 89,90",
    limit: "Até 10 piscinas",
    description: "Para autônomos e pequenas empresas que estão começando a organizar a operação.",
    features: [
      "Rotas e visitas ilimitadas",
      "Leituras químicas + histórico",
      "Checklist configurável",
      "Fotos e registros de atendimento",
    ],
  },
  {
    key: "pro",
    name: "PRO",
    price: "R$ 159,90",
    limit: "Até 25 piscinas",
    description: "Para empresas em crescimento que precisam ganhar produtividade no dia a dia.",
    features: [
      "Rotas e visitas ilimitadas",
      "Leituras químicas + histórico",
      "Checklist configurável",
      "Fotos e registros de atendimento",
    ],
    badge: "Mais popular",
    popular: true,
  },
  {
    key: "business",
    name: "BUSINESS",
    price: "R$ 249,90",
    limit: "Até 50 piscinas",
    description: "Para operações maiores, com mais clientes e atendimentos recorrentes.",
    features: [
      "Rotas e visitas ilimitadas",
      "Leituras químicas + histórico",
      "Checklist configurável",
      "Fotos e registros de atendimento",
    ],
  },
  {
    key: "scale",
    name: "SCALE",
    price: "R$ 399,90",
    limit: "Até 100 piscinas",
    description: "Para empresas com uma operação de campo maior e uma carteira em expansão.",
    features: [
      "Rotas e visitas ilimitadas",
      "Leituras químicas + histórico",
      "Checklist configurável",
      "Fotos e registros de atendimento",
    ],
  },
];

function getWhatsAppHref(plan: string) {
  const message = `Olá! Tenho interesse no plano ${plan} do Aqua Mappa e gostaria de saber mais sobre a contratação.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function PricingTable() {
  return (
    <section id="pricing" className="relative overflow-hidden py-16 sm:py-20" style={{ backgroundImage: "linear-gradient(135deg, var(--ac-blue-700) 0%, var(--ac-blue-500) 58%, #12b8cb 100%)" }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center text-white">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/90">
            Planos Aqua Mappa
          </span>

          <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            Um plano para cada momento da sua operação.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            Escolha de acordo com o tamanho da sua carteira. Sem contas complicadas e sem cobrança adicional por piscina dentro do seu plano.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <PlanCard key={tier.key} tier={tier} />
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col gap-7 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                  Enterprise
                </span>

                <span className="text-sm font-semibold text-white/70">
                  Acima de 100 piscinas
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-white">
                Sua operação é ainda maior?
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                Para operações acima de 100 piscinas, montamos uma condição adequada ao volume e às necessidades da empresa.
              </p>
            </div>

            <Link href={getWhatsAppHref("Enterprise")} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md">
              <MessageCircle className="h-4 w-4" />
              Falar com a Mappa
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-white/65">
          Valores mensais conforme a quantidade de piscinas ativas cadastradas na plataforma.
        </p>
      </div>
    </section>
  );
}

function PlanCard({ tier }: { tier: Tier }) {
  return (
    <article className={`relative flex min-h-[500px] flex-col overflow-visible rounded-3xl bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${tier.popular ? "border-2 border-sky-200 ring-2 ring-white/30" : "border border-white/40"}`}>
      {tier.badge && (
        <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2">
          <span className="whitespace-nowrap rounded-full bg-[#123f78] px-4 py-1.5 text-[11px] font-bold text-white shadow-lg">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="border-b border-slate-100 px-6 pb-6 pt-7 text-center">
        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#123f78]">
          {tier.name}
        </span>

        <div className="mt-3 flex items-end justify-center gap-1">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            {tier.price}
          </span>

          <span className="pb-0.5 text-sm font-semibold text-slate-500">
            /mês
          </span>
        </div>

        <div className="mt-2 text-sm font-bold text-slate-500">
          {tier.limit}
        </div>

        <p className="mt-5 min-h-[72px] text-sm leading-6 text-slate-600">
          {tier.description}
        </p>
      </div>

      <div className="flex flex-1 flex-col px-6 py-6">
        <ul className="space-y-3">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm leading-5 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <Link href={getWhatsAppHref(tier.name)} target="_blank" rel="noopener noreferrer" className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${tier.popular ? "btn-brand border-0 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg" : "border-2 border-cyan-500 bg-white text-sky-600 hover:bg-sky-50"}`}>
            Solicitar acesso
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}