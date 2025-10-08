"use server";

import { prisma } from "@/lib/prisma";

/** Técnicos “lite” */
export async function listTechniciansLite() {
  return prisma.technician.findMany({
    where: { active: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });
}

/** Clientes “lite” para o planner: inclui cobrança + piscina e coords da PISCINA */
export async function listClientsLite(): Promise<
  Array<{
    id: string;
    firstName: string;
    lastName: string;

    // cobrança (fallback)
    street: string | null;
    number: string | null;
    district: string | null; // bairro (billing)
    city: string | null;
    uf: string | null;

    // piscina (prioritário)
    poolStreet: string | null;
    poolNumber: string | null;
    poolDistrict: string | null; // bairro (pool)
    poolCity: string | null;
    poolUf: string | null;

    // coords (piscina)
    lat: number | null;
    lng: number | null;
  }>
> {
  const rows = await prisma.client.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,

      // cobrança
      street: true,
      number: true,
      district: true,
      city: true,
      uf: true,

      // piscina
      poolStreet: true,
      poolNumber: true,
      poolDistrict: true,
      poolCity: true,
      poolUf: true,

      // coords da piscina
      poolLat: true,
      poolLng: true,
    },
    orderBy: { firstName: "asc" },
  });

  return rows.map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,

    // cobrança
    street: r.street ?? null,
    number: r.number ?? null,
    district: r.district ?? null,
    city: r.city ?? null,
    uf: r.uf ?? null,

    // piscina
    poolStreet: r.poolStreet ?? null,
    poolNumber: r.poolNumber ?? null,
    poolDistrict: r.poolDistrict ?? null,
    poolCity: r.poolCity ?? null,
    poolUf: r.poolUf ?? null,

    // coords
    lat: r.poolLat ?? null,
    lng: r.poolLng ?? null,
  }));
}

/** Salva/atualiza rota semanal para 1 dia */
export async function saveWeeklyRoute(params: {
  technicianId: string;
  weekday: number; // 1..6 (Seg..Sáb)
  items: Array<{ clientId: string; windowStart: number; windowEnd: number; order: number; notes?: string }>;
}) {
  const { technicianId, weekday, items } = params;
  if (!technicianId) throw new Error("Técnico obrigatório");
  if (weekday < 1 || weekday > 6) throw new Error("Dia inválido");
  if (!items?.length) throw new Error("Adicione clientes à rota");

  await prisma.$transaction(async (tx) => {
    for (const it of items) {
      if (it.windowStart >= it.windowEnd) {
        throw new Error("Há janelas inválidas (início >= fim).");
      }
      const existing = await tx.visitPlan.findFirst({
        where: { technicianId, clientId: it.clientId, weekdays: { has: weekday } },
      });

      if (existing) {
        const newWeekdays = Array.from(new Set([...(existing.weekdays as unknown as number[]), weekday])).sort();
        await tx.visitPlan.update({
          where: { id: existing.id },
          data: {
            weekdays: newWeekdays,
            windowStart: it.windowStart,
            windowEnd: it.windowEnd,
            order: it.order,
            notes: it.notes ?? existing.notes ?? "",
            active: true,
          },
        });
      } else {
        await tx.visitPlan.create({
          data: {
            technicianId,
            clientId: it.clientId,
            weekdays: [weekday],
            windowStart: it.windowStart,
            windowEnd: it.windowEnd,
            order: it.order,
            notes: it.notes ?? "",
            active: true,
          },
        });
      }
    }
  });

  return { ok: true };
}

/** Cria rota avulsa (data específica) */
export async function saveAdHocRoute(params: {
  technicianId: string;
  dateISO: string; // YYYY-MM-DD
  items: Array<{ clientId: string; startHour: number; endHour: number; order: number; notes?: string }>;
}) {
  const { technicianId, dateISO, items } = params;
  if (!technicianId) throw new Error("Técnico obrigatório");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) throw new Error("Data inválida");
  if (!items?.length) throw new Error("Adicione clientes à rota");

  const date = new Date(`${dateISO}T00:00:00.000Z`);

  await prisma.$transaction(
    items.map((it) => {
      if (it.startHour >= it.endHour) {
        throw new Error("Há janelas inválidas (início >= fim).");
      }
      return prisma.visitInstance.create({
        data: {
          date,
          startHour: it.startHour,
          endHour: it.endHour,
          order: it.order,
          status: "planned",
          notes: it.notes ?? "",
          technician: { connect: { id: technicianId } },
          client: { connect: { id: it.clientId } },
        },
      });
    })
  );

  return { ok: true };
}

/** Salva a mesma lista para múltiplos dias */
export async function saveWeeklyRouteBulk(params: {
  technicianId: string;
  weekdays: number[];
  items: Array<{ clientId: string; windowStart: number; windowEnd: number; order: number; notes?: string }>;
}) {
  const { technicianId, weekdays, items } = params;
  if (!technicianId) throw new Error("Técnico obrigatório");
  if (!Array.isArray(weekdays) || weekdays.length === 0) throw new Error("Selecione ao menos 1 dia");
  if (!items?.length) throw new Error("Adicione clientes à rota");

  await prisma.$transaction(async (tx) => {
    for (const w of weekdays) {
      if (w < 1 || w > 6) throw new Error("Dia inválido");
      for (const it of items) {
        if (it.windowStart >= it.windowEnd) throw new Error("Há janelas inválidas (início >= fim).");

        const existing = await tx.visitPlan.findFirst({
          where: { technicianId, clientId: it.clientId, weekdays: { has: w } },
        });

        if (existing) {
          const newWeekdays = Array.from(new Set([...(existing.weekdays as unknown as number[]), w])).sort();
          await tx.visitPlan.update({
            where: { id: existing.id },
            data: {
              weekdays: newWeekdays,
              windowStart: it.windowStart,
              windowEnd: it.windowEnd,
              order: it.order,
              notes: it.notes ?? existing.notes ?? "",
              active: true,
            },
          });
        } else {
          await tx.visitPlan.create({
            data: {
              technicianId,
              clientId: it.clientId,
              weekdays: [w],
              windowStart: it.windowStart,
              windowEnd: it.windowEnd,
              order: it.order,
              notes: it.notes ?? "",
              active: true,
            },
          });
        }
      }
    }
  });

  return { ok: true };
}

/** Busca planejamento salvo (tecnico+dia) já com lat/lng do cliente */
export async function getWeeklyRoute(params: { technicianId: string; weekday: number }) {
  const { technicianId, weekday } = params;
  if (!technicianId) throw new Error("Técnico obrigatório");
  if (weekday < 1 || weekday > 6) throw new Error("Dia inválido");

  const plans = await prisma.visitPlan.findMany({
    where: { technicianId, active: true, weekdays: { has: weekday } },
    orderBy: { order: "asc" },
    include: {
      client: { select: { firstName: true, lastName: true, poolLat: true, poolLng: true } },
    },
  });

  return plans.map((p) => ({
    id: p.clientId,
    label: `${p.client.firstName} ${p.client.lastName}`.trim(),
    windowStart: p.windowStart,
    windowEnd: p.windowEnd,
    order: p.order,
    lat: p.client.poolLat ?? null,
    lng: p.client.poolLng ?? null,
  }));
}
