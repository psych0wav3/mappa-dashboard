// src/app/api/billing/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PLANS, type PlanKey } from "@/lib/plans";
import { requireSession } from "@/lib/auth-roles";

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();

    const body = await req.json().catch(() => ({}));
    const rawPlanKey = (body.planKey ?? "starter") as string;
    const planKey = rawPlanKey.toLowerCase() as PlanKey;

    const plan = PLANS[planKey];
    if (!plan) {
      return NextResponse.json(
        { error: "Plano inválido" },
        { status: 400 },
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/dashboard?billing=success`,
      cancel_url: `${siteUrl}/pricing?billing=cancelled`,
      metadata: {
        userId: user.id,
        planCode: plan.code,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[/api/billing/checkout] error", error);
    return NextResponse.json(
      { error: "Não foi possível iniciar o checkout" },
      { status: 500 },
    );
  }
}
