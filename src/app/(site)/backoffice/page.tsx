import * as React from "react";
import Image from "next/image";
import type { Metadata } from "next";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ResourcePageHero from "@/components/site/ResourcePageHero";
import ResourcePageNav from "@/components/site/ResourcePageNav";
import BackofficeFeatureBlocks from "@/components/site/BackofficeFeatureBlocks";

export const metadata: Metadata = {
  title: "Painel de Gestão — Aqua Mappa",
  description: "Planeje rotas, organize técnicos, acompanhe atendimentos e mantenha toda a sua operação conectada.",
};

export default function BackofficePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <ResourcePageHero
        eyebrow="Painel de gestão"
        title={
          <>
            Toda a sua operação,{" "}
            <span className="text-[#173F76]">
              em uma única visão.
            </span>
          </>
        }
        description="Planeje rotas, organize sua equipe, acompanhe os atendimentos e mantenha clientes, serviços e históricos conectados em um único painel."
        whatsappMessage="Olá! Gostaria de conhecer o painel de gestão do Aqua Mappa."
        visual={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-[520px] overflow-hidden rounded-[30px] border border-white/20 bg-white/10 p-3 shadow-[0_30px_70px_rgba(2,31,55,.25)] backdrop-blur">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-white">
                <Image src="/hero-backoffice-b.png" alt="Painel de gestão Aqua Mappa" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        }
      />

      <BackofficeFeatureBlocks />

      <ResourcePageNav current="backoffice" />

      <Footer />
    </div>
  );
}