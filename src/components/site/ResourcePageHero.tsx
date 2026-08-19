import * as React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

import { getAquaMappaWhatsAppUrl } from "@/lib/contact";

type ResourcePageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  whatsappMessage: string;
  visual: React.ReactNode;
  badge?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function ResourcePageHero({
  eyebrow,
  title,
  description,
  whatsappMessage,
  visual,
  badge,
  secondaryHref = "/pricing",
  secondaryLabel = "Ver planos",
}: ResourcePageHeroProps) {
  const whatsappUrl = getAquaMappaWhatsAppUrl(whatsappMessage);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#087BC2] via-[#0795CC] to-[#08B5D1] text-white">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-cyan-200/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 left-[20%] h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />

      <WavesPattern className="pointer-events-none absolute right-0 top-8 hidden text-white/10 lg:block" />

      <div className="relative mx-auto grid min-h-[520px] max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_.98fr] lg:py-16">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-200" />
              {eyebrow}
            </span>

            {badge && (
              <span className="inline-flex rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-100">
                {badge}
              </span>
            )}
          </div>

          <h1 className="mt-6 max-w-[650px] text-balance text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-[58px]">
            {title}
          </h1>

          <p className="mt-6 max-w-[590px] text-lg leading-relaxed text-white/85">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-[#0789C8] shadow-lg transition hover:bg-sky-50">
              <MessageCircle className="mr-2 h-5 w-5" />
              Falar com a Mappa
            </a>

            <Link href={secondaryHref} className="inline-flex h-12 items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white">
              {secondaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative hidden min-h-[390px] lg:block">
          {visual}
        </div>
      </div>
    </section>
  );
}

function WavesPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="260" height="240" viewBox="0 0 260 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {Array.from({ length: 8 }).map((_, index) => (
        <path key={index} d={`M0 ${20 + index * 23}c20-12 40-12 60 0s40 12 60 0 40-12 60 0 40 12 60 0`} stroke="currentColor" strokeWidth="2" fill="none" />
      ))}
    </svg>
  );
}