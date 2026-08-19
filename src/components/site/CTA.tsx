"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Apple, Download, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAquaMappaWhatsAppUrl } from "@/lib/contact";

export default function CTA() {
  const googlePlayUrl = process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL;
  const appStoreUrl = process.env.NEXT_PUBLIC_APP_STORE_URL;

  const whatsappUrl = getAquaMappaWhatsAppUrl("Olá! Gostaria de conhecer o Aqua Mappa e solicitar acesso para minha empresa.");

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(0,174,239,0.07)_0%,rgba(255,255,255,0)_70%)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative min-h-[500px] overflow-hidden rounded-[38px] bg-gradient-to-br from-[#087BC2] via-[#0794CC] to-[#08B5D1] shadow-[0_24px_60px_rgba(3,73,117,.18)]">
          <div className="pointer-events-none absolute -right-28 -top-28 h-[420px] w-[420px] rounded-full bg-cyan-200/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-[25%] h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl" />

          <WavesPattern className="pointer-events-none absolute right-4 top-10 hidden text-white/10 lg:block" />

          <div className="relative z-10 flex min-h-[500px] items-center px-7 py-10 sm:px-10 lg:w-[59%] lg:px-14 lg:py-12">
            <div className="max-w-[610px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                <Sparkles className="h-4 w-4 text-cyan-100" />
                Conheça o Aqua Mappa
              </div>

              <h3 className="mt-5 text-balance text-4xl font-extrabold leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-[56px]">
                Pronto para levar sua operação para uma{" "}
                <span className="text-[#173F76]">
                  nova rota?
                </span>
              </h3>

              <p className="mt-5 max-w-[560px] text-lg leading-relaxed text-white/85">
                Conheça a plataforma e fale com a nossa equipe para liberar o acesso da sua empresa.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="h-12 border-0 bg-white px-6 font-bold text-[#0789C8] shadow-lg hover:bg-sky-50">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Falar com a Mappa
                  </Button>
                </a>

                <Link href="/login" className="text-sm font-semibold text-white/85 transition hover:text-white">
                  Já tenho acesso →
                </Link>
              </div>

              <div className="mt-8 border-t border-white/15 pt-6">
                <p className="text-sm font-semibold text-white">
                  Em breve no seu celular
                </p>

                <div className="mt-3 flex flex-wrap gap-3">
                  <StoreButton href={appStoreUrl} icon={<Apple className="h-5 w-5" />} title="App Store" />
                  <StoreButton href={googlePlayUrl} icon={<Download className="h-5 w-5" />} title="Google Play" />
                </div>

                <p className="mt-4 text-sm text-white/65">
                  A gente acompanha você desde o primeiro acesso.
                </p>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-0 right-[-20px] hidden h-full w-[48%] lg:block">
            <div className="absolute bottom-[-205px] right-[-5px] h-[760px] w-[610px]">
              <Image src="/personagem-aqua-mappa.png" alt="Técnico Aqua Mappa" fill className="object-contain object-bottom" priority />
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-0 right-0 hidden h-[160px] w-[48%] bg-gradient-to-t from-[#08B5D1]/60 to-transparent lg:block" />
        </div>
      </div>
    </section>
  );
}

function StoreButton({ href, icon, title }: { href?: string; icon: React.ReactNode; title: string }) {
  if (!href) {
    return (
      <div className="inline-flex h-12 items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-5 text-white/80 backdrop-blur-sm">
        {icon}

        <div className="text-left leading-tight">
          <span className="block text-[9px] font-medium uppercase tracking-[0.12em] text-white/55">
            Em breve
          </span>

          <span className="block text-sm font-bold">
            {title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-3 rounded-xl bg-[#101828] px-5 text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#17233a]">
      {icon}

      <div className="text-left leading-tight">
        <span className="block text-[10px] text-white/65">
          Baixar na
        </span>

        <span className="block text-sm font-bold">
          {title}
        </span>
      </div>
    </a>
  );
}

function WavesPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="260" height="240" viewBox="0 0 260 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M0 ${20 + i * 23}c20-12 40-12 60 0s40 12 60 0 40-12 60 0 40 12 60 0`} stroke="currentColor" strokeWidth="2" fill="none" />
      ))}
    </svg>
  );
}