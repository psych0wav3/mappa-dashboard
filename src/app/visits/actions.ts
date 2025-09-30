// src/app/visits/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function listVisitPlans() {
  return prisma.visitPlan.findMany({
    include: { technician: true, client: true },
    orderBy: [{ technicianId: "asc" }, { order: "asc" }, { createdAt: "desc" }],
  });
}

/** Busca planos para um dia (1=Seg..6=Sáb) e, opcionalmente, para um técnico específico */
export async function listVisitPlansForDay(day: number, technicianId?: string) {
  return prisma.visitPlan.findMany({
    where: {
      weekdays: { has: day },
      ...(technicianId ? { technicianId } : {}),
    },
    include: { technician: true, client: true },
    orderBy: [{ technicianId: "asc" }, { order: "asc" }, { windowStart: "asc" }],
  });
}

export async function listTechniciansLite() {
  return prisma.technician.findMany({
    select: { id: true, firstName: true, lastName: true, email: true },
    orderBy: { firstName: "asc" },
  });
}

export async function listClientsLite() {
  return prisma.client.findMany({
    select: { id: true, firstName: true, lastName: true, street: true, number: true },
    orderBy: { firstName: "asc" },
  });
}

export async function createVisitPlan(data: {
  technicianId: string;
  clientId: string;
  weekdays: number[];
  windowStart: number;
  windowEnd: number;
  notes?: string;
}) {
  const tech = await prisma.technician.findUnique({
    where: { id: data.technicianId },
  });
  if (!tech) throw new Error("Técnico inválido");

  const cli = await prisma.client.findUnique({
    where: { id: data.clientId },
  });
  if (!cli) throw new Error("Cliente inválido");

  if (!data.weekdays?.length) throw new Error("Selecione ao menos um dia");
  if (data.windowStart >= data.windowEnd)
    throw new Error("Janela de horário inválida");

  await prisma.visitPlan.create({ data });
  revalidatePath("/visits");
}

export async function updateVisitPlan(
  id: string,
  data: Partial<{
    weekdays: number[];
    windowStart: number;
    windowEnd: number;
    notes?: string;
    order: number;
    active: boolean;
    technicianId: string;
    clientId: string;
  }>
) {
  await prisma.visitPlan.update({ where: { id }, data });
  revalidatePath("/visits");
}

export async function deleteVisitPlan(id: string) {
  await prisma.visitPlan.delete({ where: { id } });
  revalidatePath("/visits");
}
