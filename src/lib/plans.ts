// src/lib/plans.ts

export type PlanKey = "starter" | "pro" | "business" | "enterprise";

export type PlanConfig = {
  code: "STARTER" | "PRO" | "BUSINESS" | "ENTERPRISE";
  label: string;
  description: string;
  maxClients: number;
  stripePriceId: string;
};

export const PLANS: Record<PlanKey, PlanConfig> = {
  starter: {
    code: "STARTER",
    label: "Starter",
    description: "Até 10 piscinas. Ideal para quem está começando.",
    maxClients: 10,
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? "", // ⚠️ .env
  },
  pro: {
    code: "PRO",
    label: "Pro",
    description: "De 11 a 30 piscinas. Para empresas com 2 a 3 técnicos.",
    maxClients: 30,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? "",
  },
  business: {
    code: "BUSINESS",
    label: "Business",
    description: "De 31 a 50 piscinas. Para equipes médias.",
    maxClients: 50,
    stripePriceId: process.env.STRIPE_PRICE_BUSINESS ?? "",
  },
  enterprise: {
    code: "ENTERPRISE",
    label: "Enterprise",
    description: "Acima de 50 piscinas. Suporte e customização avançada.",
    maxClients: 999_999, // sem limite prático
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE ?? "",
  },
};
