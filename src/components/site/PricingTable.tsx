"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function PricingTable() {
  const tiers: Tier[] = [
    {
      name: "STARTER",
      priceLine1: "R$ 89,90 / mês",
      priceLine2: "até 10 piscinas",
      sub: "Para pequenas empresas ou autônomos que estão começando.",
      features: [
        "Rotas e visitas ilimitadas",
        "Leituras químicas + histórico",
        "Checklist configurável",
      ],
      cta: "Começar agora",
      theme: "default",
    },
    {
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
        "• 15 piscinas → R$ 79,90  + (5 adicionais × 7,90) = R$ 119,40",
        "• 30 piscinas → R$ 79,90  + (20 adicionais × 7,90) = R$ 237,90",
      ],
      badge: "Mais popular",
      cta: "Assinar Pro",
      theme: "popular",
    },
    {
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
        "• 40 piscinas → R$ 206,90 + (10 adicionais × 6,90) = R$ 275,90",
        "• 50 piscinas → R$ 206,90 + (20 adicionais × 6,90) = R$ 344,90",
      ],
      cta: "Assinar Business",
      theme: "default",
    },
    {
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
      cta: "Falar com vendas",
      theme: "outline",
    },
  ];

  return (
    <section
      id="valores"
      className="py-16"
      style={{
        backgroundImage:
          "linear-gradient(180deg, var(--ac-blue-700) 0%, var(--ac-blue-500) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center text-white">
          <h2 className="text-pretty text-3xl font-extrabold tracking-tight sm:text-4xl">
            Planos simples, flexíveis e transparentes
          </h2>
          <p className="mt-3 text-white/80">
            Comece hoje e evolua conforme sua carteira de clientes cresce.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <Card key={t.name} tier={t} />
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-white/80">
          Valores de referência. Cobrança mensal. Impostos podem se aplicar conforme sua região.
        </p>
      </div>
    </section>
  );
}

/* ---------- Types & Components ---------- */

type Tier = {
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

function Card({ tier }: { tier: Tier }) {
  const isPopular = tier.theme === "popular";

  return (
    <div
      className={[
        "relative flex h-full flex-col rounded-2xl border bg-white shadow-lg",
        isPopular ? "border-sky-300 ring-2 ring-sky-200" : "border-slate-200",
      ].join(" ")}
    >
      {tier.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-[color:var(--ac-blue-500,#38bdf8)] px-3 py-1 text-xs font-semibold text-white shadow">
            {tier.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-2 border-b border-slate-100 p-6 text-center">
        <h3 className="text-base font-bold tracking-wide text-slate-900">
          {tier.name}
        </h3>

        <div className="leading-tight">
          <div className="text-xl font-extrabold text-slate-900">
            {tier.priceLine1}
          </div>
          <div className="text-sm font-semibold text-slate-500">
            {tier.priceLine2}
          </div>
          {tier.priceLine3 && (
            <div className="text-sm font-semibold text-slate-500">
              {tier.priceLine3}
            </div>
          )}
        </div>

        <p className="text-sm text-slate-600">{tier.sub}</p>
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-2 p-6 text-sm">
        {tier.features.map((f, idx) => (
          <li key={idx} className="flex items-start gap-2 text-slate-700">
            {f.startsWith("•") || f.endsWith(":") ? (
              <span className="text-slate-500">{f}</span>
            ) : (
              <>
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--ac-blue-500,#38bdf8)]" />
                <span>{f}</span>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="p-6 pt-0">
        <Link href={tier.name === "ENTERPRISE" ? "/contato" : "/login"}>
          {isPopular ? (
            <Button className="w-full font-semibold btn-brand border-0 shadow-sm">
              {tier.cta}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full font-semibold border-2 border-[color:var(--ac-blue-500,#38bdf8)] text-[color:var(--ac-blue-500,#38bdf8)] hover:bg-[color:var(--ac-blue-50,#f0f9ff)]"
            >
              {tier.cta}
            </Button>
          )}
        </Link>
      </div>
    </div>
  );
}
