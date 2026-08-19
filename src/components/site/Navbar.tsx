"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, MonitorCog, Wrench, Users, CreditCard, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAquaMappaWhatsAppUrl } from "@/lib/contact";

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [appOpen, setAppOpen] = React.useState(false);
  const [appOpenMobile, setAppOpenMobile] = React.useState(false);

  const whatsappUrl = getAquaMappaWhatsAppUrl("Olá! Gostaria de conhecer melhor o Aqua Mappa.");

  const appMenu = [
    { href: "/backoffice", label: "Recursos de Back Office", icon: <MonitorCog className="h-4 w-4" /> },
    { href: "/tecnicos", label: "Recursos para Técnicos", icon: <Wrench className="h-4 w-4" /> },
    { href: "/clientes", label: "Recursos para Clientes", icon: <Users className="h-4 w-4" /> },
    { href: "/cobranca", label: "Cobrança e Pagamentos", icon: <CreditCard className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="h-1 bg-gradient-to-r from-[#0077C8] via-[#079ED2] to-[#00AEEF]" />

      <div className="border-b border-slate-200/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto flex h-[84px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex min-w-[185px] items-center">
            <div className="relative flex h-[64px] w-[175px] items-center">
              <Image src="/logo-aqua-mappa.png" alt="Aqua Mappa" width={240} height={80} className="h-auto w-[145px] origin-left scale-[1.22] object-contain" priority />
            </div>
          </Link>

          <nav className="relative hidden items-center gap-8 text-sm font-semibold sm:flex">
            <NavItem href="/">Home</NavItem>
            <NavItem href="/features">Recursos</NavItem>
            <NavItem href="/pricing">Planos</NavItem>

            <div className="relative before:absolute before:left-0 before:top-full before:h-3 before:w-full before:content-['']" onPointerEnter={() => setAppOpen(true)} onPointerLeave={() => setAppOpen(false)}>
              <button className="inline-flex items-center gap-1.5 text-slate-700 transition hover:text-[#0789C8]" aria-expanded={appOpen}>
                Sobre o App
                <ChevronDown className={cn("h-4 w-4 transition-transform", appOpen && "rotate-180")} />
              </button>

              {appOpen && (
                <div className="absolute left-1/2 top-full z-40 mt-3 w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  {appMenu.map((item) => (
                    <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-800 transition hover:bg-sky-50" onClick={() => setAppOpen(false)}>
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#0789C8] to-[#08B3D3] text-white">
                        {item.icon}
                      </span>

                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="hidden min-w-[260px] items-center justify-end gap-4 sm:flex">
            <Link href="/login">
              <Button variant="ghost" className="h-11 px-4 font-semibold text-slate-700 hover:bg-sky-50 hover:text-[#0789C8]">
                Acessar
              </Button>
            </Link>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button className="h-11 border-0 bg-gradient-to-r from-[#0789C8] to-[#08B3D3] px-5 font-semibold text-white shadow-md shadow-sky-900/10 transition hover:opacity-90">
                <MessageCircle className="mr-2 h-4 w-4" />
                Falar com a Mappa
              </Button>
            </a>
          </div>

          <button aria-label="Menu" className="text-slate-900 sm:hidden" onClick={() => setOpen((value) => !value)}>
            <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-200/70 bg-white sm:hidden">
            <div className="mx-auto max-w-6xl px-4 py-5 text-sm">
              <div className="mb-5">
                <Image src="/logo-aqua-mappa.png" alt="Aqua Mappa" width={180} height={60} className="h-auto w-[125px]" />
              </div>

              <div className="grid gap-4">
                <MobileLink href="/" onClick={() => setOpen(false)}>
                  Home
                </MobileLink>

                <MobileLink href="/features" onClick={() => setOpen(false)}>
                  Recursos
                </MobileLink>

                <MobileLink href="/pricing" onClick={() => setOpen(false)}>
                  Planos
                </MobileLink>

                <button className="flex w-full items-center justify-between text-left font-medium text-slate-800" onClick={() => setAppOpenMobile((value) => !value)}>
                  <span>Sobre o App</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", appOpenMobile && "rotate-180")} />
                </button>

                {appOpenMobile && (
                  <div className="ml-3 grid gap-3 border-l border-slate-200 pl-4">
                    {appMenu.map((item) => (
                      <MobileLink key={item.href} href={item.href} onClick={() => { setOpen(false); setAppOpenMobile(false); }}>
                        {item.label}
                      </MobileLink>
                    ))}
                  </div>
                )}

                <div className="grid gap-2 pt-3">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                    <Button className="h-11 w-full border-0 bg-gradient-to-r from-[#0789C8] to-[#08B3D3] font-semibold text-white">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Falar com a Mappa
                    </Button>
                  </a>

                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="h-11 w-full font-semibold">
                      Já sou cliente — Acessar
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-slate-700 transition hover:text-[#0789C8]">
      {children}
    </Link>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="font-medium text-slate-800">
      {children}
    </Link>
  );
}