import * as React from "react";
import type { Metadata } from "next";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import FeatureShowcase from "@/components/site/FeatureShowcase";
import FAQ from "@/components/site/FAQ";

export const metadata: Metadata = {
  title: "Recursos — Aqua Mappa",
  description:
    "Veja em detalhes os recursos do Aqua Mappa: rotas, app do técnico, checklists com fotos e cobranças.",
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <h1 className="text-pretty text-4xl font-extrabold tracking-tight">
          Tudo que sua operação precisa
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-600">
          Do planejamento ao checkout: reduza deslocamentos, padronize execuções
          no campo e garanta registro com fotos e leituras.
        </p>
      </section>

      <FeatureShowcase />

      {/* FAQ em largura total */}
      <div className="w-full">
        <FAQ />
      </div>

      <Footer />
    </div>
  );
}
