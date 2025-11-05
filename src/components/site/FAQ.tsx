"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const GRADIENT = "bg-gradient-to-br from-[#0077C8] to-[#00AEEF]";

export default function FAQ() {
  const list = [
    {
      q: "Para quem o Aqua Mappa é ideal?",
      a: "Para empresas de manutenção de piscinas de qualquer porte que desejam digitalizar a operação, otimizar rotas, organizar o dia a dia e crescer gerenciando tudo em um único sistema.",
    },
    {
      q: "Quanto custa o Aqua Mappa?",
      a: "O Aqua Mappa é cobrado mensalmente por local de serviço. Consulte a nossa página de valores para mais detalhes.",
    },
    {
      q: "O Aqua Mappa tem suporte ao cliente?",
      a: "Sim. Temos suporte especializado no setor de piscinas, com atendimento humano e acessível para ajudar em cada etapa — nada de chatbot quando você precisa falar com alguém de verdade.",
    },
    {
      q: "O Aqua Mappa tem aplicativo para celular?",
      a: "Sim. O app do técnico (Android) ajuda a reduzir deslocamentos e papelada, manter o cronograma em dia e registrar leituras e dosagens em poucos toques.",
    },
    {
      q: "Posso fazer cobranças no Aqua Mappa?",
      a: "Sim. O módulo de cobrança ajuda a receber mais rápido, melhorar fluxo de caixa e simplificar o processamento de pagamentos e a gestão financeira. (Em breve)",
    },
    {
      q: "O Aqua Mappa funciona offline?",
      a: "O app dos técnicos funciona online ou offline e sincroniza os dados com o painel do escritório assim que a conexão é restabelecida.",
    },
  ];

  const [active, setActive] = React.useState<string | undefined>(undefined);

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-gradient-to-b from-[#0077C8] to-[#00AEEF] py-20 text-slate-900"
    >
      {/* Marca d’água no fundo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <span className="select-none text-[16vw] font-black leading-none tracking-tight text-white/10">
          PERGUNTAS
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Título */}
        <div className="mx-auto max-w-3xl text-center text-white">
          <h2 className="text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
            Perguntas frequentes
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Tudo o que você precisa saber antes de começar
          </p>
        </div>

        {/* Accordion branco */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-100 bg-white/95 shadow-xl backdrop-blur-sm">
          <Accordion
            type="single"
            collapsible
            value={active}
            onValueChange={setActive}
            className="divide-y divide-slate-200"
          >
            {list.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={item.q}
                className={cn(
                  "px-4 sm:px-6",
                  i === 0 && "rounded-t-2xl",
                  i === list.length - 1 && "rounded-b-2xl"
                )}
              >
                <AccordionTrigger className="group flex w-full items-center gap-3 py-4 text-left text-base font-semibold text-slate-900 hover:no-underline">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm",
                      GRADIENT
                    )}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <span>{item.q}</span>
                  <ChevronDown className="ml-auto h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </AccordionTrigger>

                <AccordionContent className="pb-4 text-[15px] text-slate-600">
                  <div className="relative pl-4">
                    <span
                      className={cn(
                        "absolute left-0 top-0 h-full w-[3px] rounded",
                        GRADIENT
                      )}
                    />
                    <p>{item.a}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
