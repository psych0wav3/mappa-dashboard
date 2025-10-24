import * as React from "react";
import { CheckCircle2, Droplets, ShieldCheck, Camera, Receipt } from "lucide-react";
import Image from "next/image";

export default function FeatureShowcase() {
  const feats = [
    {
      icon: <Droplets className="h-5 w-5" />,
      title: "Água sempre cristalina",
      desc: "Checklists digitais e padrão de execução garantem a qualidade do tratamento em cada visita.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Mais segurança para sua família",
      desc: "Leituras químicas registradas mantêm a água equilibrada, evitando riscos à saúde e irritações.",
    },
    {
      icon: <Camera className="h-5 w-5" />,
      title: "Transparência total",
      desc: "Fotos de antes e depois e histórico de serviços, para você acompanhar tudo o que foi feito.",
    },
    {
      icon: <Receipt className="h-5 w-5" />,
      title: "Pagamento simples",
      desc: "Cobranças organizadas e recibos após cada visita — sem surpresas no fim do mês.",
    },
  ];

  return (
    // mantive o id="features" para não quebrar âncoras existentes
    <section id="features" className="bg-slate-50/60 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-2">
        {/* Texto (benefícios do dono da piscina) */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow">
            <CheckCircle2 className="h-4 w-4" /> BENEFÍCIOS PARA O DONO DA PISCINA
          </div>
          <h2 className="mt-4 text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
            Mais qualidade, segurança e transparência no cuidado da sua piscina.
          </h2>
          <p className="mt-3 text-slate-600">
            Com empresas e profissionais que usam o <strong>Aqqua</strong>, você tem a tranquilidade
            de um serviço padronizado, com registros claros de cada visita. Acompanhe fotos, leituras
            e o histórico do seu atendimento — tudo para manter a água no ponto e sua família segura.
          </p>

          {/* Lista de benefícios em 2 colunas no desktop */}
          <ul className="mt-6 grid grid-cols-1 gap-4 text-sm text-slate-700 sm:grid-cols-2">
            {feats.map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-slate-600">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Imagem */}
        <div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow">
            <Image
              src="https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?q=80&w=1400&auto=format&fit=crop"
              alt="Qualidade e transparência no cuidado da piscina"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
