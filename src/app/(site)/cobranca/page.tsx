// app/(site)/cobranca/page.tsx
import * as React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import BillingFeatureBlocks from "@/components/site/BillingFeatureBlocks";
import BackofficeFeatureTable from "@/components/site/BackofficeFeatureTable";


export const metadata: Metadata = {
  title: "Cobrança e Pagamentos — Aqua Mappa",
  description:
    "Em breve: emissão automática, Autopay e múltiplas formas de pagamento.",
};

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* Hero azul no topo (mesmo padrão da página de Clientes) */}
      <section className="bg-gradient-to-b from-[#0092E4] to-[#0077C8] py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-50/10 px-3 py-1 text-xs font-medium text-amber-100">
            Em breve
          </div>
          <h1 className="mt-3 text-pretty text-4xl font-extrabold tracking-tight">
            Cobrança e Pagamentos
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-white/90">
            Centralize a cobrança, ofereça mais formas de pagamento e acelere o
            recebimento. Esta funcionalidade está em desenvolvimento e será
            liberada em breve para todos os clientes.
          </p>
        </div>
      </section>

      <BillingFeatureBlocks />

      <BackofficeFeatureTable />


      <Footer />
    </div>
  );
}
