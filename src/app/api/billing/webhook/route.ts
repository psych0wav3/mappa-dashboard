// src/app/api/billing/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecret) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}
if (!webhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not set");
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2025-11-17.clover" as any,
});

// 👇 lazy-load do supabaseAdmin para não explodir no import, só quando realmente for usar
async function getSupabaseAdminSafe() {
  try {
    const mod = await import("@/lib/supabase/admin");
    // se o módulo em si disparar erro por falta de SUPABASE_SERVICE_ROLE_KEY,
    // isso cai no catch abaixo
    return mod.supabaseAdmin as any;
  } catch (e) {
    console.error(
      "[billing webhook] supabaseAdmin indisponível (talvez SUPABASE_SERVICE_ROLE_KEY não esteja setado):",
      e
    );
    return null;
  }
}

async function markPlanActive(opts: {
  email?: string | null;
  planKey: string;
  stripeCustomerId?: string | null;
}) {
  const { email, planKey, stripeCustomerId } = opts;
  if (!email) {
    console.warn("Webhook sem email, ignorando ativação de plano");
    return;
  }

  const supabaseAdmin = await getSupabaseAdminSafe();
  if (!supabaseAdmin) {
    console.warn(
      "[billing webhook] Não foi possível ativar plano porque supabaseAdmin não está disponível."
    );
    return;
  }

  // 1) lista usuários e filtra pelo e-mail em memória
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Erro ao listar usuários:", error);
    return;
  }

  const users = data?.users ?? [];
  const user = users.find(
    (u: any) => u.email && u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    console.warn("Nenhum usuário encontrado com email:", email);
    return;
  }

  // 2) atualiza user_metadata com status do plano
  const { error: updateError } =
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata || {}),
        plan: planKey,
        planStatus: "active",
        stripeCustomerId: stripeCustomerId ?? null,
        subscribedAt: new Date().toISOString(),
      },
    });

  if (updateError) {
    console.error("Erro ao marcar plano ativo:", updateError);
  } else {
    console.log(`Plano ${planKey} ativado para o email ${email}`);
  }
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Assinatura Stripe ausente" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret!);
  } catch (err: any) {
    console.error("Erro ao validar webhook Stripe:", err);
    return NextResponse.json(
      { error: `Webhook error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email =
        session.customer_details?.email ||
        (session.metadata?.email as string | undefined);

      const planKey =
        (session.metadata?.planKey as string | undefined) ?? "starter";

      const customerId = (session.customer as string | null) ?? null;

      await markPlanActive({
        email,
        planKey,
        stripeCustomerId: customerId,
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("Erro ao processar webhook:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro interno ao processar webhook" },
      { status: 500 }
    );
  }
}
