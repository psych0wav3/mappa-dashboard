// src/app/api/admin/route-dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dateISO = url.searchParams.get("date") ?? new Date().toISOString().slice(0,10);
  const date = new Date(`${dateISO}T00:00:00.000Z`);

  const instances = await prisma.visitInstance.findMany({
    where: { date },
    include: {
      technician: { select: { firstName: true, lastName: true } },
      client: { select: { firstName: true, lastName: true } },
    },
    orderBy: [{ technicianId: "asc" }, { startHour: "asc" }],
  });

  const byTech = new Map<string, {
    tech: string; planned: number; in_progress: number; done: number; total: number;
    visits: Array<{ client: string; window: string; status: string }>;
  }>();

  for (const i of instances) {
    const techName = `${i.technician.firstName} ${i.technician.lastName}`.trim();
    const row = byTech.get(techName) ?? {
      tech: techName, planned: 0, in_progress: 0, done: 0, total: 0, visits: [],
    };

    // status (planned | in_progress | done)
    (row as any)[i.status] = ((row as any)[i.status] ?? 0) + 1;
    row.total += 1;

    row.visits.push({
      client: `${i.client.firstName} ${i.client.lastName}`.trim(),
      window: `${String(i.startHour).padStart(2,"0")}:00–${String(i.endHour).padStart(2,"0")}:00`,
      status: i.status,
    });

    byTech.set(techName, row);
  }

  return NextResponse.json({ date: dateISO, items: Array.from(byTech.values()) });
}
