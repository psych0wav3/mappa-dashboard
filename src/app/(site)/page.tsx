import * as React from "react";
import type { Metadata } from "next";

import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
//import LogosStrip from "@/components/site/LogosStrip";
import BenefitsSection from "@/components/site/BenefitsSection";
import FeatureShowcase from "@/components/site/FeatureShowcase";
import PricingTable from "@/components/site/PricingTable";
import FAQ from "@/components/site/FAQ";
import CTA from "@/components/site/CTA";
import Footer from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Aqua Mappa",
  description:
    "Rotas, checklists com fotos, leituras e cobrança — tudo em um só lugar.",
  openGraph: {
    title: "Aqua Mappa — Gestão inteligente para empresas de piscina",
    description:
      "Rotas, checklists com fotos, leituras e cobrança — tudo em um só lugar.",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white text-slate-900">
      <Navbar />
      <Hero />

      <BenefitsSection />
      <PricingTable />
      <FeatureShowcase />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
