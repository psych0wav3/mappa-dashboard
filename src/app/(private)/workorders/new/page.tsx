import type { Metadata } from "next";
import NewWorkOrderClient from "./NewWorkOrderClient";
import {
  listCustomerOptions,
  listTechnicianOptions,
} from "../actions";

export const metadata: Metadata = {
  title: "Nova OS — Aqua Mappa",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function NewWorkOrderPage() {
  const [customers, technicians] = await Promise.all([
    listCustomerOptions(),
    listTechnicianOptions(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mb-4 mt-4 rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-800 shadow-sm">
        <h1 className="text-lg font-semibold">Nova Ordem de Serviço</h1>
      </div>

      <NewWorkOrderClient customers={customers} technicians={technicians} />
    </div>
  );
}