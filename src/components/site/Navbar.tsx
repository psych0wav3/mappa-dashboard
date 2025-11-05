"use client";

import * as React from "react";
import Link from "next/link";
import { Waves, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top strip (degradê azul) */}
      <div
        className="text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--ac-blue-700) 0%, var(--ac-blue-500) 100%)",
        }}
      >
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-xs sm:px-6">
          {/* <div className="hidden items-center gap-4 sm:flex opacity-95">
            <span className="cursor-default">Conditions</span>
            <Dot />
            <span className="cursor-default">Quality</span>
            <Dot />
            <span className="cursor-default">Stay Connected</span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <TopLink href="https://instagram.com">Instagram</TopLink>
          </div> */}
        </div>
      </div>

      {/* Main bar */}
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
          <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
            <NavItem href="/">Home</NavItem>
            <NavItem href="/features">Recursos</NavItem>
            <NavItem href="/pricing">Planos</NavItem>
            <NavItem href="/contato">Contato</NavItem>
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
                <MobileLink href="/pricing" onClick={() => setOpen(false)}>Planos</MobileLink>
                <MobileLink href="/contato" onClick={() => setOpen(false)}>Contato</MobileLink>
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
function Dot() {
  return <span className="mx-1 inline-block h-1 w-1 rounded-full bg-white/80 align-middle" />;
}

function TopLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="hover:underline underline-offset-2">
      {children}
    </a>
  );
}

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
