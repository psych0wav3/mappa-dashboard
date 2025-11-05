"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Waves, ArrowRight, CalendarClock } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--ac-blue-700)" }} // fundo sólido azul-escuro (sem degradê)
    >
      {/* ondas decorativas – canto direito */}
      <WavesPattern className="pointer-events-none absolute -right-6 top-10 hidden text-white/15 md:block" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        {/* Texto */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            O software&nbsp;nº&nbsp;1 para{" "}
            <span className="text-amber-400">fidelizar mais clientes</span> de
            manutenção de piscinas
          </motion.h1>

          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Economize tempo, aumente a receita e ofereça uma experiência
            impecável ao cliente com o Aqua Mappa: rotas, checklists com fotos,
            leituras e cobrança — tudo em um só lugar.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/pricing">
              <Button className="btn-brand border-0 shadow-sm inline-flex items-center gap-2">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/contato">
              <Button className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-white/90">
                <CalendarClock className="h-4 w-4" />
                Agendar demo
              </Button>
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-3 text-xs text-white/70">
            <span>Sem burocracia</span>
            <span className="h-1 w-1 rounded-full bg-white/50" />
            <span>7 dias grátis</span>
            <span className="h-1 w-1 rounded-full bg-white/50" />
            <span>Cancelamento a qualquer momento</span>
          </div>
        </div>

        {/* Imagem */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <Card className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border-0 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,.35)] backdrop-blur">
            <CardContent className="p-0">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src="/hero-pool.jpg"
                  alt="Aqua Mappa em uso no campo"
                  fill
                  className="object-cover"
                  priority
                />
                {/* leve vinheta para destacar a tela */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
              </div>
            </CardContent>
          </Card>

          {/* ondas decorativas – canto inferior esquerdo da imagem */}
          <WavesPattern className="pointer-events-none absolute -left-8 -bottom-8 hidden rotate-6 text-white/15 md:block" />
        </motion.div>
      </div>
    </section>
  );
}

/* ====== pequeno componente de “ondas” ====== */
function WavesPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={i}
          d={`M0 ${10 + i * 18}c12-8 24-8 36 0s24 8 36 0 24-8 36 0 24 8 36 0`}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          opacity="1"
        />
      ))}
    </svg>
  );
}
