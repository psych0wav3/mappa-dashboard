// src/components/site/Navbar.tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">
            P
          </div>
          <span className="text-xl font-semibold tracking-tight">PiscinApp</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link href="/features" className="text-neutral-700 hover:text-neutral-950">
            Recursos
          </Link>
          <Link href="/pricing" className="text-neutral-700 hover:text-neutral-950">
            Preços
          </Link>
          <Link href="/contato" className="text-neutral-700 hover:text-neutral-950">
            Contato
          </Link>

          <div className="h-5 w-px bg-neutral-200" />

          <Link href="/login" className="text-neutral-700 hover:text-neutral-950">
            Entrar
          </Link>
          <Link
            href="/login" // troque para /signup quando tiver o fluxo
            className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
          >
            Começar grátis
          </Link>
        </nav>

        {/* mobile */}
        <div className="md:hidden">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-white text-sm font-medium hover:bg-blue-700"
          >
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}
