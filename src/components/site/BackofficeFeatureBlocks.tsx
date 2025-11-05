// components/site/BackofficeFeatureBlocks.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import {
  CalendarCheck2,
  Route as RouteIcon,
  ClipboardList,
  ClipboardCheck,
  Users,
  MessageSquare,
  Bell,
  Camera,
  FileText,
  Receipt,
  CreditCard,
  MessageCircle,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import BackofficeFeatureTable from "@/components/site/BackofficeFeatureTable";

const GRAD = "from-[#0077C8] to-[#00AEEF]";

/** Bloco genérico com imagem à esquerda/direita */
function Block({
  flip,
  kicker,
  title,
  desc,
  bullets,
  img,
}: {
  flip?: boolean;
  kicker: string;
  title: string;
  desc: string;
  bullets: Array<{ icon: React.ReactNode; text: string }>;
  img: { src: string; alt: string };
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div
        className={cn(
          "grid items-center gap-10 md:grid-cols-2",
          flip && "md:[&>div:first-child]:order-2"
        )}
      >
        {/* Imagem */}
        <div className="flex justify-center">
          <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 p-4 ring-1 ring-slate-200">
            <div className="relative mx-auto aspect-square w-[280px] sm:w-[320px] overflow-hidden rounded-xl ring-1 ring-slate-200 bg-white">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Texto */}
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700">
            <span className={cn("h-2 w-2 rounded-full bg-gradient-to-r", GRAD)} />
            {kicker}
          </div>

          <h3 className="mt-3 text-pretty text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h3>

          <p className="mt-2 text-slate-600">{desc}</p>

          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {bullets.map((b, i) => (
              <li
                key={i}
                className="inline-flex items-start gap-2 text-sm text-slate-700 justify-center md:justify-start"
              >
                <span
                  className={cn(
                    "mt-0.5 grid h-6 w-6 place-items-center rounded-full text-white bg-gradient-to-br",
                    GRAD
                  )}
                >
                  {b.icon}
                </span>
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function BackofficeFeatureBlocks() {
  return (
    <div className="bg-white">
      <Block
        kicker="Rotas e programação"
        title="Agendamento de rotas mais fácil"
        desc="Monte rotas semanais com arrastar-e-soltar, visualize tempo e distância, defina janelas de atendimento e mantenha a agenda previsível para toda a equipe."
        bullets={[
          { icon: <RouteIcon className="h-3.5 w-3.5" />, text: "Roteirizador com mapa e distâncias" },
          { icon: <CalendarCheck2 className="h-3.5 w-3.5" />, text: "Agenda semanal e reagendamentos rápidos" },
          { icon: <ClipboardList className="h-3.5 w-3.5" />, text: "Checklists de serviço por tipo de visita" },
          { icon: <Bell className="h-3.5 w-3.5" />, text: "Alertas para atrasos e conflitos" },
        ]}
        img={{
          src: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=800&auto=format&fit=crop",
          alt: "Painel de rotas do Aqua Mappa",
        }}
      />

      <Block
        flip
        kicker="Serviços e obras maiores (em breve)"
        title="Gerencie serviços complexos com etapas, materiais e aprovações"
        desc="Para obras ou manutenções mais extensas, organize tudo em etapas, controle materiais e horas de trabalho, registre fotos e acompanhe o progresso de forma clara e centralizada."
        bullets={[
          { icon: <ClipboardCheck className="h-3.5 w-3.5" />, text: "Etapas com responsáveis e prazos definidos" },
          { icon: <FileText className="h-3.5 w-3.5" />, text: "Ordens de serviço com anexos e observações" },
          { icon: <Camera className="h-3.5 w-3.5" />, text: "Fotos por etapa e histórico completo" },
          { icon: <Settings className="h-3.5 w-3.5" />, text: "Controle de materiais e horas por etapa" },
        ]}
        img={{
          src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop",
          alt: "Controle de serviços com etapas",
        }}
      />

      <Block
        kicker="Comunicação com o cliente"
        title="Comunicação simplificada e profissional"
        desc="Envie relatórios de serviço com fotos e leituras automaticamente, notifique reagendamentos e mantenha tudo registrado com link seguro."
        bullets={[
          { icon: <MessageSquare className="h-3.5 w-3.5" />, text: "Relatório com fotos e leituras por e-mail/link" },
          { icon: <Users className="h-3.5 w-3.5" />, text: "Histórico por cliente e por visita" },
          { icon: <Bell className="h-3.5 w-3.5" />, text: "Aviso de visita realizada/reagendada" },
          { icon: <MessageCircle className="h-3.5 w-3.5" />, text: "Mensagens predefinidas e personalizáveis" },
        ]}
        img={{
          src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop",
          alt: "Relatórios e comunicação",
        }}
      />

      <Block
        flip
        kicker="Cobrança e pagamentos"
        title="Cobrança mais simples e rápida"
        desc="Gere cobranças por visita, por período ou recorrentes. Envie recibo automático e tenha visão do status — do pendente ao pago. Integrações de pagamento chegam em breve."
        bullets={[
          { icon: <Receipt className="h-3.5 w-3.5" />, text: "Cobrança por visita/recorrência" },
          { icon: <CreditCard className="h-3.5 w-3.5" />, text: "Recibo automático por e-mail" },
          { icon: <FileText className="h-3.5 w-3.5" />, text: "Exportação para planilha" },
          { icon: <CheckCircle2 className="h-3.5 w-3.5" />, text: "Integrações de pagamento (em breve)" },
        ]}
        img={{
          src: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?q=80&w=800&auto=format&fit=crop",
          alt: "Cobrança no Aqua Mappa",
        }}
      />

      {/* Tabela separada */}
      <BackofficeFeatureTable />
    </div>
  );
}
