import * as React from "react";
import type { Metadata } from "next";
import NewTechnicianClient from "./NewTechnicianClient";

export const metadata: Metadata = {
  title: "Novo Técnico — Aqua Mappa",
};

export default function NewTechnicianPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mb-4 mt-4 rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-800 shadow-sm">
        <h1 className="text-lg font-semibold">Novo Técnico</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <NewTechnicianClient />
      </div>
    </div>
  );
}
