"use client";

import * as React from "react";
import { Route as RouteIcon, ClipboardCheck, Camera } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  {
    icon: RouteIcon,
    title: "Rotas inteligentes",
    desc: "Organize a agenda dos técnicos, planeje os atendimentos e tenha mais controle sobre a operação da semana.",
  },
  {
    icon: ClipboardCheck,
    title: "Serviços e checklists",
    desc: "Padronize os atendimentos e garanta que nenhuma etapa importante seja esquecida durante o serviço.",
  },
  {
    icon: Camera,
    title: "Fotos e medições",
    desc: "Registre fotos, medições e informações de cada atendimento e mantenha o histórico de cada cliente organizado.",
  },
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="relative overflow-hidden bg-[#EAF7FD] py-20 sm:py-24">
      <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#079CCB]">
            Tudo em um só lugar
          </span>

          <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-[#173F76] sm:text-5xl">
            Tudo que você precisa,{" "}
            <span className="text-[#08A8CF]">
              em um único app.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Menos informações espalhadas e mais clareza para sua equipe trabalhar todos os dias.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ delay: index * 0.08 }} className="group rounded-[28px] border border-white/80 bg-white p-7 shadow-[0_15px_40px_rgba(6,107,157,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(6,107,157,.14)]">
                <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#078FCA] to-[#08B7D4] shadow-lg shadow-cyan-900/10">
                  <Icon className="h-10 w-10 text-white" strokeWidth={1.8} />
                </div>

                <div className="mt-7 flex items-center gap-3">
                  <span className="text-xs font-bold tracking-[0.18em] text-[#08A8CF]">
                    0{index + 1}
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-[#173F76]">
                  {item.title}
                </h3>

                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-2xl font-extrabold text-[#173F76] sm:text-3xl">
            Mais produtividade. Mais qualidade.
          </p>
        </div>
      </div>
    </section>
  );
}