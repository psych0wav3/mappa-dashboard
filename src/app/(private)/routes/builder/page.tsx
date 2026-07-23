import type { Metadata } from "next";

import RouteBuilder from "@/components/routes/RouteBuilder";

import {
  listApprovedServiceOrdersForRoute,
  listRouteTechnicians,
} from "../actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Criar rota — Aqua Mappa",
};

export default async function RouteBuilderPage() {
  const [technicians, availableOrders] =
    await Promise.all([
      listRouteTechnicians(),
      listApprovedServiceOrdersForRoute(),
    ]);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <RouteBuilder
        technicians={technicians}
        initialOrders={availableOrders}
      />
    </div>
  );
}