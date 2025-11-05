"use client";

import * as React from "react";
import Link from "next/link";
import { Waves, Phone, ChevronDown, MonitorCog, Wrench, Users, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [appOpen, setAppOpen] = React.useState(false); // dropdown desktop
  const [appOpenMobile, setAppOpenMobile] = React.useState(false); // dropdown mobile

  const appMenu = [
    { href: "/backoffice", label: "Recursos de Back Office", icon: <MonitorCog className="h-4 w-4" /> },
    { href: "/tecnicos",   label: "Recursos para Técnicos", icon: <Wrench className="h-4 w-4" /> },
    { href: "/clientes",   label: "Recursos para Clientes", icon: <Users className="h-4 w-4" /> },
    { href: "/cobranca",   label: "Cobrança e Pagamentos", icon: <CreditCard className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Faixa superior (degradê azul) */}
      <div
        className="text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--ac-blue-700) 0%, var(--ac-blue-500) 100%)",
        }}
      >
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-xs sm:px-6" />
      </div>

      {/* Barra principal */}
      <div className="border-b border-slate-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg btn-brand grid place-items-center text-xs font-bold">
              A
            </div>
            <span className="font-semibold tracking-tight text-slate-900">Aqua Mappa</span>
          </Link>

          {/* Nav (desktop) */}
          <nav className="relative hidden items-center gap-6 text-sm font-medium sm:flex">
            <NavItem href="/">Home</NavItem>
            <NavItem href="/features">Recursos</NavItem>
            <NavItem href="/valores">Planos</NavItem>

{/* Sobre o App (dropdown) */}
<div
  className={cn(
    "relative",
    // ponte invisível para evitar gap entre o botão e o menu
    "before:absolute before:top-full before:left-0 before:h-3 before:w-full before:content-['']"
  )}
  onPointerEnter={() => setAppOpen(true)}
  onPointerLeave={() => setAppOpen(false)}
>
  <button
    className={cn(
      "inline-flex items-center gap-1.5 text-slate-800 hover:text-[color:var(--ac-blue-600,#0ea5e9)]"
    )}
    aria-expanded={appOpen}
  >
    Sobre o App
    <ChevronDown
      className={cn(
        "h-4 w-4 transition-transform",
        appOpen && "rotate-180"
      )}
    />
  </button>

  {appOpen && (
    <div
      className="absolute left-1/2 top-full z-40 mt-1 w-72 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
    >
      {appMenu.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-50"
          onClick={() => setAppOpen(false)}
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#0077C8] to-[#00AEEF] text-white">
            {item.icon}
          </span>
          <span className="text-sm">{item.label}</span>
        </Link>
      ))}
    </div>
  )}
</div>

          </nav>

          {/* Phone + login (desktop) */}
          <div className="hidden items-center gap-6 sm:flex">
            <div className="hidden h-6 w-px bg-slate-200/80 md:block" />
            <div className="flex items-center gap-3 text-slate-800">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100">
                <Phone className="h-4 w-4 text-slate-900" />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  Ligue agora
                </div>
                <a href="tel:+551199999-9999" className="text-sm font-semibold text-slate-900 hover:underline">
                  (11) 99999-9999
                </a>
              </div>
            </div>

            <Link href="/login">
              <Button className="btn-brand border-0 shadow-sm">Acessar</Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button aria-label="Menu" className="sm:hidden" onClick={() => setOpen(v => !v)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-slate-200/70 sm:hidden">
            <div className="mx-auto max-w-6xl px-4 py-4 text-sm">
              <div className="grid gap-3">
                <MobileLink href="/" onClick={() => setOpen(false)}>Home</MobileLink>
                <MobileLink href="/features" onClick={() => setOpen(false)}>Recursos</MobileLink>
                <MobileLink href="/valores" onClick={() => setOpen(false)}>Planos</MobileLink>

                {/* Sobre o App (colapsável) */}
                <button
                  className="flex w-full items-center justify-between text-left text-slate-800"
                  onClick={() => setAppOpenMobile(v => !v)}
                >
                  <span>Sobre o App</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      appOpenMobile && "rotate-180"
                    )}
                  />
                </button>

                {appOpenMobile && (
                  <div className="ml-3 grid gap-2 border-l border-slate-200 pl-3">
                    {appMenu.map((item) => (
                      <MobileLink key={item.href} href={item.href} onClick={() => { setOpen(false); setAppOpenMobile(false); }}>
                        {item.label}
                      </MobileLink>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full btn-brand">Acessar</Button>
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

/* Helpers */
function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-slate-800 hover:text-[color:var(--ac-blue-600,#0ea5e9)]"
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} onClick={onClick} className="text-slate-800">
      {children}
    </Link>
  );
}
