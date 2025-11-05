"use client";

import * as React from "react";
import Image from "next/image";
import {
  MapPinned,
  CheckSquare,
  Contact,
  FlaskConical,
  Calculator,
  PlugZap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Bloco reutilizável (imagem quadrada e layout alternado) */
function Block({
  kicker,
  title,
  desc,
  bullets,
  img,
  flip = false,
}: {
  kicker: string;
  title: string;
  desc: string;
  bullets: { icon: React.ReactNode; text: string }[];
  img: { src: string; alt: string };
  flip?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-2",
        flip && "md:[&>*:first-child]:order-2"
      )}
    >
      {/* imagem quadrada e menor, centralizada */}
      <div className="flex items-center justify-center">
        <div className="relative aspect-square w-[300px] sm:w-[340px] rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover"
            sizes="340px"
          />
        </div>
      </div>

      <div>
        <div className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
          {kicker}
        </div>
        <h3 className="mt-1 text-pretty text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-slate-600">{desc}</p>

        <ul className="mt-4 grid gap-2">
          {bullets.map((b, i) => (
            <li key={i} className="inline-flex items-start gap-2 text-[15px] text-slate-700">
              <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-sky-50 text-sky-600 border border-sky-100">
                {b.icon}
              </span>
              <span className="leading-snug">{b.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function TechniciansFeatureBlocks() {
  return (
    <section className="py-10">
      {/* 1. Rotas em campo */}
      <Block
        kicker="Rotas em campo (online e offline)"
        title="Roteirização no celular, com ou sem internet"
        desc="O técnico visualiza a rota do dia, navega até a piscina, registra check-in/checkout e continua trabalhando mesmo sem sinal — os dados sincronizam quando a conexão volta."
        bullets={[
          { icon: <MapPinned className="h-3.5 w-3.5" />, text: "Navegação e rota do dia" },
          { icon: <MapPinned className="h-3.5 w-3.5" />, text: "Check-in/checkout com carimbo de data" },
          { icon: <MapPinned className="h-3.5 w-3.5" />, text: "Operação offline com sincronização" },
        ]}
        img={{
          src: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=800&auto=format&fit=crop",
          alt: "Rota no app do técnico",
        }}
      />

      {/* 2. Checklists e tarefas */}
      <Block
        flip
        kicker="Execução padronizada"
        title="Checklists, tarefas e fotos — tudo em poucos toques"
        desc="Defina checklists por cliente, local ou tipo de serviço. Exija foto para concluir uma etapa, personalize ordem e respostas e garanta a consistência do serviço."
        bullets={[
          { icon: <CheckSquare className="h-3.5 w-3.5" />, text: "Checklists por cliente/local/serviço" },
          { icon: <CheckSquare className="h-3.5 w-3.5" />, text: "Respostas personalizadas e obrigatórias" },
          { icon: <CheckSquare className="h-3.5 w-3.5" />, text: "Fotos antes/depois por etapa" },
        ]}
        img={{
          src: "https://images.unsplash.com/photo-1512914890250-88ac89de4742?q=80&w=800&auto=format&fit=crop",
          alt: "Checklist do técnico",
        }}
      />

      {/* 3. Cadastro completo do cliente na mão */}
      <Block
        kicker="Informações do cliente na palma da mão"
        title="Histórico, leituras e observações sempre acessíveis"
        desc="O técnico vê tudo: códigos de portão, preferências, equipamentos, fotos e histórico de leituras. Menos retornos ao escritório e mais autonomia em campo."
        bullets={[
          { icon: <Contact className="h-3.5 w-3.5" />, text: "Dados do cliente e das piscinas" },
          { icon: <Contact className="h-3.5 w-3.5" />, text: "Histórico de visitas e fotos" },
          { icon: <Contact className="h-3.5 w-3.5" />, text: "Observações e instruções especiais" },
        ]}
        img={{
          src: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=800&auto=format&fit=crop",
          alt: "Informações do cliente no app",
        }}
      />

      {/* 4. Leituras e dosagens em 1 toque */}
      <Block
        flip
        kicker="Leituras e dosagens"
        title="Registre leituras e dosagens com 1 toque"
        desc="Registre pH, cloro, alcalinidade e demais parâmetros rapidamente — e informe dosagens com base nas leituras, tudo direto no app."
        bullets={[
          { icon: <FlaskConical className="h-3.5 w-3.5" />, text: "Leituras rápidas de parâmetros" },
          { icon: <FlaskConical className="h-3.5 w-3.5" />, text: "Dosagens sugeridas e registradas" },
          { icon: <FlaskConical className="h-3.5 w-3.5" />, text: "Histórico por cliente e por piscina" },
        ]}
        img={{
          src: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
          alt: "Leituras e dosagens",
        }}
      />
    </section>
  );
}
