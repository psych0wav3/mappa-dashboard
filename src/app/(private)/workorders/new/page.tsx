import * as React from "react";
import type { Metadata } from "next";
import NewWorkOrderClient from "./NewWorkOrderClient";
import {
  listWorkOrderCustomers,
  listWorkOrderTechnicians,
} from "../actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Nova OS — Aqua Mappa",
};

export default async function NewWorkOrderPage() {
  const [customers, technicians] = await Promise.all([
    listWorkOrderCustomers(),
    listWorkOrderTechnicians(),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <NewWorkOrderClient
        customers={customers}
        technicians={technicians}
      />
    </div>
  );
}