import * as React from "react";
import { ArrowRight, CheckCircle2, Receipt } from "lucide-react";
import type { Metadata } from "next";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ResourcePageHero from "@/components/site/ResourcePageHero";
import ResourcePageNav from "@/components/site/ResourcePageNav";
import BillingFeatureBlocks from "@/components/site/BillingFeatureBlocks";

export const metadata: Metadata = {
  title: "Cobrança e Pagamentos — Aqua Mappa",
  description: "Em desenvolvimento: faturamento e cobrança conectados aos serviços realizados.",
};

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <ResourcePageHero
        eyebrow="Cobrança e pagamentos"
        badge="Em desenvolvimento"
        title={
          <>
            Cobrança integrada ao{" "}
            <span className="text-[#173F76]">
              Aqua Mappa.
            </span>
          </>
        }
        description="Estamos preparando uma experiência para conectar serviços realizados, faturamento e cobrança dentro do mesmo fluxo."
        whatsappMessage="Olá! Gostaria de saber mais sobre os recursos de cobrança e pagamentos que estão sendo desenvolvidos no Aqua Mappa."
        secondaryHref="/pricing"
        secondaryLabel="Conhecer os planos"
        visual={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-[500px]">
              <div className="flex items-center justify-between">
                <FlowStep icon={<CheckCircle2 className="h-5 w-5" />} label="Serviço" />
                <ArrowRight className="h-5 w-5 text-white/40" />
                <FlowStep icon={<Receipt className="h-5 w-5" />} label="Fatura" />
                <ArrowRight className="h-5 w-5 text-white/40" />
                <FlowStep icon={<CheckCircle2 className="h-5 w-5" />} label="Recebimento" />
              </div>

              <p className="mt-8 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                Um fluxo financeiro conectado à operação
              </p>
            </div>
          </div>
        }
      />

      <BillingFeatureBlocks />
      <ResourcePageNav current="cobranca" />
      <Footer />
    </div>
  );
}

function FlowStep({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur">
        {icon}
      </span>

      <span className="text-sm font-bold text-white">
        {label}
      </span>
    </div>
  );
}