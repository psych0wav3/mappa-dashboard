// src/app/api/billing/portal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-roles";

export async function POST(_req: NextRequest) {
  try {
    const user = await requireSession();

    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return NextResponse.json(
        {
          error:
            "Nenhuma assinatura encontrada. Selecione um plano para começar.",
        },
        { status: 400 },
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${siteUrl}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[/api/billing/portal] error", error);
    return NextResponse.json(
      { error: "Não foi possível abrir o portal de cobrança." },
      { status: 500 },
    );
  }
}
