import { notFound } from "next/navigation";
import NewWorkOrderClient from "../../new/NewWorkOrderClient";
import type { ClientLite } from "@/components/routes/ClientSearchCombobox";

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

async function getInitial(id: string) {
  const { getWorkOrderById } = await import("../../actions");
  const w = await getWorkOrderById(id);
  if (!w) return null;
  return {
    id: w.id,
    clientId: w.clientId,
    technicianId: w.technicianId,
    title: w.title,
    description: w.description,
    amountCents: w.amountCents,
    scheduledDate: w.scheduledDate ? w.scheduledDate.toISOString().slice(0, 10) : null,
    startTime: w.startTime,
    endTime: w.endTime,
  };
}

export default async function EditWorkOrderPage({ params }: { params: { id: string } }) {
  const [clients, technicians, initial] = await Promise.all([
    getClientsLite(),
    getTechniciansLite(),
    getInitial(params.id),
  ]);

  if (!initial) return notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mb-4 mt-4 rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-800 shadow-sm">
        <h1 className="text-lg font-semibold">Editando OS {initial.id}</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <NewWorkOrderClient
          mode="edit"
          clients={clients}
          technicians={technicians}
          initial={initial}
        />
      </div>
    </div>
  );
}
