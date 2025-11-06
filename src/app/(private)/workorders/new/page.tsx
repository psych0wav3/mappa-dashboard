import * as React from "react";
import type { Metadata } from "next";
import NewWorkOrderClient from "./NewWorkOrderClient";
import type { ClientLite } from "@/components/routes/ClientSearchCombobox";

export const metadata: Metadata = {
  title: "Nova Ordem de Serviço — Aqua Mappa",
};

async function getClientsLite(): Promise<ClientLite[]> {
  try {
    const mod = await import("@/app/(private)/clients/actions");
    if (typeof mod.listClients === "function") {
      const rows = await mod.listClients();
      return (rows ?? []).map((c: any) => ({
        id: String(c.id),
        firstName: c.firstName ?? "",
        lastName: c.lastName ?? "",
        street: c.poolStreet ?? c.street ?? null,
        number: c.poolNumber ?? c.number ?? null,
        city: c.poolCity ?? c.city ?? null,
        uf: c.poolUf ?? c.uf ?? null,
        lat: c.poolLat ?? c.lat ?? null,
        lng: c.poolLng ?? c.lng ?? null,
      }));
    }
  } catch {}
  return [];
}

type TechLite = { id: string; name: string; email?: string | null };

async function getTechniciansLite(): Promise<TechLite[]> {
  try {
    const mod = await import("@/app/(private)/technicians/actions");
    if (typeof (mod as any).listTechnicians === "function") {
      const rows = await (mod as any).listTechnicians();
      return (rows ?? []).map((t: any) => ({
        id: String(t.id),
        name: `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || t.email,
        email: t.email ?? null,
      }));
    }
  } catch {}

  try {
    const { prisma } = await import("@/lib/supabase/prisma");
    const rows = await prisma.technician.findMany({
      where: { active: true },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    return rows.map((t) => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`.trim(),
      email: t.email,
    }));
  } catch {
    return [];
  }
}

export default async function NewWorkOrderPage() {
  const [clients, technicians] = await Promise.all([
    getClientsLite(),
    getTechniciansLite(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mb-4 mt-4 rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-800 shadow-sm">
        <h1 className="text-lg font-semibold">Nova Ordem de Serviço</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* ⬇️ use "new" (não "create") */}
        <NewWorkOrderClient mode="new" clients={clients} technicians={technicians} />
      </div>
    </div>
  );
}
