// src/app/(site)/billing/success/page.tsx
import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pagamento concluído — Aqua Mappa",
};

type SuccessPageProps = {
  searchParams: {
    plan?: string;
    email?: string;
  };
};

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
};

export default function BillingSuccessPage({ searchParams }: SuccessPageProps) {
  const planKey = (searchParams.plan ?? "starter").toLowerCase();
  const planLabel = PLAN_LABELS[planKey] ?? "Starter";
  const email = searchParams.email ?? "";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-500" />

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Pagamento confirmado! 🎉
      </h1>

      <p className="mt-3 max-w-xl text-sm text-slate-600">
        Seu plano{" "}
        <span className="font-semibold text-sky-700">{planLabel}</span> foi
        ativado com sucesso.
        {email && (
          <>
            {" "}
            Enviamos os detalhes de acesso para{" "}
            <span className="font-medium">{email}</span>.
          </>
        )}
      </p>

      <p className="mt-2 max-w-xl text-xs text-slate-500">
        Agora é só acessar o painel do Aqua Mappa, cadastrar seus clientes e
        configurar as rotas de visitas.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {/* Ajuste essa rota para o login real do seu painel */}
        <Link href="/login">
          <Button>Ir para o login</Button>
        </Link>

        <Link href="/">
          <Button variant="outline">Voltar para o site</Button>
        </Link>
      </div>
    </div>
  );
}
