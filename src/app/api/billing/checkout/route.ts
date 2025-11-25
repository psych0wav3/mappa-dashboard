// src/app/api/billing/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

if (!stripeSecret) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2025-11-17.clover",
});

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
        { status: 400 },
      );
    }

    const planKey = (plan ?? "starter").toLowerCase();
    const priceId = PLAN_PRICE_IDS[planKey] || PLAN_PRICE_IDS["starter"];

    if (!priceId) {
      return NextResponse.json(
        { error: "Plano não configurado no Stripe" },
        { status: 500 },
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
        planKey,
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
      { status: 500 },
    );
  }
}
