"use client";

import * as React from "react";
import AppSidebar from "./AppSidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar azul */}
      <AppSidebar open={true} onClose={() => {}} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
        {children}
      </main>
    </div>
  );
}
