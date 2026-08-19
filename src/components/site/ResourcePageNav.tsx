import * as React from "react";
import { CreditCard, LayoutDashboard, Users, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

type ResourcePageNavProps = {
  current: "backoffice" | "tecnicos" | "clientes" | "cobranca";
};

const items = [
  {
    key: "backoffice",
    title: "Gestão",
    description: "Painel e operação",
    icon: LayoutDashboard,
  },
  {
    key: "tecnicos",
    title: "Técnicos",
    description: "Execução em campo",
    icon: Wrench,
  },
  {
    key: "clientes",
    title: "Clientes",
    description: "Experiência e histórico",
    icon: Users,
  },
  {
    key: "cobranca",
    title: "Cobrança",
    description: "Financeiro conectado",
    icon: CreditCard,
  },
] as const;

export default function ResourcePageNav({ current }: ResourcePageNavProps) {
  return (
    <section className="bg-[#F5FBFE] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#08A8CF]">
            O ecossistema Aqua Mappa
          </span>

          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#173F76]">
            Tudo conectado na mesma operação.
          </h2>
        </div>

        <div className="grid border-y border-slate-200 md:grid-cols-4 md:divide-x md:divide-slate-200">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.key === current;

            return (
              <div key={item.key} className={cn("flex items-center gap-4 border-b border-slate-200 px-3 py-6 last:border-b-0 md:border-b-0 md:px-6", active && "bg-white")}>
                <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full", active ? "bg-gradient-to-br from-[#0789C8] to-[#08B3D3] text-white shadow-sm" : "bg-white text-[#0789C8]")}>
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <p className={cn("font-bold", active ? "text-[#173F76]" : "text-slate-700")}>
                    {item.title}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}