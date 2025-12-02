// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const session = event.data.object as any;

    const userId = session.metadata?.userId as string | undefined;
    const planCode = session.metadata?.planCode as keyof typeof PLANS | undefined;

    if (userId && planCode) {
      // em vez de comparar p.code com planCode, usamos direto o índice do Record
      const plan = PLANS[planCode];

      if (plan) {
        await prisma.subscription.upsert({
          where: {
            stripeSubscriptionId: session.subscription as string,
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            plan: plan.code as any, // se for enum Prisma, mantemos esse cast
            maxClients: plan.maxClients,
            status: (session.status as any) ?? "active",
          },
          update: {
            status: (session.status as any) ?? "active",
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
