"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#087BC2] via-[#078FC9] to-[#09B4D0]">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -top-24 h-[520px] w-[520px] rounded-full bg-cyan-300/10 blur-3xl" />

      <WavesPattern className="pointer-events-none absolute right-0 top-12 hidden text-white/10 lg:block" />

      <div className="mx-auto grid min-h-[650px] max-w-6xl grid-cols-1 items-center gap-8 px-4 pt-14 sm:px-6 md:grid-cols-[1.08fr_.92fr] md:pt-16">
        <div className="relative z-10 pb-14 md:pb-20">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-cyan-200" />
            Gestão inteligente para empresas de piscinas
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-[680px] text-balance text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[56px]">
            A gestão da sua empresa de piscinas{" "}
            <span className="text-[#173F76]">
              entrou em uma nova rota.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }} className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
            Organize rotas, acompanhe sua equipe, padronize atendimentos e mantenha fotos, medições e históricos de cada cliente em um único fluxo.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.14 }} className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/contato">
              <Button size="lg" className="h-12 border-0 bg-white px-6 font-bold text-[#087FC1] shadow-lg transition hover:bg-sky-50">
                Quero conhecer o Aqua Mappa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 border-white/30 bg-white/10 px-6 font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white">
                <LogIn className="mr-2 h-4 w-4" />
                Já sou cliente
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.08 }} className="relative h-[510px] md:h-[590px]">
          <div className="absolute right-[-24px] top-10 h-[480px] w-[265px] rotate-[4deg] overflow-hidden rounded-[44px] border-[7px] border-[#13243d] bg-[#101a29] shadow-[0_30px_70px_rgba(2,31,55,.35)] sm:right-5 sm:w-[285px]">
            <div className="absolute left-1/2 top-3 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-[#0b1320]" />

            <div className="absolute inset-[7px] overflow-hidden rounded-[34px] bg-white">
              <Image src="/hero.png" alt="Aplicativo Aqua Mappa" fill className="object-cover object-top" priority />
            </div>
          </div>

          <div className="absolute bottom-[-6px] left-[27%] z-20 h-[560px] w-[470px] -translate-x-1/2 sm:left-[31%] md:left-[29%]">
            <Image src="/personagem-aqua-mappa.png" alt="Técnico utilizando o Aqua Mappa" fill className="object-contain object-bottom" priority />
          </div>

          <div className="absolute bottom-[88px] right-[-3px] z-30 hidden rounded-2xl border border-white/20 bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Tudo conectado
            </p>

            <p className="mt-1 text-xs font-bold text-[#173F76]">
              Rotas • Serviços • Equipe
            </p>
          </div>

          <div className="absolute bottom-8 left-6 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}

function WavesPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M0 ${20 + i * 22}c18-11 36-11 54 0s36 11 54 0 36-11 54 0 36 11 54 0`} stroke="currentColor" strokeWidth="2" fill="none" />
      ))}
    </svg>
  );
}