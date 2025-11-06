import * as React from "react";
import type { Metadata } from "next";
import WorkOrdersHome from "@/components/workorders/WorkOrdersHome";
import { listWorkOrders } from "./actions";

export const metadata: Metadata = {
  title: "Ordem de Serviço — Aqua Mappa",
};

export default async function WorkOrdersPage() {
  const orders = await listWorkOrders();
  return <WorkOrdersHome initialData={orders} />;
}
