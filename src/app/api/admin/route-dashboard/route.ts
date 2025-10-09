import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** weekday 1..7 (Seg..Dom) a partir de YYYY-MM-DD */
function weekdayFromISO(iso: string) {
  const d = new Date(`${iso}T00:00:00.000Z`);
  const js = d.getUTCDay(); // 0..6 (Dom..Sáb)
  return ((js + 6) % 7) + 1; // 1..7 (Seg..Dom)
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toWindow(startHour: number, endHour: number) {
  return `${pad2(startHour)}:00–${pad2(endHour)}:00`;
}
function buildAddress(c: {
  poolStreet?: string | null; poolNumber?: string | null; poolCity?: string | null; poolUf?: string | null;
  street?: string | null; number?: string | null; city?: string | null; uf?: string | null;
}) {
  const street = c.poolStreet ?? c.street ?? "";
  const number = c.poolNumber ?? c.number ?? "";
  const city = c.poolCity ?? c.city ?? "";
  const uf = c.poolUf ?? c.uf ?? "";
  const line1 = [street, number].filter(Boolean).join(", ");
  const line2 = [city, uf].filter(Boolean).join(" / ");
  return [line1, line2].filter(Boolean).join(" — ");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dateISO = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const date = new Date(`${dateISO}T00:00:00.000Z`);
  const weekday = weekdayFromISO(dateISO);

  // ---------- 1) Instâncias do dia (ad-hoc) ----------
  const instances = await prisma.visitInstance.findMany({
    where: { date },
    include: {
      technician: { select: { id: true, firstName: true, lastName: true } },
      client: {
        select: {
          id: true, firstName: true, lastName: true,
          // cobrança
          street: true, number: true, city: true, uf: true,
          // piscina (preferencial)
          poolStreet: true, poolNumber: true, poolCity: true, poolUf: true,
          poolLat: true, poolLng: true,
        },
      },
    },
    orderBy: [{ technicianId: "asc" }, { startHour: "asc" }, { order: "asc" }],
  });

  type Row = {
    techId: string;
    tech: string;
    techName: string; // 👈 adicionado (mantemos 'tech' também)
    planned: number; in_progress: number; done: number; total: number;
    visits: Array<{
      id?: string; clientId?: string; client: string; address?: string;
      window: string; startHour?: number; endHour?: number;
      lat?: number | null; lng?: number | null; order?: number; status: string;
    }>;
  };
  const byTech = new Map<string, Row>();

  for (const inst of instances) {
    const techId = inst.technician.id;
    const techName = `${inst.technician.firstName} ${inst.technician.lastName}`.trim();
    const row = byTech.get(techId) ?? {
      techId,
      tech: techName,
      techName, // 👈 novo campo
      planned: 0, in_progress: 0, done: 0, total: 0, visits: [],
    };

    if (inst.status === "planned") row.planned += 1;
    else if (inst.status === "in_progress") row.in_progress += 1;
    else if (inst.status === "done") row.done += 1;
    row.total += 1;

    const c = inst.client;
    row.visits.push({
      id: inst.id,
      clientId: c.id,
      client: `${c.firstName} ${c.lastName}`.trim(),
      address: buildAddress(c),
      window: toWindow(inst.startHour, inst.endHour),
      startHour: inst.startHour,
      endHour: inst.endHour,
      lat: c.poolLat ?? null,
      lng: c.poolLng ?? null,
      order: inst.order,
      status: inst.status,
    });

    byTech.set(techId, row);
  }

  // Quais técnicos já cobertos por instância
  const covered = new Set([...byTech.keys()]);

  // ---------- 2) Fallback semanal A: RoutePlan / RoutePlanItem ----------
  const weeklyPlans = await prisma.routePlan.findMany({
    where: { weekday, active: true },
    select: {
      technicianId: true,
      technician: { select: { id: true, firstName: true, lastName: true } },
      items: {
        orderBy: { order: "asc" },
        select: {
          id: true, order: true, startMinutes: true, endMinutes: true,
          client: {
            select: {
              id: true, firstName: true, lastName: true,
              street: true, number: true, city: true, uf: true,
              poolStreet: true, poolNumber: true, poolCity: true, poolUf: true,
              poolLat: true, poolLng: true,
            },
          },
        },
      },
    },
    orderBy: [{ technicianId: "asc" }],
  });

  for (const plan of weeklyPlans) {
    const techId = plan.technicianId;
    if (covered.has(techId)) continue;

    const techName = `${plan.technician.firstName} ${plan.technician.lastName}`.trim();
    const visits = plan.items.map((it) => {
      const c = it.client!;
      const startHour = Math.floor(it.startMinutes / 60);
      const endHour = Math.floor(it.endMinutes / 60);
      return {
        id: it.id,
        clientId: c.id,
        client: `${c.firstName} ${c.lastName}`.trim(),
        address: buildAddress(c),
        window: toWindow(startHour, endHour),
        startHour, endHour,
        lat: c.poolLat ?? null, lng: c.poolLng ?? null,
        order: it.order,
        status: "planned",
      };
    });

    if (visits.length > 0) {
      byTech.set(techId, {
        techId,
        tech: techName,
        techName, // 👈 novo campo
        planned: visits.length,
        in_progress: 0,
        done: 0,
        total: visits.length,
        visits,
      });
      covered.add(techId);
    }
  }

  // ---------- 3) Fallback semanal B: VisitPlan (weekdays[] contém weekday) ----------
  const vplans = await prisma.visitPlan.findMany({
    where: { active: true, weekdays: { has: weekday } },
    select: {
      id: true, order: true, windowStart: true, windowEnd: true,
      technicianId: true,
      technician: { select: { id: true, firstName: true, lastName: true } },
      client: {
        select: {
          id: true, firstName: true, lastName: true,
          street: true, number: true, city: true, uf: true,
          poolStreet: true, poolNumber: true, poolCity: true, poolUf: true,
          poolLat: true, poolLng: true,
        },
      },
    },
    orderBy: [{ technicianId: "asc" }, { order: "asc" }],
  });

  for (const vp of vplans) {
    const techId = vp.technicianId;
    if (!covered.has(techId)) {
      const techName = `${vp.technician.firstName} ${vp.technician.lastName}`.trim();
      byTech.set(techId, {
        techId,
        tech: techName,
        techName, // 👈 novo campo
        planned: 0, in_progress: 0, done: 0, total: 0,
        visits: [],
      });
      covered.add(techId);
    }
    const row = byTech.get(techId)!;

    const c = vp.client;
    row.planned += 1;
    row.total += 1;
    row.visits.push({
      id: vp.id,
      clientId: c.id,
      client: `${c.firstName} ${c.lastName}`.trim(),
      address: buildAddress(c),
      window: toWindow(vp.windowStart, vp.windowEnd),
      startHour: vp.windowStart,
      endHour: vp.windowEnd,
      lat: c.poolLat ?? null,
      lng: c.poolLng ?? null,
      order: vp.order,
      status: "planned",
    });
  }

  // ---------- 4) Resposta (compat + extras) ----------
  const items = [...byTech.values()]
    .map((r) => ({
      ...r,
      visits: [...r.visits].sort((a, b) => {
        const ao = a.order ?? a.startHour ?? 0;
        const bo = b.order ?? b.startHour ?? 0;
        return ao - bo;
      }),
    }))
    .sort((a, b) => a.tech.localeCompare(b.tech));

  return NextResponse.json({ date: dateISO, items });
}
