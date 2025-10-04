// src/app/routes/actions.ts
"use server";

import { prisma } from "@/lib/prisma";

/** Listas “lite” para selects/autocomplete */
export async function listTechniciansLite() {
  return prisma.technician.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });
}

export async function listClientsLite() {
  return prisma.client.findMany({
    select: { id: true, firstName: true, lastName: true, street: true, number: true },
    orderBy: { firstName: "asc" },
  });
}

/** Semanal (recorrente): salva/atualiza VisitPlan para 1 dia da semana */
export async function saveWeeklyRoute(params: {
  technicianId: string;
  weekday: number; // 1..6 (Seg..Sáb)
  items: Array<{ clientId: string; windowStart: number; windowEnd: number; order: number; notes?: string }>;
}) {
  const { technicianId, weekday, items } = params;

  // validações simples
  if (!technicianId) throw new Error("Técnico obrigatório");
  if (weekday < 1 || weekday > 6) throw new Error("Dia inválido");
  if (!items?.length) throw new Error("Adicione clientes à rota");

  // upsert por (technicianId, clientId, weekday):
  // Como não há unique composto no schema, fazemos findFirst e atualizamos/criamos.
  await prisma.$transaction(async (tx) => {
    for (const it of items) {
      if (it.windowStart >= it.windowEnd) {
        throw new Error("Há janelas inválidas (início >= fim).");
      }

      const existing = await tx.visitPlan.findFirst({
        where: {
          technicianId,
          clientId: it.clientId,
          weekdays: { has: weekday },
        },
      });

      if (existing) {
        // garante que o dia está na lista e atualiza janela/ordem/active
        const newWeekdays = Array.from(
          new Set([...(existing.weekdays as any as number[]), weekday])
        ).sort();
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

  // não removo planos antigos automaticamente — manter histórico; limpeza manual depois se quiser.
  return { ok: true };
}

/** Avulsa (exceção): cria VisitInstance para uma data específica */
// src/app/routes/actions.ts
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
          // ❌ não envie planId aqui (avulsa)
          // ✅ relações aninhadas
          technician: { connect: { id: technicianId } },
          client: { connect: { id: it.clientId } },
        },
      });
    })
  );

  return { ok: true };
}


/** Salva a mesma lista (ordem + janelas) para vários dias da semana */
export async function saveWeeklyRouteBulk(params: {
  technicianId: string;
  weekdays: number[]; // ex.: [2,3,4]
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
          const newWeekdays = Array.from(new Set([...(existing.weekdays as any as number[]), w])).sort();
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
