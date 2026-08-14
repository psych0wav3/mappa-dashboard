import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AuthShell({
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="relative hidden md:block">
        <div className="absolute inset-0 btn-brand" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

        <div className="relative flex h-full w-full flex-col p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <span className="font-bold">A</span>
            </div>
            <div className="text-xl font-semibold tracking-tight">
              Aqua Mappa
            </div>
          </div>

          <div className="flex flex-1 items-center">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight">
                Gerencie rotas,
                <br />
                visitas e relatórios
              </h2>
              <p className="max-w-md text-white/80">
                Dashboard para criar agendas, acompanhar técnicos e
                centralizar fotos, checklists e medições.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm space-y-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              {title}
            </h1>
            {description ? (
              <p className="text-sm text-neutral-500">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
