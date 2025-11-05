// components/site/BillingFeatureBlocks.tsx
"use client";

import * as React from "react";
import { Banknote, CreditCard, Clock3, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Bullet = { icon: React.ReactNode; text: string };
type Img = { src: string; alt: string };

function Block({
  title,
  desc,
  bullets,
  img,
  disabled = false,
  flip = false,
}: {
  title: string;
  desc: string;
  bullets: Bullet[];
  img: Img;
  disabled?: boolean;
  /** Alterna a posição: imagem ↔ texto (para manter o zigue-zague da página de Clientes) */
  flip?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-2",
      )}
    >
      {/* Imagem */}
      <div
        className={cn(
          "flex justify-center md:justify-start",
          flip && "md:order-2 md:justify-end",
        )}
      >
        <div className="aspect-[4/3] w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.alt}
            className={cn(
              "h-full w-full object-cover",
              disabled && "opacity-70 grayscale",
            )}
          />
        </div>
      </div>

      {/* Texto */}
      <div className={cn(flip && "md:order-1")}>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-slate-600">{desc}</p>

        <ul className="mt-4 space-y-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px]">
              <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                {b.icon}
              </span>
              <span className={cn(disabled && "opacity-70")}>{b.text}</span>
            </li>
          ))}
        </ul>

        {disabled && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
            <Clock3 className="h-4 w-4" />
            Em desenvolvimento — disponível em breve
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillingFeatureBlocks() {
  return (
    <section
      className={cn(
        "relative overflow-hidden py-16",
        // leve faixa azul no fundo (igual tom da página de Clientes)
        "before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(0,119,200,0.08)_0%,rgba(0,174,239,0)_70%)]"
      )}
    >
      <div className="mx-auto grid max-w-6xl gap-16">
        {/* Bloco 1: Imagem à esquerda, texto à direita */}
        <Block
          title="Ofereça múltiplas formas de pagamento"
          desc="Cartão de crédito, Pix/transferência, carteira digital e registro de pagamentos manuais — tudo integrado ao histórico do cliente."
          bullets={[
            {
              icon: <CreditCard className="h-3.5 w-3.5" />,
              text: "Cartão e carteiras digitais (ex.: Apple/Google Pay)",
            },
            {
              icon: <Banknote className="h-3.5 w-3.5" />,
              text: "Pix/transferência e registro de dinheiro/cheque",
            },
            {
              icon: <Lock className="h-3.5 w-3.5" />,
              text: "Processamento seguro e transparente de taxas",
            },
          ]}
          img={{
            src: "https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=1200&auto=format&fit=crop",
            alt: "Opções de pagamento no painel",
          }}
          disabled
        />

        {/* Bloco 2: alternado (imagem à direita, texto à esquerda) */}
        <Block
          flip
          title="Melhore o fluxo de caixa com faturamento automático e Autopay"
          desc="Gere faturas com base nas visitas e nas ordens de serviço e ative cobrança automática para clientes recorrentes."
          bullets={[
            {
              icon: <Clock3 className="h-3.5 w-3.5" />,
              text: "Geração automática de faturas por período",
            },
            {
              icon: <CreditCard className="h-3.5 w-3.5" />,
              text: "Autopay (cobrança recorrente) para clientes elegíveis",
            },
            {
              icon: <Banknote className="h-3.5 w-3.5" />,
              text: "Conciliação simples e relatórios de recebíveis",
            },
          ]}
          img={{
            src: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1200&auto=format&fit=crop",
            alt: "Faturamento recorrente e autopay",
          }}
          disabled
        />
      </div>
    </section>
  );
}
