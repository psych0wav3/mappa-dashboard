"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAquaMappaWhatsAppUrl } from "@/lib/contact";

type Tier = {
  key: string;
  name: string;
  priceLine1: string;
  priceLine2: string;
  priceLine3?: string;
  sub: string;
  features: string[];
  cta: string;
  badge?: string;
  theme: "default" | "popular" | "outline";
};

export default function PricingTable() {
  const tiers: Tier[] = [
    {
      key: "starter",
      name: "STARTER",
      priceLine1: "R$ 89,90 / mês",
      priceLine2: "até 10 piscinas",
      sub: "Para pequenas empresas ou autônomos que estão começando.",
      features: [
        "Rotas e visitas ilimitadas",
        "Leituras químicas + histórico",
        "Checklist configurável",
      ],
      cta: "Solicitar acesso",
      theme: "default",
    },
    {
      key: "pro",
      name: "PRO",
      priceLine1: "R$ 79,90/mês",
      priceLine2: "+ R$ 7,90 por piscina adicional",
      priceLine3: "11 a 30 piscinas",
      sub: "Para empresas já estruturadas, com 2 a 3 técnicos.",
      features: [
        "Rotas e visitas ilimitadas",
        "Leituras químicas + histórico",
        "Checklist configurável",
        "Exemplos:",
        "• 15 piscinas → R$ 119,40",
        "• 30 piscinas → R$ 237,90",
      ],
      badge: "Mais popular",
      cta: "Solicitar acesso",
      theme: "popular",
    },
    {
      key: "business",
      name: "BUSINESS",
      priceLine1: "R$ 206,90/mês",
      priceLine2: "+ R$ 6,90 por piscina adicional",
      priceLine3: "31 a 50 piscinas",
      sub: "Para empresas médias, com 3 a 5 técnicos em campo.",
      features: [
        "Rotas e visitas ilimitadas",
        "Leituras químicas + histórico",
        "Checklist configurável",
        "Exemplos:",
        "• 40 piscinas → R$ 275,90",
        "• 50 piscinas → R$ 344,90",
      ],
      cta: "Solicitar acesso",
      theme: "default",
    },
    {
      key: "enterprise",
      name: "ENTERPRISE",
      priceLine1: "R$ 244,90/mês",
      priceLine2: "+ R$ 4,90 por piscina adicional",
      priceLine3: "Acima de 50 piscinas",
      sub: "Para grandes empresas e condomínios.",
      features: [
        "Tudo do Business",
        "Customizações avançadas",
        "Suporte premium",
        "Contrato anual opcional",
      ],
      cta: "Falar com a equipe",
      theme: "outline",
    },
  ];

  return (
    <section id="pricing" className="relative overflow-hidden bg-gradient-to-br from-[#087BC2] via-[#0796CD] to-[#08B8D2] py-20">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center text-white">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-100">
            Planos Aqua Mappa
          </span>

          <h2 className="mt-3 text-pretty text-3xl font-extrabold tracking-tight sm:text-5xl">
            Um plano para cada momento da sua operação.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Escolha a opção ideal para sua empresa. Entre em contato com a nossa equipe e nós cuidamos da liberação do seu acesso.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <Card key={tier.key} tier={tier} />
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-center text-sm text-white/80 backdrop-blur">
          Seu acesso é liberado pela equipe Aqua Mappa. Assim, conseguimos acompanhar a configuração inicial da sua empresa e deixar tudo pronto para começar.
        </div>

        <p className="mx-auto mt-5 max-w-3xl text-center text-xs text-white/70">
          Valores de referência. Cobrança mensal. Impostos podem se aplicar conforme sua região.
        </p>
      </div>
    </section>
  );
}

function Card({ tier }: { tier: Tier }) {
  const isPopular = tier.theme === "popular";

  const whatsappUrl = getAquaMappaWhatsAppUrl(
    `Olá! Tenho interesse no plano ${tier.name} do Aqua Mappa e gostaria de saber mais sobre o acesso.`,
  );

  return (
    <div className={["relative flex h-full flex-col rounded-[24px] border bg-white shadow-xl transition duration-300 hover:-translate-y-1", isPopular ? "border-cyan-300 ring-2 ring-white/50" : "border-white/60"].join(" ")}>
      {tier.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="whitespace-nowrap rounded-full bg-[#173F76] px-4 py-1.5 text-xs font-semibold text-white shadow">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="space-y-2 border-b border-slate-100 p-6 text-center">
        <h3 className="text-sm font-extrabold tracking-[0.14em] text-[#173F76]">
          {tier.name}
        </h3>

        <div className="leading-tight">
          <div className="text-xl font-extrabold text-slate-900">
            {tier.priceLine1}
          </div>

          <div className="mt-1 text-sm font-semibold text-slate-500">
            {tier.priceLine2}
          </div>

          {tier.priceLine3 && (
            <div className="text-sm font-semibold text-slate-500">
              {tier.priceLine3}
            </div>
          )}
        </div>

        <p className="pt-2 text-sm leading-relaxed text-slate-600">
          {tier.sub}
        </p>
      </div>

      <ul className="flex-1 space-y-2.5 p-6 text-sm">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-slate-700">
            {feature.startsWith("•") || feature.endsWith(":") ? (
              <span className="text-slate-500">
                {feature}
              </span>
            ) : (
              <>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#08A8CF]" />

                <span>
                  {feature}
                </span>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="p-6 pt-0">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          {isPopular ? (
            <Button className="h-11 w-full border-0 bg-gradient-to-r from-[#0789C8] to-[#08B3D3] font-semibold text-white shadow-md">
              {tier.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" className="h-11 w-full border-2 border-[#08A8CF] font-semibold text-[#0789C8] hover:bg-sky-50 hover:text-[#0789C8]">
              {tier.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </a>
      </div>
    </div>
  );
}