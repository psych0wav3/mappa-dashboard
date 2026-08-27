"use client";

import {
  AlertTriangle,
  Home,
  RefreshCw,
} from "lucide-react";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function PrivateError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      "Erro não tratado na área privada do Aqua Mappa:",
      error,
    );
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div className="mt-5 space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
            Não foi possível carregar esta página
          </h1>

          <p className="text-sm leading-6 text-neutral-600 sm:text-base">
            Tivemos um problema ao buscar ou
            processar as informações. Você pode
            tentar novamente sem sair do sistema.
          </p>
        </div>

        {error.digest ? (
          <p className="mt-4 text-xs text-neutral-400">
            Código do erro: {error.digest}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={reset}
            className="w-full gap-2 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />

            Tentar novamente
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              window.location.assign(
                "/dashboard",
              )
            }
            className="w-full gap-2 sm:w-auto"
          >
            <Home className="h-4 w-4" />

            Ir para o painel
          </Button>
        </div>
      </div>
    </div>
  );
}