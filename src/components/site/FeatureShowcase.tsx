"use client";

import * as React from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, MonitorCog, Wrench, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/** ---------------------------------------------------------
 * Configuração data-driven (tudo num lugar)
 * --------------------------------------------------------*/
const GRADIENT = "bg-gradient-to-br from-[#0077C8] to-[#00AEEF]";

type SectionKey = "backoffice" | "technician" | "client";

type Section = {
  key: SectionKey;
  title: string;
  icon: React.ReactNode;
  image: { src: string; alt: string };
  description: string;
  bullets: string[];
};

const SECTIONS: Section[] = [
  {
    key: "backoffice",
    title: "Recursos de Back Office",
    icon: (
      <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm", GRADIENT)}>
        <MonitorCog className="h-4 w-4" />
      </div>
    ),
    image: {
      src: "/hero-backoffice-b.png",
      alt: "Dashboard de rotas e planejamento do Aqua Mappa",
    },
    description:
      "Organize a operação, otimize rotas e ganhe horas no seu dia com o painel web do Aqua Mappa. Agende técnicos, gerencie rotas e clientes, e fature sem atrito.",
    bullets: [
      "Planejamento de rotas com mapa e janelas de atendimento",
      "Checklists e modelos de serviço padronizados",
      "Histórico completo por cliente e auditoria por visita",
      "Faturamento e recibos em poucos cliques (Em Breve)",
    ],
  },
  {
    key: "technician",
    title: "Recursos para Técnicos",
    icon: (
      <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm", GRADIENT)}>
        <Wrench className="h-4 w-4" />
      </div>
    ),
    image: {
      src: "/hero-backoffice-b.png",
      alt: "App do técnico do Aqua Mappa com mapa e paradas",
    },
    description:
      "App mobile simples e rápido: o técnico reduz deslocamentos e papelada, segue o checklist, registra fotos e leituras químicas em poucos toques.",
    bullets: [
      "Check-in/checkout com fotos (antes/depois)",
      "Leituras químicas com faixas e alertas",
      "Rotas do dia com navegação e ocorrências",
      "Modo offline com sincronização automática",
    ],
  },
  {
    key: "client",
    title: "Recursos para Clientes",
    icon: (
      <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm", GRADIENT)}>
        <Users className="h-4 w-4" />
      </div>
    ),
    image: {
      src: "/hero-backoffice-b.png",
      alt: "Relatório de serviço com fotos e leituras",
    },
    description:
      "Mantenha seus clientes informados com relatórios configuráveis. Economize horas por semana e reduza ligações, enviando comprovantes com fotos e leituras por e-mail ou link.",
    bullets: [
      "Relatórios com fotos e leituras por visita",
      "Histórico acessível por link seguro",
      "Avisos de visita realizada ou reagendada",
      "Pagamentos simples com recibo automático (Em Breve)",
    ],
  },
];

/** ---------------------------------------------------------
 * Componente
 * --------------------------------------------------------*/
export default function FeatureAccordion() {
  const [active, setActive] = React.useState<SectionKey>("backoffice");
  const current = SECTIONS.find((s) => s.key === active)!;

  return (
    <section id="features" className="bg-white py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2">
        {/* Imagem — centralizada verticalmente */}
        <div className="flex items-center justify-center">
          <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-4 shadow-xl">
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Image
                key={current.image.src}
                src={current.image.src}
                alt={current.image.alt}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Acordeão */}
        <div className="flex flex-col">
          <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
            <span className={cn("inline-block h-2 w-2 rounded-full", GRADIENT)} />
            Recursos do Aqua Mappa
          </div>

          <h2 className="text-pretty text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Back office, técnicos e clientes — tudo conectado.
          </h2>
          <p className="mt-3 text-slate-600">
            Organize rotas, padronize a execução em campo e entregue relatórios claros com fotos e leituras.
            O Aqua Mappa reduz retrabalho, melhora a comunicação e acelera a cobrança.
          </p>

          <Accordion
            type="single"
            collapsible
            value={active}
            onValueChange={(v) => setActive((v as SectionKey) || active)}
            className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            {SECTIONS.map((s, i) => (
              <AccordionItem
                key={s.key}
                value={s.key}
                className={cn("px-4 sm:px-6", i < SECTIONS.length - 1 && "border-b border-slate-200")}
              >
                {/* Trigger: somente título quando fechado */}
                <AccordionTrigger className="group flex w-full items-center gap-2 py-3 text-left text-[15px] font-semibold text-slate-900 hover:no-underline">
                  {s.icon}
                  <span>{s.title}</span>
                  <ChevronDown className="ml-auto h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </AccordionTrigger>

                {/* Conteúdo aparece só quando aberto */}
                <AccordionContent className="pb-4 text-[15px] leading-snug text-slate-600">
                  <div className="relative pl-4">
                    <span className={cn("absolute left-0 top-0 h-full w-[3px] rounded", GRADIENT)} />
                    <p className="mb-3">{s.description}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 pl-5">
                      {s.bullets.map((b) => (
                        <li key={b} className="relative leading-tight before:content-['•'] before:absolute before:-left-3 before:text-slate-400">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
