// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
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
      const plan = Object.values(PLANS).find((p) => p.code === planCode);
      if (plan) {
        await prisma.subscription.upsert({
          where: {
            stripeSubscriptionId: session.subscription as string,
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            plan: plan.code as any,
            maxClients: plan.maxClients,
            status: session.status ?? "active",
          },
          update: {
            status: session.status ?? "active",
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
