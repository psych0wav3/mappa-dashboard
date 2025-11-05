import * as React from "react";
import Link from "next/link";
import { Waves } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#0077C8] to-[#00AEEF] text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:px-6">
        {/* Marca */}
        <div className="flex items-center gap-2 text-white/90">
          <Waves className="h-5 w-5 text-white" />
          <span className="font-semibold tracking-wide">Aqua Mappa</span>
        </div>

        {/* Navegação */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
          <Link
            href="/features"
            className="transition hover:text-white hover:underline"
          >
            Recursos
          </Link>
          <Link
            href="/pricing"
            className="transition hover:text-white hover:underline"
          >
            Planos
          </Link>
          <Link
            href="/contato"
            className="transition hover:text-white hover:underline"
          >
            Contato
          </Link>
          <Link
            href="/login"
            className="transition hover:text-white hover:underline"
          >
            Acessar
          </Link>
        </div>

        {/* Direitos autorais */}
        <p className="text-xs text-white/80">
          © {new Date().getFullYear()} Aqua Mappa. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
