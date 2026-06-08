import type { Metadata } from "next";
import RouteBuilder from "@/components/routes/RouteBuilder";

export const metadata: Metadata = {
  title: "Criar rota — Aqua Mappa",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function RouteBuilderPage() {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-800 shadow-sm">
          <h1 className="text-lg font-semibold">Criar rota</h1>
        </div>

        <RouteBuilder />
      </div>
    </div>
  );
}