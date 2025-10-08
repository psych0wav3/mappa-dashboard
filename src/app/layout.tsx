import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";
import { cookies } from "next/headers"; // ⬅️ novo

export const metadata: Metadata = {
  title: "Aqua Check Dashboard",
  description: "Gestão de rotas e visitas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ⬇️ SSR já sabe se estava colapsado (1) ou não (0)
  const cookieStore = cookies();
  const collapsedFromCookie = cookieStore.get("sb-collapsed")?.value === "1";
  const initialDesktopWidth = collapsedFromCookie ? 80 : 280;

  return (
    <html
      lang="pt-BR"
      // Define um valor inicial coerente com o último estado no desktop
      style={{ ["--sidebar-w" as any]: `${initialDesktopWidth}px` }}
    >
      <head>
        {/* Corrige em runtime (mobile = 0 e eventual divergência com cookie) ANTES da hidratação */}
        <Script id="sidebar-width-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var isDesktop = window.matchMedia('(min-width: 1024px)').matches;
                var collapsedLS = false;
                try { collapsedLS = JSON.parse(localStorage.getItem('sidebar:collapsed') || 'false'); } catch (_){}

                // Preferimos cookie para o 1º HTML, mas se LS divergir, o runtime prevalece.
                var cookieMatch = document.cookie.match(/(?:^|; )sb-collapsed=(\\d)/);
                var collapsedCK = cookieMatch ? cookieMatch[1] === '1' : null;

                var collapsed = (collapsedLS != null ? collapsedLS
                                  : (collapsedCK != null ? collapsedCK : false));

                var width = isDesktop ? (collapsed ? 80 : 280) : 0;
                document.documentElement.style.setProperty('--sidebar-w', width + 'px');
              } catch (_) {}
            })();
          `}
        </Script>
      </head>

      <body className="bg-neutral-50" suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
