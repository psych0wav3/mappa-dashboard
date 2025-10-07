// src/app/calendar/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function toYMD(date: Date) {
  // zera horário para comparar por dia
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
function weekday1to6(date: Date) {
  // JS: 0=Dom..6=Sáb -> 1=Seg..6=Sáb
  const js = date.getUTCDay(); // 0..6
  return js === 0 ? 7 : js; // 1..7 se quiser domingo; usamos 1..6, então 7=domingo fora
}

/** Gera instâncias do dia a partir dos VisitPlan (se ainda não existirem) */
export async function ensureInstancesForDate(isoDate: string) {
  const d = toYMD(new Date(isoDate));
  const wd = weekday1to6(d); // 1..7
  // Pegamos apenas seg..sáb (=1..6)
  if (wd === 7) return; // não gera domingo

  const plans = await prisma.visitPlan.findMany({
    where: { active: true, weekdays: { has: wd } },
    orderBy: [{ technicianId: "asc" }, { order: "asc" }],
  });

  for (const p of plans) {
    const exists = await prisma.visitInstance.findFirst({
      where: { planId: p.id, date: d },
      select: { id: true },
    });
    if (exists) continue;

    // gerar ordem "larga" por técnico (100, 110, 120…)
    const last = await prisma.visitInstance.findFirst({
      where: { date: d, technicianId: p.technicianId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (last?.order ?? 90) + 10;

    await prisma.visitInstance.create({
      data: {
        date: d,
        startHour: p.windowStart,
        endHour: p.windowEnd,
        order: nextOrder,
        status: "planned",
        notes: p.notes ?? null,
        planId: p.id,
        technicianId: p.technicianId,
        clientId: p.clientId,
      },
    });
  }

  revalidatePath("/calendar");
}

/** Lista instâncias por dia (opcionalmente filtra técnico) */
export async function listInstances(isoDate: string, technicianId?: string) {
  const d = toYMD(new Date(isoDate));
  return prisma.visitInstance.findMany({
    where: { date: d, ...(technicianId ? { technicianId } : {}) },
    include: {
      technician: { select: { id: true, firstName: true, lastName: true } },
      client: { select: { id: true, firstName: true, lastName: true, street: true, number: true } },
    },
    orderBy: [{ technicianId: "asc" }, { order: "asc" }],
  });
}

export async function listTechniciansLite() {
  return prisma.technician.findMany({
    where: { active: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });
}

/** Reordena as instâncias de um técnico no dia */
export async function reorderInstances(isoDate: string, technicianId: string, orderedIds: string[]) {
  const d = toYMD(new Date(isoDate));
  // escrever em lotes
  let order = 100;
  const ops = orderedIds.map((id) =>
    prisma.visitInstance.update({
      where: { id },
      data: { order: order += 10 },
    })
  );
  await prisma.$transaction(ops);
  revalidatePath("/calendar");
}

/** Move uma instância para outro técnico e posição */
export async function moveInstance(isoDate: string, instanceId: string, targetTechId: string, beforeId?: string) {
  const d = toYMD(new Date(isoDate));

  // calcula ordem:
  let newOrder = 100;
  if (beforeId) {
    const before = await prisma.visitInstance.findUnique({ where: { id: beforeId } });
    if (before) newOrder = before.order - 1; // simples; depois normaliza
  } else {
    const last = await prisma.visitInstance.findFirst({
      where: { date: d, technicianId: targetTechId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    newOrder = (last?.order ?? 90) + 10;
  }

  await prisma.visitInstance.update({
    where: { id: instanceId },
    data: { technicianId: targetTechId, order: newOrder },
  });

  revalidatePath("/calendar");
}

export async function updateInstance(id: string, data: Partial<{ startHour: number; endHour: number; notes: string; status: string }>) {
  await prisma.visitInstance.update({ where: { id }, data });
  revalidatePath("/calendar");
}

export async function createInstance(isoDate: string, data: { technicianId: string; clientId: string; startHour: number; endHour: number; notes?: string }) {
  const d = toYMD(new Date(isoDate));
  const last = await prisma.visitInstance.findFirst({
    where: { date: d, technicianId: data.technicianId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? 90) + 10;

  await prisma.visitInstance.create({
    data: {
      date: d,
      startHour: data.startHour,
      endHour: data.endHour,
      notes: data.notes ?? null,
      order: nextOrder,
      status: "planned",
      technicianId: data.technicianId,
      clientId: data.clientId,
    },
  });
  revalidatePath("/calendar");
}

export async function deleteInstance(id: string) {
  await prisma.visitInstance.delete({ where: { id } });
  revalidatePath("/calendar");
}
