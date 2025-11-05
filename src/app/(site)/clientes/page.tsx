import * as React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ClientsFeatureBlocks from "@/components/site/ClientsFeatureBlocks";
import BackofficeFeatureTable from "@/components/site/BackofficeFeatureTable";

export const metadata: Metadata = {
  title: "Back Office — Aqua Mappa",
  description: "Painel web: rotas, checklists, clientes e faturamento.",
};

export default function BackofficePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* Seção com fundo azul em degradê */}
      <section
        className="w-full bg-gradient-to-r from-[#0077C8] to-[#00AEEF] text-white"
      >
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 text-center sm:text-left">
          <h1 className="text-pretty text-4xl font-extrabold tracking-tight">
            Recursos para Clientes
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-white/90">
            Mantenha clientes informados com relatórios automáticos, portal
            self-service e uma comunicação simples e profissional.
          </p>
        </div>
      </section>

      {/* Blocos da área */}
      <ClientsFeatureBlocks />

      <BackofficeFeatureTable />

      <Footer />
    </div>
  );
}
