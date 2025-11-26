// src/app/(private)/technicians/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma, TechnicianRole } from "@prisma/client";
import { createClientServer } from "@/lib/supabase/server";

// helpers
const onlyDigits = (s?: string | null) => (s ? s.replace(/\D+/g, "") : null);
const toNull = (s?: string | null) => {
  if (s === undefined || s === null) return null;
  const t = String(s).trim();
  return t.length ? t : null;
};

// 🔐 Puxa a companyId da empresa vinculada ao usuário logado
async function getCurrentCompanyIdOrThrow() {
  const supabase = await createClientServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    throw new Error("Usuário não autenticado.");
  }

  const userId = data.user.id;

  const companyUser = await prisma.companyUser.findFirst({
    where: { userId },
    select: { companyId: true },
  });

  if (!companyUser) {
    throw new Error("Usuário não está vinculado a nenhuma empresa.");
  }

  return companyUser.companyId;
}

// garante que o técnico pertence à empresa atual
async function ensureTechBelongsToCompany(id: string, companyId: string) {
  const existing = await prisma.technician.findUnique({
    where: { id },
    select: { id: true, companyId: true },
  });

  if (!existing || existing.companyId !== companyId) {
    throw new Error("Técnico não encontrado para esta empresa.");
  }
}

// -----------------------------------------------------
// CREATE
// -----------------------------------------------------
export async function createTechnician(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cpf?: string;
  role: "TECH" | "OWNER";
}) {
  const companyId = await getCurrentCompanyIdOrThrow();

  const phone = toNull(data.phone);
  const cpf = toNull(data.cpf);

  const tech = await prisma.technician.create({
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone,
      phoneDigits: onlyDigits(phone),
      cpf,
      role: data.role as TechnicianRole,
      companyId, // 👈 amarra o técnico à empresa
    },
  });

  revalidatePath("/technicians");
  return tech;
}

// -----------------------------------------------------
// UPDATE
// -----------------------------------------------------
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
  }>,
) {
  const companyId = await getCurrentCompanyIdOrThrow();
  await ensureTechBelongsToCompany(id, companyId);

  const patch: Prisma.TechnicianUpdateInput = {};

  if (data.firstName !== undefined) patch.firstName = data.firstName.trim();
  if (data.lastName !== undefined) patch.lastName = data.lastName.trim();
  if (data.email !== undefined) patch.email = data.email.trim();

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

// -----------------------------------------------------
// TOGGLE ACTIVE
// -----------------------------------------------------
export async function toggleTechnicianActive(id: string, makeActive: boolean) {
  const companyId = await getCurrentCompanyIdOrThrow();
  await ensureTechBelongsToCompany(id, companyId);

  const tech = await prisma.technician.update({
    where: { id },
    data: { active: makeActive },
  });

  revalidatePath("/technicians");
  return tech;
}

// -----------------------------------------------------
// DELETE
// -----------------------------------------------------
export async function deleteTechnician(id: string) {
  const companyId = await getCurrentCompanyIdOrThrow();
  await ensureTechBelongsToCompany(id, companyId);

  const tech = await prisma.technician.delete({ where: { id } });
  revalidatePath("/technicians");
  return tech;
}

// -----------------------------------------------------
// LIST
// -----------------------------------------------------
export async function listTechnicians(opts?: { q?: string; active?: boolean }) {
  const companyId = await getCurrentCompanyIdOrThrow();

  const where: Prisma.TechnicianWhereInput = {
    companyId, // 👈 sempre filtra pela empresa atual
  };

  if (typeof opts?.active === "boolean") where.active = opts.active;

  if (opts?.q) {
    const q = opts.q.trim();
    const qDigits = onlyDigits(q) ?? undefined;
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      ...(qDigits
        ? [{ phoneDigits: { contains: qDigits } } as Prisma.TechnicianWhereInput]
        : []),
    ];
  }

  return prisma.technician.findMany({
    where,
    orderBy: [{ active: "desc" }, { firstName: "asc" }],
  });
}
