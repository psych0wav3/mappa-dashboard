// src/app/api/billing/checkout/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const PLAN_PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || "",
  pro: process.env.STRIPE_PRICE_PRO || "",
  business: process.env.STRIPE_PRICE_BUSINESS || "",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "",
};

export async function POST(req: Request) {
  try {
    const { plan, email } = (await req.json()) as {
      plan?: string;
      email?: string;
    };

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error(
        "[billing checkout] STRIPE_SECRET_KEY não está definida. " +
          "Não é possível criar sessão de checkout."
      );
      return NextResponse.json(
        { error: "Stripe não está configurado no servidor." },
        { status: 500 }
      );
    }

    const planKey = (plan ?? "starter").toLowerCase();
    const priceId = PLAN_PRICE_IDS[planKey] || PLAN_PRICE_IDS["starter"];

    if (!priceId) {
      return NextResponse.json(
        { error: "Plano não configurado no Stripe" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email.trim(),
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/billing/success?plan=${encodeURIComponent(
        planKey
      )}&email=${encodeURIComponent(email.trim())}`,
      cancel_url: `${baseUrl}/billing/cancelled`,
      metadata: {
        planKey,
        email: email.trim(),
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Erro ao criar checkout:", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro ao criar checkout" },
      { status: 500 }
    );
  }
}
