"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { createClientServer } from "@/lib/supabase/server";

/// =========================
/// Helpers multi-tenant
/// =========================

/**
 * Retorna o companyId da empresa atual do usuário logado
 * (mesma lógica usada em technicians/actions.ts)
 */
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

/**
 * Garante que o cliente pertence à empresa atual
 */
async function ensureClientBelongsToCompany(id: string, companyId: string) {
  const existing = await prisma.client.findUnique({
    where: { id },
    select: { id: true, companyId: true },
  });

  if (!existing || existing.companyId !== companyId) {
    throw new Error("Cliente não encontrado para esta empresa.");
  }
}

/// =========================
/// Sanitização de Inputs
/// =========================

const CLIENT_FIELDS = new Set([
  "firstName",
  "lastName",
  "email",
  "phone",
  "cpf",
  "companyName",
  "cnpj",
  "street",
  "number",
  "district",
  "city",
  "uf",
  "cep",
  "notes",
  "poolStreet",
  "poolNumber",
  "poolDistrict",
  "poolCity",
  "poolUf",
  "poolCep",
  "poolLat",
  "poolLng",
  "poolSize",
  "cleaningFrequency",
  "cleaningWindow",
  "payDay",
  "active",
]);

function sanitizeClientInput(input: any) {
  const out: Record<string, any> = {};

  for (const k of Object.keys(input || {})) {
    if (!CLIENT_FIELDS.has(k)) continue;
    let v = input[k];

    if (v === "") v = null;

    if ((k === "poolLat" || k === "poolLng") && v != null) {
      const num = typeof v === "string" ? Number(v.trim()) : Number(v);
      v = Number.isFinite(num) ? num : null;
    }

    out[k] = v;
  }

  if (out.uf && typeof out.uf === "string") out.uf = out.uf.toUpperCase();
  if (out.poolUf && typeof out.poolUf === "string") {
    out.poolUf = out.poolUf.toUpperCase();
  }

  return out;
}

/// =========================
/// Ações — CRUD
/// =========================

// 🔎 LISTAR clientes da empresa atual
export async function listClients() {
  const companyId = await getCurrentCompanyIdOrThrow();

  return prisma.client.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
}

// ➕ CRIAR cliente
export async function createClient(data: any) {
  const companyId = await getCurrentCompanyIdOrThrow();

  // 💳 (regra de assinatura DESLIGADA por enquanto em dev)
  /*
  const supabase = await createClientServer();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) throw new Error("Usuário não autenticado.");

  const subscription = await getActiveSubscriptionForUser(userId);
  if (!subscription) throw new Error("Sua assinatura não está ativa.");
  const totalClients = await getTotalClientsForUser(userId);
  if (totalClients >= subscription.maxClients) {
    throw new Error(`Limite do plano atingido.`);
  }
  */

  // unicidade global (mantida)
  if (data.email) {
    const exists = await prisma.client.findUnique({
      where: { email: data.email },
    });
    if (exists) throw new Error("Email já cadastrado.");
  }

  if (data.phone) {
    const exists = await prisma.client.findUnique({
      where: { phone: data.phone },
    });
    if (exists) throw new Error("Telefone já cadastrado.");
  }

  if (data.cpf) {
    const exists = await prisma.client.findUnique({
      where: { cpf: data.cpf },
    });
    if (exists) throw new Error("CPF já cadastrado.");
  }

  if (data.cnpj) {
    const exists = await prisma.client.findFirst({
      where: { cnpj: data.cnpj } as any,
    });
    if (exists) throw new Error("CNPJ já cadastrado.");
  }

  const payload = sanitizeClientInput(data) as Prisma.ClientCreateInput;

  await prisma.client.create({
    data: {
      ...payload,
      companyId, // 👈 amarra o cliente à empresa atual
    },
  });

  revalidatePath("/clients");
}

// ✏️ ATUALIZAR cliente
export async function updateClient(id: string, data: any) {
  const companyId = await getCurrentCompanyIdOrThrow();
  await ensureClientBelongsToCompany(id, companyId);

  if (data.email) {
    const c = await prisma.client.findUnique({ where: { email: data.email } });
    if (c && c.id !== id) throw new Error("Email já cadastrado.");
  }

  if (data.phone) {
    const c = await prisma.client.findUnique({ where: { phone: data.phone } });
    if (c && c.id !== id) throw new Error("Telefone já cadastrado.");
  }

  if (data.cpf) {
    const c = await prisma.client.findUnique({ where: { cpf: data.cpf } });
    if (c && c.id !== id) throw new Error("CPF já cadastrado.");
  }

  if (data.cnpj) {
    const c = await prisma.client.findFirst({
      where: { cnpj: data.cnpj } as any,
    });
    if (c && c.id !== id) throw new Error("CNPJ já cadastrado.");
  }

  const payload = sanitizeClientInput(data) as Prisma.ClientUpdateInput;

  await prisma.client.update({
    where: { id },
    data: payload,
  });

  revalidatePath("/clients");
}

// 🗑 EXCLUIR cliente
export async function deleteClient(id: string) {
  const companyId = await getCurrentCompanyIdOrThrow();
  await ensureClientBelongsToCompany(id, companyId);

  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
}

// 📍 ATUALIZAR COORDENADAS DO CLIENTE
export async function saveClientCoords(id: string, lat: number, lng: number) {
  const companyId = await getCurrentCompanyIdOrThrow();
  await ensureClientBelongsToCompany(id, companyId);

  const _lat = Number(lat);
  const _lng = Number(lng);
  if (!Number.isFinite(_lat) || !Number.isFinite(_lng)) {
    throw new Error("Coordenadas inválidas.");
  }

  await prisma.client.update({
    where: { id },
    data: { poolLat: _lat, poolLng: _lng },
  });

  revalidatePath("/clients");
  revalidatePath("/routes/builder");
}
