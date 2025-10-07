"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma, TechnicianRole } from "@prisma/client";

// helpers
const onlyDigits = (s?: string | null) => (s ? s.replace(/\D+/g, "") : null);
const toNull = (s?: string | null) => {
  if (s === undefined || s === null) return null;
  const t = String(s).trim();
  return t.length ? t : null;
};

export async function createTechnician(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cpf?: string;
  role: "TECH" | "OWNER";
}) {
  const phone = toNull(data.phone);
  const cpf = toNull(data.cpf);

  const tech = await prisma.technician.create({
    data: {
      firstName: data.firstName.trim(),
      lastName:  data.lastName.trim(),
      email:     data.email.trim(),
      phone,                          // null quando vazio
      phoneDigits: onlyDigits(phone), // coerente com phone
      cpf,                            // se preferir só dígitos: onlyDigits(cpf) as any
      role: data.role as TechnicianRole,
    },
  });

  revalidatePath("/technicians");
  return tech;
}

/** Updates parciais, aplicando apenas campos definidos. */
export async function updateTechnician(
  id: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    cpf: string;
    role: "TECH" | "OWNER";
    active: boolean;
  }>
) {
  const patch: Prisma.TechnicianUpdateInput = {};

  if (data.firstName !== undefined) patch.firstName = data.firstName.trim();
  if (data.lastName  !== undefined) patch.lastName  = data.lastName.trim();
  if (data.email     !== undefined) patch.email     = data.email.trim();

  if (data.phone !== undefined) {
    const phone = toNull(data.phone);
    patch.phone = phone;
    patch.phoneDigits = onlyDigits(phone);
  }

  if (data.cpf !== undefined) {
    const cpf = toNull(data.cpf);
    patch.cpf = cpf;
  }

  if (data.role !== undefined) {
    patch.role = data.role as TechnicianRole;
  }

  if (typeof data.active === "boolean") {
    patch.active = data.active;
  }

  const tech = await prisma.technician.update({
    where: { id },
    data: patch,
  });

  revalidatePath("/technicians");
  return tech;
}

/** Use este para os botões Ativar/Inativar do modal. */
export async function toggleTechnicianActive(id: string, makeActive: boolean) {
  const tech = await prisma.technician.update({
    where: { id },
    data: { active: makeActive },
  });
  revalidatePath("/technicians");
  return tech;
}

export async function deleteTechnician(id: string) {
  const tech = await prisma.technician.delete({ where: { id } });
  revalidatePath("/technicians");
  return tech;
}

export async function listTechnicians(opts?: { q?: string; active?: boolean }) {
  const where: Prisma.TechnicianWhereInput = {};

  if (typeof opts?.active === "boolean") where.active = opts.active;

  if (opts?.q) {
    const q = opts.q.trim();
    const qDigits = onlyDigits(q) ?? undefined;
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName:  { contains: q, mode: "insensitive" } },
      { email:     { contains: q, mode: "insensitive" } },
      ...(qDigits ? [{ phoneDigits: { contains: qDigits } } as Prisma.TechnicianWhereInput] : []),
    ];
  }

  return prisma.technician.findMany({
    where,
    orderBy: [{ active: "desc" }, { firstName: "asc" }],
  });
}
