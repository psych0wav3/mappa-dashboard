import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: NextRequest) {
  try {
    const { plan, email } = await req.json();

    if (!plan || !email) {
      return NextResponse.json(
        { error: "Plano e e-mail são obrigatórios" },
        { status: 400 }
      );
    }

    const planConfig = PLANS[plan.toLowerCase() as keyof typeof PLANS];
    if (!planConfig?.stripePriceId) {
      return NextResponse.json(
        { error: "Plano inválido" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email, // 👉 AQUI está a correção principal
      line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/success?plan=${plan}&email=${encodeURIComponent(email)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/register?plan=${plan}`,
      metadata: {
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro ao criar checkout" },
      { status: 500 }
    );
  }
}
