// src/app/(private)/workorders/actions.ts
"use server";

import { prisma } from "@/lib/supabase/prisma";
import { z } from "zod";

// --- Tipo público para lista (mantido) ---
export type WorkOrderDTO = {
  id: string;
  code: string;
  title: string;
  clientName: string;
  status: "aberta" | "em_andamento" | "concluida" | "cancelada";
  scheduledAt?: string | null;
};

// --- Schema CREATE (ajustado para opcionais/nullable) ---
const CreateSchema = z.object({
  clientId: z.string().min(1),
  technicianId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)),
  title: z.string().min(2),
  description: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v : null)),
  date: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)), // YYYY-MM-DD
  startTime: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)), // HH:mm
  endTime: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)), // HH:mm
  amountCents: z.number().int().nonnegative().nullable().optional(),
});

// --- Schema UPDATE (todos os campos opcionais) ---
const UpdateSchema = z.object({
  clientId: z.string().optional(),
  technicianId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)),
  title: z.string().min(2).optional(),
  description: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v : null)),
  date: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)), // YYYY-MM-DD
  startTime: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)),
  endTime: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() ? v : null)),
  amountCents: z.number().int().nonnegative().nullable().optional(),
});

// ---------------------------------------------------------------------
// LISTAGEM
// ---------------------------------------------------------------------
export async function listWorkOrders(): Promise<WorkOrderDTO[]> {
  const rows = await prisma.workOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { select: { firstName: true, lastName: true } } },
  });

  return rows.map((w) => ({
    id: w.id,
    code: w.code,
    title: w.title,
    clientName: `${w.client.firstName} ${w.client.lastName}`.trim(),
    status: w.status as WorkOrderDTO["status"],
    scheduledAt: w.scheduledDate
      ? w.scheduledDate.toISOString().slice(0, 10)
      : null,
  }));
}

// ---------------------------------------------------------------------
// CRIAÇÃO
// ---------------------------------------------------------------------
export async function createWorkOrder(raw: unknown) {
  const input = CreateSchema.parse(raw);

  const res = await prisma.$transaction(async (tx) => {
    const tmpCode = `TMP-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const created = await tx.workOrder.create({
      data: {
        code: tmpCode,
        title: input.title,
        description: input.description ?? null,
        clientId: input.clientId,
        technicianId: input.technicianId ?? null,
        amountCents: input.amountCents ?? null,
        status: "aberta",
        scheduledDate: input.date
          ? new Date(`${input.date}T00:00:00.000`)
          : null,
        startTime: input.startTime ?? null,
        endTime: input.endTime ?? null,
      },
      select: { id: true, num: true },
    });

    const finalCode = `OS-${String(created.num).padStart(4, "0")}`;

    const updated = await tx.workOrder.update({
      where: { id: created.id },
      data: { code: finalCode },
      include: {
        client: { select: { firstName: true, lastName: true } },
      },
    });

    return updated;
  });

  return {
    id: res.id,
    code: res.code,
    title: res.title,
    clientName: `${res.client.firstName} ${res.client.lastName}`.trim(),
    status: res.status as WorkOrderDTO["status"],
    scheduledAt: res.scheduledDate
      ? res.scheduledDate.toISOString().slice(0, 10)
      : null,
  } satisfies WorkOrderDTO;
}

// ---------------------------------------------------------------------
// DETALHE (dados completos para view/edit)
// ---------------------------------------------------------------------
export async function getWorkOrderById(id: string) {
  return prisma.workOrder.findUnique({
    where: { id },
    include: {
      client: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      technician: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
}

// ---------------------------------------------------------------------
// CANCELAR OS
// ---------------------------------------------------------------------
export async function cancelWorkOrder(id: string) {
  const updated = await prisma.workOrder.update({
    where: { id },
    data: { status: "cancelada" },
    select: { id: true, status: true },
  });
  return updated;
}

// ---------------------------------------------------------------------
// ENVIAR PARA APROVAÇÃO (stub por enquanto)
// ---------------------------------------------------------------------
export async function sendWorkOrderForApproval(id: string) {
  // Aqui você dispararia notificação/app/etc.
  // Mantemos status "aberta" por enquanto.
  return { id, ok: true };
}

// ---------------------------------------------------------------------
// ATUALIZAR (edição)
// ---------------------------------------------------------------------
export async function updateWorkOrder(id: string, raw: unknown) {
  const input = UpdateSchema.parse(raw);

  const data: any = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.clientId !== undefined) data.clientId = input.clientId;
  if (input.technicianId !== undefined)
    data.technicianId = input.technicianId;
  if (input.amountCents !== undefined) data.amountCents = input.amountCents;
  if (input.date !== undefined)
    data.scheduledDate = input.date
      ? new Date(`${input.date}T00:00:00.000`)
      : null;
  if (input.startTime !== undefined) data.startTime = input.startTime;
  if (input.endTime !== undefined) data.endTime = input.endTime;

  const updated = await prisma.workOrder.update({
    where: { id },
    data,
    include: { client: { select: { firstName: true, lastName: true } } },
  });

  return {
    id: updated.id,
    code: updated.code,
    title: updated.title,
    clientName: `${updated.client.firstName} ${updated.client.lastName}`.trim(),
    status: updated.status as WorkOrderDTO["status"],
    scheduledAt: updated.scheduledDate
      ? updated.scheduledDate.toISOString().slice(0, 10)
      : null,
  } satisfies WorkOrderDTO;
}

// ---------------------------------------------------------------------
// EXCLUIR (definitivo) — usado quando a OS já está cancelada
// ---------------------------------------------------------------------
export async function deleteWorkOrder(id: string) {
  await prisma.workOrder.delete({ where: { id } });
  return { id };
}
