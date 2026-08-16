import type { Metadata } from "next";

import { listWorkOrders } from "../actions";
import PendingCustomerApprovalClient from "./PendingCustomerApprovalClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title:
    "Aguardando aprovação do cliente — Aqua Mappa",
};

export default async function PendingCustomerApprovalPage() {
  const orders = await listWorkOrders({
    status: "PendingCustomerApproval",
  });

  return <PendingCustomerApprovalClient initialOrders={orders} />;
}