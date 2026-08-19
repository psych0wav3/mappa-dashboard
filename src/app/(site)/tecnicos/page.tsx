import * as React from "react";
import Image from "next/image";
import type { Metadata } from "next";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ResourcePageHero from "@/components/site/ResourcePageHero";
import ResourcePageNav from "@/components/site/ResourcePageNav";
import TechniciansFeatureBlocks from "@/components/site/TechniciansFeatureBlocks";

export const metadata: Metadata = {
  title: "Recursos para Técnicos — Aqua Mappa",
  description: "Rotas, serviços, checklists, fotos e medições na mão do técnico.",
};

export default function TechniciansPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <ResourcePageHero
        eyebrow="App dos técnicos"
        title={
          <>
            Menos papelada.{" "}
            <span className="text-[#173F76]">
              Mais serviço feito.
            </span>
          </>
        }
        description="O técnico recebe sua rota, executa o atendimento e registra tudo diretamente pelo celular, em um fluxo simples e organizado."
        whatsappMessage="Olá! Gostaria de conhecer o aplicativo do Aqua Mappa para técnicos."
        visual={
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute bottom-[-85px] right-[25px] h-[470px] w-[390px]">
              <Image
                src="/personagem-aqua-mappa.png"
                alt="Técnico Aqua Mappa"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>

            <div className="absolute bottom-8 left-3 flex gap-5 text-sm font-semibold text-white/80">
              <span>Rotas</span>
              <span>•</span>
              <span>Checklists</span>
              <span>•</span>
              <span>Fotos e medições</span>
            </div>
          </div>
        }
      />

      <TechniciansFeatureBlocks />
      <ResourcePageNav current="tecnicos" />
      <Footer />
    </div>
  );
}