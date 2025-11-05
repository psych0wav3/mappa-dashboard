import * as React from "react";
import type { Metadata } from "next";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import PricingTable from "@/components/site/PricingTable";
import CTA from "@/components/site/CTA";

export const metadata: Metadata = {
  title: "Planos e Preços — Aqua Mappa",
  description:
    "Planos simples, sem surpresa. Comece hoje e faça upgrade quando precisar.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <h1 className="text-pretty text-4xl font-extrabold tracking-tight">
          Planos que crescem com você
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-600">
          Escolha o plano ideal agora e mude quando precisar — sem fidelidade.
        </p>
      </section>
      <PricingTable />
      <CTA />
      <Footer />
    </div>
  );
}
