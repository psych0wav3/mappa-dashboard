// src/lib/stripe.ts
import Stripe from "stripe";

// Em dev/local você pode ficar sem STRIPE_SECRET_KEY.
// Em produção, configure em Vercel (Project → Settings → Environment Variables).
const secret = process.env.STRIPE_SECRET_KEY ?? "sk_test_dummy_key_change_me";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "[stripe] STRIPE_SECRET_KEY não definida. Usando chave dummy. " +
      "Em produção isso vai quebrar chamadas ao Stripe."
  );
}

export const stripe = new Stripe(secret, {
  apiVersion: "2025-11-17.clover" as any,
});
