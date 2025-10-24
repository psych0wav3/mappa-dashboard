import * as React from "react";
import Link from "next/link";
import { Waves } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-slate-700">
          <Waves className="h-5 w-5" />
          <span className="font-medium">Aqqua</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/features">Recursos</Link>
          <Link href="/pricing">Planos</Link>
          <Link href="/contato">Contato</Link>
          <Link href="/login">Acessar</Link>
        </div>
        <p className="text-xs">
          © {new Date().getFullYear()} Aqqua. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
