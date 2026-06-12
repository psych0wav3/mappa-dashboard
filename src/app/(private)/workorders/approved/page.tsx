import * as React from "react";
import type { Metadata } from "next";
import ApprovedWorkOrdersClient from "./ApprovedWorkOrdersClient";
import { listWorkOrders } from "../actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "OS Aprovadas — Aqua Mappa",
};

export default async function ApprovedWorkOrdersPage() {
  const data = await listWorkOrders();

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            OS Aprovadas
          </h1>
        </div>

        <ApprovedWorkOrdersClient initialData={data} />
      </div>
    </div>
  );
}