import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "Aqua Mappa Dashboard",
  description: "Gestão de rotas e visitas",
};

type RootLayoutProps = {
  children: ReactNode;
};

type RootStyle = CSSProperties & {
  "--sidebar-w": string;
};

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const cookieStore = await cookies();

  const collapsedFromCookie =
    cookieStore.get("sb-collapsed")?.value === "1";

  const initialDesktopWidth = collapsedFromCookie ? 80 : 280;

  const rootStyle: RootStyle = {
    "--sidebar-w": `${initialDesktopWidth}px`,
  };

  return (
    <html
      lang="pt-BR"
      style={rootStyle}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="sidebar-width-init"
          strategy="beforeInteractive"
        >
          {`
            (function () {
              try {
                var isDesktop = window
                  .matchMedia("(min-width: 1280px)")
                  .matches;

                var collapsedLS = null;

                try {
                  var storedValue = localStorage.getItem(
                    "sidebar:collapsed"
                  );

                  collapsedLS =
                    storedValue !== null
                      ? JSON.parse(storedValue)
                      : null;
                } catch (_) {
                  collapsedLS = null;
                }

                var cookieMatch = document.cookie.match(
                  /(?:^|; )sb-collapsed=(\\d)/
                );

                var collapsedCK = cookieMatch
                  ? cookieMatch[1] === "1"
                  : null;

                var collapsed =
                  collapsedLS !== null
                    ? collapsedLS
                    : collapsedCK !== null
                      ? collapsedCK
                      : false;

                var width = isDesktop
                  ? collapsed
                    ? 80
                    : 280
                  : 0;

                document.documentElement.style.setProperty(
                  "--sidebar-w",
                  width + "px"
                );
              } catch (_) {
                // Mantém o valor inicial definido no servidor.
              }
            })();
          `}
        </Script>
      </head>

      <body
        className="bg-neutral-50"
        suppressHydrationWarning
      >
        {children}

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}