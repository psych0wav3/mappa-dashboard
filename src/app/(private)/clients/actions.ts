// src/app/(private)/clients/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// 🔐 helpers de autenticação/assinatura
import { getCurrentUser } from "@/lib/auth-roles";
import {
  getActiveSubscriptionForUser,
  getTotalClientsForUser,
} from "@/lib/subscription";

// Campos permitidos no modelo Client
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
  // ✅ coordenadas da piscina (usadas no planner / mapa)
  "poolLat",
  "poolLng",
  // legados (mantidos)
  "poolSize",
  "cleaningFrequency",
  "cleaningWindow",
  "payDay",
  "active",
]);

function sanitizeClientInput(input: any) {
  const out: Record<string, any> = {};
  for (const k of Object.keys(input || {})) {
    if (!CLIENT_FIELDS.has(k)) continue; // ignora campos desconhecidos (ex.: hasCompany, days etc.)
    let v = input[k];

    // string vazia -> null
    if (v === "") v = null;

    // normaliza coords se vierem como string
    if ((k === "poolLat" || k === "poolLng") && v != null) {
      const num = typeof v === "string" ? Number(v.trim()) : Number(v);
      v = Number.isFinite(num) ? num : null;
    }

    out[k] = v;
  }

  // normalizações simples
  if (out.uf && typeof out.uf === "string") out.uf = out.uf.toUpperCase();
  if (out.poolUf && typeof out.poolUf === "string")
    out.poolUf = out.poolUf.toUpperCase();

  return out;
}

export async function listClients() {
  return prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createClient(data: any) {
  // 🔐 1) Garante usuário logado
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Você precisa estar autenticado para cadastrar clientes.");
  }

  // 💳 2) Verifica assinatura ativa
  const subscription = await getActiveSubscriptionForUser(user.id);
  if (!subscription) {
    throw new Error(
      "Sua assinatura não está ativa. Atualize o pagamento para cadastrar novos clientes.",
    );
  }

  // 📊 3) Verifica limite de clientes do plano
  const totalClients = await getTotalClientsForUser(user.id);
  if (totalClients >= subscription.maxClients) {
    throw new Error(
      `Você atingiu o limite de ${subscription.maxClients} clientes do seu plano. Faça upgrade para continuar cadastrando.`,
    );
  }

  // 🔎 4) unicidade (email/phone/cpf/cnpj)
  if (data.email) {
    const exists = await prisma.client.findUnique({
      where: { email: data.email },
    });
    if (exists) throw new Error("email já cadastrado");
  }
  if (data.phone) {
    const exists = await prisma.client.findUnique({
      where: { phone: data.phone },
    });
    if (exists) throw new Error("telefone já cadastrado");
  }
  if (data.cpf) {
    const exists = await prisma.client.findUnique({
      where: { cpf: data.cpf },
    });
    if (exists) throw new Error("CPF já cadastrado");
  }
  if (data.cnpj) {
    // usa findFirst para evitar erro de tipo caso o client não tenha sido regenerado ainda
    const exists = await prisma.client.findFirst({
      where: { cnpj: data.cnpj } as any,
    });
    if (exists) throw new Error("CNPJ já cadastrado");
  }

  const payload = sanitizeClientInput(data) as Prisma.ClientCreateInput;
  await prisma.client.create({ data: payload });
  revalidatePath("/clients");
}

export async function updateClient(id: string, data: any) {
  if (data.email) {
    const c = await prisma.client.findUnique({ where: { email: data.email } });
    if (c && c.id !== id) throw new Error("email já cadastrado");
  }
  if (data.phone) {
    const c = await prisma.client.findUnique({ where: { phone: data.phone } });
    if (c && c.id !== id) throw new Error("telefone já cadastrado");
  }
  if (data.cpf) {
    const c = await prisma.client.findUnique({ where: { cpf: data.cpf } });
    if (c && c.id !== id) throw new Error("CPF já cadastrado");
  }
  if (data.cnpj) {
    const c = await prisma.client.findFirst({
      where: { cnpj: data.cnpj } as any,
    });
    if (c && c.id !== id) throw new Error("CNPJ já cadastrado");
  }

  const payload = sanitizeClientInput(data) as Prisma.ClientUpdateInput;
  await prisma.client.update({ where: { id }, data: payload });
  revalidatePath("/clients");
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
}

export async function saveClientCoords(id: string, lat: number, lng: number) {
  // normaliza para número
  const _lat = Number(lat);
  const _lng = Number(lng);
  if (!Number.isFinite(_lat) || !Number.isFinite(_lng)) {
    throw new Error("Coordenadas inválidas");
  }

  await prisma.client.update({
    where: { id },
    data: { poolLat: _lat, poolLng: _lng },
  });

  // revalida telas que consomem esses dados
  revalidatePath("/clients");
  revalidatePath("/routes/builder");
}
