// src/app/(private)/billing/ManageBillingButton.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function ManageBillingButton({
  hasSubscription,
}: {
  hasSubscription: boolean;
}) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (!hasSubscription) {
      router.push("/pricing");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          (data as any)?.error ||
          "Não foi possível abrir o portal de cobrança. Tente novamente.";
        toast.error("Erro ao abrir portal de cobrança", {
          description: msg,
        });
        return;
      }

      const data = await res.json();
      if ((data as any).url) {
        window.location.href = (data as any).url as string;
      } else {
        toast.error("Erro ao abrir portal de cobrança", {
          description: "Resposta inesperada do servidor.",
        });
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Falha ao conectar com o servidor de cobrança.";
      toast.error("Erro ao abrir portal de cobrança", {
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="w-full justify-center"
      variant={hasSubscription ? "outline" : "primary"}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Abrindo portal…
        </>
      ) : hasSubscription ? (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Gerenciar cobrança
        </>
      ) : (
        "Escolher um plano"
      )}
    </Button>
  );
}
