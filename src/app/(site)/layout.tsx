// src/app/(site)/layout.tsx
import type { ReactNode } from "react";
import Navbar from "@/components/site/Navbar";

export const metadata = {
  title: "PiscinApp — Gestão de Piscinas",
  description: "Rotas, visitas, fotos e relatórios para empresas de manutenção de piscinas.",
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-neutral-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white grid place-items-center text-xs font-bold">
                P
              </div>
              <span className="font-medium">PiscinApp</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/features" className="hover:text-neutral-900">Recursos</a>
              <a href="/pricing" className="hover:text-neutral-900">Preços</a>
              <a href="/contato" className="hover:text-neutral-900">Contato</a>
              <a href="/login" className="hover:text-neutral-900">Entrar</a>
            </div>
          </div>
          <div className="mt-4 text-xs text-neutral-500">
            <span suppressHydrationWarning>© {new Date().getFullYear()} Aqua Check. Todos os direitos reservados.</span> Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
