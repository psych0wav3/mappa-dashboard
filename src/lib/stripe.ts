// src/lib/stripe.ts
import Stripe from "stripe";

// Usa uma chave "dummy" se não tiver STRIPE_SECRET_KEY em runtime.
// Assim o build da Vercel não quebra.
// Em produção você DEVE setar STRIPE_SECRET_KEY na Vercel.
const secret = process.env.STRIPE_SECRET_KEY ?? "sk_test_dummy_key_change_me";

export const stripe = new Stripe(secret, {
  apiVersion: "2025-11-17.clover" as any,
});
