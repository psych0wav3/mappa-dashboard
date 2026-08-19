import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { AQUA_MAPPA_CONTACT, getAquaMappaWhatsAppUrl } from "@/lib/contact";

export default function Footer() {
  const whatsappUrl = getAquaMappaWhatsAppUrl("Olá! Gostaria de falar com a equipe Aqua Mappa.");

  return (
    <footer className="bg-gradient-to-r from-[#087BC2] via-[#0798CD] to-[#08B4D1] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.15fr_.7fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image src="/logo-aqua-mappa_dark.png" alt="Aqua Mappa" width={190} height={65} className="h-auto w-[155px] object-contain" />            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              Tecnologia para organizar rotas, serviços, equipes e clientes de empresas de manutenção de piscinas.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
              Navegação
            </p>

            <div className="mt-4 grid gap-3 text-sm text-white/80">
              <Link href="/" className="transition hover:text-white">
                Home
              </Link>

              <Link href="/features" className="transition hover:text-white">
                Recursos
              </Link>

              <Link href="/pricing" className="transition hover:text-white">
                Planos
              </Link>

              <Link href="/login" className="transition hover:text-white">
                Acessar
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
              Fale com a gente
            </p>

            <div className="mt-4 grid gap-3 text-sm">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/85 transition hover:text-white">
                <MessageCircle className="h-4 w-4 shrink-0" />
                {AQUA_MAPPA_CONTACT.whatsapp}
              </a>

              <a href={`mailto:${AQUA_MAPPA_CONTACT.email}`} className="flex items-center gap-2 text-white/85 transition hover:text-white">
                <Mail className="h-4 w-4 shrink-0" />
                {AQUA_MAPPA_CONTACT.email}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6">
          <div className="flex flex-col gap-4 text-xs text-white/60 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p>
                Aqua Mappa é um produto da {AQUA_MAPPA_CONTACT.company}.
              </p>

              <p className="mt-1">
                CNPJ {AQUA_MAPPA_CONTACT.cnpj}
              </p>
            </div>

            <p>
              © {new Date().getFullYear()} Aqua Mappa. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}