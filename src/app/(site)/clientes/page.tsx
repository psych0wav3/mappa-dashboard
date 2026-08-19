import * as React from "react";
import type { Metadata } from "next";
import { Camera, CheckCircle2, ClipboardCheck } from "lucide-react";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ResourcePageHero from "@/components/site/ResourcePageHero";
import ResourcePageNav from "@/components/site/ResourcePageNav";
import ClientsFeatureBlocks from "@/components/site/ClientsFeatureBlocks";

export const metadata: Metadata = {
  title: "Recursos para Clientes — Aqua Mappa",
  description: "Mais transparência, histórico e profissionalismo em cada atendimento.",
};

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <ResourcePageHero
        eyebrow="Experiência do cliente"
        title={
          <>
            Mais transparência.{" "}
            <span className="text-[#173F76]">Mais valor para o seu serviço.</span>
          </>
        }
        description="Organize o histórico de cada piscina, registre os atendimentos e entregue uma experiência mais clara e profissional para seus clientes."
        whatsappMessage="Olá! Gostaria de conhecer os recursos do Aqua Mappa para melhorar a experiência dos meus clientes."
        visual={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-[470px] rounded-[30px] border border-white/20 bg-white/95 p-6 shadow-[0_28px_60px_rgba(2,31,55,.20)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08A8CF]">Atendimento concluído</p>
                  <p className="mt-1 text-xl font-extrabold text-[#173F76]">Residência Silva</p>
                </div>

                <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-50 text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <HeroRow icon={<ClipboardCheck className="h-4 w-4" />} label="Checklist" value="Concluído" />
                <HeroRow icon={<Camera className="h-4 w-4" />} label="Fotos do serviço" value="4 registros" />
                <HeroRow icon={<CheckCircle2 className="h-4 w-4" />} label="Histórico" value="Atualizado" />
              </div>

              <p className="mt-5 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-500">
                Fotos, medições e informações do serviço permanecem organizadas no histórico do cliente.
              </p>
            </div>
          </div>
        }
      />

      <ClientsFeatureBlocks />
      <ResourcePageNav current="clientes" />
      <Footer />
    </div>
  );
}

function HeroRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#F5FBFE] px-4 py-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#0789C8]">{icon}</span>

      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-bold text-[#173F76]">{value}</p>
      </div>

      <CheckCircle2 className="h-4 w-4 text-[#08A8CF]" />
    </div>
  );
}