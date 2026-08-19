"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, MonitorCog, Users, Wrench } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { cn } from "@/lib/utils";

type SectionKey = "backoffice" | "technician" | "client";

type Section = {
  key: SectionKey;
  title: string;
  shortTitle: string;
  icon: React.ReactNode;
  image: {
    src: string;
    alt: string;
    className?: string;
  };
  description: string;
  bullets: string[];
  visualTitle: string;
  visualSubtitle: string;
  visualTags: string[];
};

const GRADIENT = "bg-gradient-to-br from-[#0789C8] to-[#08B3D3]";

const SECTIONS: Section[] = [
  {
    key: "backoffice",
    title: "Recursos de Back Office",
    shortTitle: "Back Office",
    icon: <MonitorCog className="h-[18px] w-[18px]" />,
    image: {
      src: "/hero-backoffice-b.png",
      alt: "Painel web do Aqua Mappa",
      className: "object-cover",
    },
    description:
      "Planeje a operação, distribua os atendimentos e acompanhe sua equipe em um só lugar.",
    bullets: [
      "Planejamento semanal de rotas",
      "Gestão de clientes e técnicos",
      "Histórico completo dos serviços",
      "Checklists e medições",
    ],
    visualTitle: "Sua operação sob controle",
    visualSubtitle: "Planeje, acompanhe e organize.",
    visualTags: ["Rotas organizadas", "Equipe em campo", "Histórico completo"],
  },
  {
    key: "technician",
    title: "Recursos para Técnicos",
    shortTitle: "Técnicos",
    icon: <Wrench className="h-[18px] w-[18px]" />,
    image: {
      src: "/hero.png",
      alt: "Aplicativo Aqua Mappa para técnicos",
      className: "object-cover object-center",
    },
    description:
      "O técnico recebe sua rotina, executa o serviço e registra tudo diretamente pelo aplicativo.",
    bullets: [
      "Rotas e atendimentos do dia",
      "Checklists de execução",
      "Fotos e registros do serviço",
      "Medições e informações da piscina",
    ],
    visualTitle: "Tudo na mão do técnico",
    visualSubtitle: "Da rota ao serviço concluído.",
    visualTags: ["Agenda do dia", "Checklists", "Fotos e medições"],
  },
  {
    key: "client",
    title: "Recursos para Clientes",
    shortTitle: "Clientes",
    icon: <Users className="h-[18px] w-[18px]" />,
    image: {
      src: "/hero-backoffice.png",
      alt: "Informações e histórico do cliente no Aqua Mappa",
      className: "object-cover",
    },
    description:
      "Mantenha seus clientes informados e concentre o histórico de cada piscina em um único fluxo.",
    bullets: [
      "Histórico dos atendimentos",
      "Fotos e informações do serviço",
      "Acompanhamento mais transparente",
      "Comunicação organizada",
    ],
    visualTitle: "Mais transparência para o cliente",
    visualSubtitle: "Serviço registrado. Informação organizada.",
    visualTags: ["Histórico", "Registros", "Mais confiança"],
  },
];

export default function FeatureShowcase() {
  const [active, setActive] = React.useState<SectionKey>("backoffice");

  const current = SECTIONS.find((section) => section.key === active) ?? SECTIONS[0];

  return (
    <section id="features" className="relative overflow-hidden bg-[#F5FBFE] py-20 sm:py-24">
      <div className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-cyan-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-sky-200/25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-14">
          <div className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0789C8] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#08A8CF]" />
            Recursos do Aqua Mappa
          </div>

          <h2 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-[#173F76] sm:text-5xl">
            Uma operação.
            <br />
            <span className="text-[#08A8CF]">Três experiências conectadas.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Da gestão no escritório ao atendimento em campo, o Aqua Mappa mantém equipe, serviços e clientes no mesmo fluxo.
          </p>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.03fr_.97fr] lg:gap-14">
          <div className="relative">
            <div className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-white p-3 shadow-[0_24px_60px_rgba(3,83,125,.13)] sm:p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#087FC6] to-[#08B6D2]">
                <AnimatePresence mode="wait">
                  <motion.div key={current.key} initial={{ opacity: 0, scale: 1.015 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.28 }} className="absolute inset-0">
                    <Image src={current.image.src} alt={current.image.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className={current.image.className} />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#063F70]/80 via-[#063F70]/20 to-transparent" />

                <AnimatePresence mode="wait">
                  <motion.div key={`${current.key}-copy`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute bottom-5 left-5 right-5 text-white sm:bottom-7 sm:left-7 sm:right-7">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-md">
                      {current.icon}
                      {current.shortTitle}
                    </div>

                    <p className="text-xl font-extrabold sm:text-2xl">
                      {current.visualTitle}
                    </p>

                    <p className="mt-1 text-sm text-white/80">
                      {current.visualSubtitle}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={`${current.key}-tags`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.25 }} className="relative z-20 mx-auto -mt-5 flex w-[90%] flex-wrap justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_15px_35px_rgba(5,68,103,.12)]">
                {current.visualTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF9FD] px-3 py-1.5 text-xs font-semibold text-[#173F76]">
                    <Check className="h-3.5 w-3.5 text-[#08A8CF]" />
                    {tag}
                  </span>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div>
            <div className="mb-7 hidden lg:block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#08A8CF]">
                Tudo conectado
              </span>

              <h3 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#173F76]">
                Do planejamento ao serviço realizado.
              </h3>

              <p className="mt-3 max-w-xl leading-relaxed text-slate-600">
                Cada perfil acessa exatamente o que precisa, enquanto todas as informações permanecem conectadas dentro da mesma operação.
              </p>
            </div>

            <Accordion type="single" value={active} onValueChange={(value) => value && setActive(value as SectionKey)} className="space-y-3">
              {SECTIONS.map((section) => {
                const isActive = active === section.key;

                return (
                  <AccordionItem key={section.key} value={section.key} className={cn("overflow-hidden rounded-[22px] border transition-all duration-300", isActive ? "border-sky-200 bg-white shadow-[0_14px_35px_rgba(4,91,137,.09)]" : "border-slate-200 bg-white/75 hover:border-sky-200 hover:bg-white")}>
                    <AccordionTrigger className="group flex w-full items-center gap-4 px-5 py-4 text-left hover:no-underline sm:px-6">
                      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-all", isActive ? `${GRADIENT} text-white shadow-md shadow-sky-900/10` : "bg-[#EAF7FD] text-[#0789C8]")}>
                        {section.icon}
                      </span>

                      <div className="min-w-0 flex-1">
                        <span className={cn("block text-base font-extrabold transition-colors", isActive ? "text-[#173F76]" : "text-slate-700")}>
                          {section.title}
                        </span>

                        {!isActive && (
                          <span className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                            Clique para conhecer
                          </span>
                        )}
                      </div>

                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all", isActive ? "bg-[#EAF7FD] text-[#0789C8]" : "bg-slate-50 text-slate-400")}>
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isActive && "rotate-180")} />
                      </span>
                    </AccordionTrigger>

                    <AccordionContent className="px-5 pb-5 sm:px-6 sm:pb-6">
                      <div className="ml-[60px] border-l-2 border-[#08A8CF] pl-5">
                        <p className="max-w-lg text-[15px] leading-relaxed text-slate-600">
                          {section.description}
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          {section.bullets.map((bullet) => (
                            <div key={bullet} className="flex items-start gap-2.5">
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E7F8FC]">
                                <Check className="h-3 w-3 text-[#079CCB]" strokeWidth={3} />
                              </span>

                              <span className="text-sm font-medium leading-snug text-slate-600">
                                {bullet}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}