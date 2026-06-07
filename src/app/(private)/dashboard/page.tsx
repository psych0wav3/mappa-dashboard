// src/app/(private)/dashboard/page.tsx
import Link from "next/link";

export default async function DashboardPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Olá, admin@piscinasazul.com
          </h1>
          <p className="text-sm text-slate-500">
            Piscinas Azul
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          API conectada
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-slate-900">
          Próximos passos
        </h2>
        <p className="text-xs text-slate-600">
          Use o atalho{" "}
          <Link
            href="/quickstart"
            className="font-medium text-sky-700 hover:underline"
          >
            Início rápido
          </Link>{" "}
          no menu para continuar o onboarding ou acesse diretamente as rotas,
          técnicos e clientes.
        </p>
      </section>
    </main>
  );
}