"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, ShieldCheck, Sparkles, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-white py-20">
      {/* fundo suave da seção */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(0,119,200,0.05)_0%,rgba(0,174,239,0)_70%)]"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* 🔹 CARD sem borda, com fundo azulado suave */}
        <div className="mx-auto max-w-4xl rounded-3xl px-8 py-12 text-center shadow-xl sm:px-12">
          <div className="mx-auto mb-3 w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700">
            7 dias grátis • Sem cartão de crédito
          </div>

          <h3 className="text-balance text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            Pronto para{" "}
            <span className="bg-gradient-to-r from-[#0077C8] to-[#00AEEF] bg-clip-text text-transparent">
              mergulhar no Aqqua Mappa?
            </span>
          </h3>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Teste gratuitamente o painel web e o app dos técnicos.
            Simplifique rotas, checklists e relatórios com fotos — tudo em um só lugar.
          </p>

          {/* Botões */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {/* Criar conta */}
            <Link href="/login" className="inline-block">
              <Button
                size="lg"
                className={cn(
                  "h-11 px-6 text-base font-medium",
                  "bg-gradient-to-r from-[#0077C8] to-[#00AEEF] text-white shadow-md",
                  "transition-all hover:opacity-95"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  Criar minha conta <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </Link>

            {/* Google Play */}
            <Link
              href="https://play.google.com/store/apps/details?id=com.aquacheck"
              target="_blank"
              className="inline-block"
            >
              <span className="relative inline-flex h-11 items-center rounded-md p-[2px]">
                {/* borda degradê externa */}
                <span
                  className="absolute inset-0 rounded-md bg-gradient-to-r from-[#0077C8] to-[#00AEEF]"
                  aria-hidden
                />
                {/* corpo branco */}
                <span className="relative inline-flex h-full items-center justify-center gap-2 rounded-[calc(theme(borderRadius.md)-2px)] bg-white px-6 text-base font-medium text-[#0077C8] shadow-sm transition-all hover:bg-sky-50 hover:opacity-95">
                  <Download className="h-4 w-4" />
                  Google Play
                </span>
              </span>
            </Link>
          </div>

          {/* Selos */}
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-700">
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Sem fidelidade
            </li>
            <li className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-sky-600" />
              Cancelamento a qualquer momento
            </li>
            <li className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Onboarding assistido
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
