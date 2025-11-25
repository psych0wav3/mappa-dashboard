// src/app/(site)/checkout/page.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { PLANS, type PlanKey } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CheckoutPage() {
  const search = useSearchParams();
  const router = useRouter();

  const rawPlanKey = (search.get("plan") ?? "starter").toLowerCase();
  const planKey = (rawPlanKey as PlanKey) in PLANS ? (rawPlanKey as PlanKey) : "starter";
  const plan = PLANS[planKey];

  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function startCheckout() {
      try {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planKey }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const msg =
            data?.error ||
            "Não foi possível iniciar o pagamento. Tente novamente em instantes.";
          setStatus("error");
          setErrorMessage(msg);
          toast.error("Erro ao iniciar checkout", { description: msg });
          return;
        }

        const data = await res.json();
        if (data.url) {
          window.location.href = data.url as string;
        } else {
          const msg = "Resposta inesperada do servidor de pagamento.";
          setStatus("error");
          setErrorMessage(msg);
          toast.error("Erro ao iniciar checkout", { description: msg });
        }
      } catch (err) {
        console.error(err);
        const msg =
          err instanceof Error
            ? err.message
            : "Não foi possível conectar ao servidor de pagamento.";
        setStatus("error");
        setErrorMessage(msg);
        toast.error("Erro ao iniciar checkout", { description: msg });
      }
    }

    startCheckout();
  }, [planKey]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-10 sm:px-6">
        {status === "loading" && (
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            <div>
              <h1 className="text-lg font-semibold">
                Redirecionando para pagamento seguro
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Estamos conectando seu plano{" "}
                <span className="font-semibold text-sky-700">
                  {plan.label}
                </span>{" "}
                ao sistema de cobrança. Isso pode levar alguns segundos.
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-red-50 p-3">
              <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-red-700">
                Não foi possível iniciar o pagamento
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {errorMessage ??
                  "Ocorreu um problema ao conectar com o provedor de pagamentos."}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Você pode tentar novamente ou voltar à página de planos.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/pricing")}
              >
                Voltar para os planos
              </Button>
              <Button onClick={() => router.refresh()}>Tentar novamente</Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
