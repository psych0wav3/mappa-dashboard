import type { Metadata } from "next";

import { listWorkOrders } from "../actions";
import PendingPricingClient from "./PendingPricingClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Aguardando orçamento — Aqua Mappa",
};

export default async function PendingPricingPage() {
  const orders = await listWorkOrders({
    status: "PendingCompanyPricing",
  });

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <PendingPricingClient
        initialOrders={orders}
      />
    </div>
  );
}