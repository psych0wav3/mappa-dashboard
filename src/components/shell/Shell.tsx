"use client";

import * as React from "react";
import { Suspense } from "react";

import AppSidebar from "./AppSidebar";
import AppTopbar from "./AppTopbar";
import CompanyRequiredBanner from "./CompanyRequiredBanner";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-neutral-50">
      <AppTopbar onOpenMenu={() => setMenuOpen(true)} />

      <AppSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="relative z-0 min-w-0 pt-[64px] transition-[padding-left] duration-300 xl:pl-[var(--sidebar-w)]">
        <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5 sm:py-6 xl:px-6">
          <Suspense fallback={null}>
            <CompanyRequiredBanner />
          </Suspense>

          {children}
        </div>
      </main>
    </div>
  );
}
