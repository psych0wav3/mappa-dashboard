// src/app/(private)/billing/page.tsx
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import { requireSession } from "@/lib/auth-roles";
import type { Subscription } from "@prisma/client";
import ManageBillingButton from "./ManageBillingButton";

function getPlanLabel(sub: Subscription | null) {
  if (!sub) return "Nenhum plano ativo";
  const entry = Object.values(PLANS).find(
    (p) => p.code === sub.plan,
  );
  return entry ? entry.label : sub.plan;
}

export default async function BillingPage() {
  // garante que só entra logado
  await headers(); // só pra evitar warning do Next em server actions
  const user = await requireSession();

  const [subscription, totalClients] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.count(),
  ]);

  const planLabel = getPlanLabel(subscription);
  const maxClients = subscription?.maxClients ?? 0;
  const used = totalClients;
  const remaining = maxClients > 0 ? Math.max(maxClients - used, 0) : 0;

  const statusLabel = subscription
    ? subscription.status === "active"
      ? "Ativa"
      : subscription.status === "past_due"
        ? "Em atraso"
        : subscription.status === "canceled"
          ? "Cancelada"
          : subscription.status
    : "Sem assinatura";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Cobrança e assinatura
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-neutral-500">Plano atual</div>
          <div className="mt-1 text-lg font-semibold">{planLabel}</div>
          <div className="mt-2 text-xs text-neutral-500">
            Status: <span className="font-medium">{statusLabel}</span>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-neutral-500">Clientes cadastrados</div>
          <div className="mt-1 text-lg font-semibold">
            {used}
            {maxClients > 0 && (
              <span className="text-sm font-normal text-neutral-500">
                {" "}
                / {maxClients}
              </span>
            )}
          </div>
          {maxClients > 0 && (
            <div className="mt-2 text-xs text-neutral-500">
              Restantes:{" "}
              <span className="font-medium">{remaining}</span>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-neutral-500">
            Faturamento e pagamentos
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Gerencie cartão, notas fiscais/recibos, histórico de cobranças e
            upgrade/downgrade de plano diretamente no portal seguro do Stripe.
          </p>
          <div className="mt-3">
            <ManageBillingButton
              hasSubscription={!!subscription}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Quando sua assinatura deixar de ficar ativa (cancelada, vencida ou em
        atraso), o sistema bloqueia automaticamente o cadastro de novos
        clientes, mantendo seu histórico preservado.
      </p>
    </div>
  );
}
