// components/site/ClientsFeatureBlocks.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Mail,
  CreditCard,
  MessagesSquare,
  Link2,
  Quote,
  Megaphone,
  ChevronRight,
} from "lucide-react";

/* Bloco reutilizável */
function Block({
  flip,
  kicker,
  title,
  desc,
  img,
}: {
  flip?: boolean;
  kicker: string;
  title: string;
  desc: string;
  img: { src: string; alt: string };
}) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-2",
        flip && "md:[&>*:first-child]:order-2"
      )}
    >
      {/* imagem: quadrada e centralizada */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-[420px] aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-4 shadow-sm">
          <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 420px"
              priority={false}
            />
          </div>
        </div>
      </div>

      {/* texto */}
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700">
          {kicker}
        </div>
        <h3 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h3>
        <p className="mt-3 text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

export default function ClientsFeatureBlocks() {
  return (
    <section className="relative overflow-hidden py-6">
      {/* linha 1 */}
      <Block
        kicker={
          <span className="inline-flex items-center gap-1">
            <Megaphone className="h-3.5 w-3.5 text-sky-600" />
            Alcance rápido
          </span> as unknown as string
        }
        title="Avise seus clientes de forma rápida e segmentada"
        desc="Envie lembretes, comunicados de manutenção ou alterações de agenda para todos os clientes ou apenas um grupo específico. Menos dúvidas, mais previsibilidade para a operação."
        img={{
          src: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=900&auto=format&fit=crop",
          alt: "Envio de comunicados aos clientes",
        }}
      />

      {/* linha 2 */}
      <Block
        flip
        kicker={
          <span className="inline-flex items-center gap-1">
            <Mail className="h-3.5 w-3.5 text-sky-600" />
            Relatórios automáticos
          </span> as unknown as string
        }
        title="Relatórios de serviço por e-mail — automaticamente"
        desc="Após cada visita, seus clientes recebem um relatório bonito e padronizado com fotos, leituras e observações. Transparência que gera confiança sem trabalho extra."
        img={{
          src: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=900&auto=format&fit=crop",
          alt: "Relatório por e-mail",
        }}
      />

      {/* linha 3 */}
      <Block
        kicker={
          <span className="inline-flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5 text-sky-600" />
            Cobranças simples
          </span> as unknown as string
        }
        title="Pagamentos e faturamento super simples"
        desc="Transforme visitas e serviços em faturas, revise e envie em segundos e receba online. Seus clientes têm uma experiência digital, e você acelera o fluxo de caixa."
        img={{
          src: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=900&auto=format&fit=crop",
          alt: "Faturamento e pagamentos",
        }}
      />

      {/* linha 4 */}
      <Block
        flip
        kicker={
          <span className="inline-flex items-center gap-1">
            <Quote className="h-3.5 w-3.5 text-sky-600" />
            Orçamentos & contratos
          </span> as unknown as string
        }
        title="Orçamentos claros e cobrança transparente"
        desc="Envie orçamentos com fotos e anexos, colete aprovações e gere a fatura automaticamente ao finalizar o serviço. Sem surpresas — tudo registrado."
        img={{
          src: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=900&auto=format&fit=crop",
          alt: "Orçamentos e contratos",
        }}
      />
      

      {/* linha 5 */}
      <Block
        kicker={
          <span className="inline-flex items-center gap-1">
            <Link2 className="h-3.5 w-3.5 text-sky-600" />
            Portal do cliente
          </span> as unknown as string
        }
        title="Portal do cliente: histórico, faturas e pagamentos"
        desc="Dê acesso seguro ao histórico de serviços, faturas, comprovantes e cotações — com botão de pagamento. Reduz chamadas e melhora a experiência."
        img={{
          src: "https://images.unsplash.com/photo-1555421689-43cad7100750?q=80&w=900&auto=format&fit=crop",
          alt: "Portal do cliente",
        }}
      />

      {/* CTA leve (opcional) */}
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-2 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-sky-50/60 p-5 text-center text-slate-800">
          Pronto para oferecer uma experiência 5★ aos seus clientes?
          <a
            href="/valores"
            className="ml-2 inline-flex items-center font-medium text-[color:var(--ac-blue-700,#036aa1)] hover:underline"
          >
            Ver planos
            <ChevronRight className="ml-0.5 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
