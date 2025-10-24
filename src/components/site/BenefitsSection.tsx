"use client";

import * as React from "react";
import { Route as RouteIcon, Users, Camera, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function BenefitsSection() {
  const items = [
    { icon: <RouteIcon className="h-5 w-5" />, title: "Rotas otimizadas", desc: "Monte rotas semanais e ad-hoc, veja distâncias e ordem ideal." },
    { icon: <Users className="h-5 w-5" />, title: "Atribuição de técnicos", desc: "Distribua visitas por técnico e acompanhe em tempo real." },
    { icon: <Camera className="h-5 w-5" />, title: "Checklists com fotos", desc: "Antes/Depois, leituras químicas e histórico por cliente." },
    { icon: <ShieldCheck className="h-5 w-5" />, title: "Confiabilidade", desc: "Dados seguros, logs e trilha de auditoria por visita." },
  ];

  return (
    <section id="benefits" className="relative overflow-hidden bg-white">
      {/* Marca d’água no fundo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <span className="select-none text-[16vw] font-black leading-none tracking-tight text-slate-100">
          BENEFÍCIOS
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {/* Título */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-pretty text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Tudo que você precisa para gerenciar seu negócio de serviços de piscina, em um só app.
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Menos planilhas, menos ligações no improviso. Mais previsibilidade para sua agenda e seu caixa.
          </p>
        </div>

        {/* Linha + itens */}
        <div className="relative mt-16">
          {/* linha que atravessa os bullets */}
          <div className="absolute top-2 left-0 right-0 h-px bg-slate-200" />

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-4">
            {items.map((it, i) => {
              const num = String(i + 1).padStart(2, "0");
              return (
                <motion.div
                  key={it.title}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* bullet azul alinhado com a linha */}
                  <div className="absolute -top-[2px] flex flex-col items-center">
                    <div className="h-4 w-4 rounded-full bg-[color:var(--ac-blue-500,#38bdf8)] ring-2 ring-white border border-slate-200" />
                  </div>

                  {/* ícone + número abaixo */}
                  <div className="mt-8 flex items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-sky-50">
                      {it.icon}
                    </div>
                    <span className="text-lg font-semibold text-slate-400">{num}</span>
                  </div>

                  <h3 className="mt-3 text-base font-semibold text-slate-900">{it.title}</h3>
                  <p className="mt-1 max-w-[26ch] text-sm leading-relaxed text-slate-600">
                    {it.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
