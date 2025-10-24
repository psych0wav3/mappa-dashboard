import * as React from "react";

export default function LogosStrip() {
  return (
    <section className="border-y border-slate-200/70 bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 py-6 sm:px-6">
        <span className="text-xs uppercase tracking-widest text-slate-500">
          Feito para negócios reais
        </span>
        <div className="h-2 w-px bg-slate-200" />
        <span className="text-xs uppercase tracking-widest text-slate-500">
          Rotas + Checklists + Cobrança
        </span>
        <div className="h-2 w-px bg-slate-200" />
        <span className="text-xs uppercase tracking-widest text-slate-500">
          Android & Web
        </span>
      </div>
    </section>
  );
}