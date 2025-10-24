"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(14,165,233,0.18)_0%,rgba(14,165,233,0)_70%)]" />
      <div className="mx-auto max-w-5xl rounded-3xl border border-sky-200 bg-white/70 p-8 text-center shadow sm:p-10">
        <h3 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          Pronto para mergulhar no Aqqua?
        </h3>
        <p className="mt-2 text-slate-600">
          Cadastre-se e teste por 7 dias. Sem cartão de crédito.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/login" className="inline-flex items-center gap-2">
              Criar minha conta <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/features">Ver como funciona</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
