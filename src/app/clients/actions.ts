// src/app/clients/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function listClients() {
  return prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createClient(data: any) {
  // garante unicidade também no backend
  if (data.email) {
    const exists = await prisma.client.findUnique({ where: { email: data.email } });
    if (exists) throw new Error("email já cadastrado");
  }
  if (data.phone) {
    const exists = await prisma.client.findUnique({ where: { phone: data.phone } });
    if (exists) throw new Error("telefone já cadastrado");
  }
  if (data.cpf) {
    const exists = await prisma.client.findUnique({ where: { cpf: data.cpf } });
    if (exists) throw new Error("CPF já cadastrado");
  }

  await prisma.client.create({ data });
  revalidatePath("/clients");
}

export async function updateClient(id: string, data: any) {
  // checa conflitos (exclui o próprio id)
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

  await prisma.client.update({ where: { id }, data });
  revalidatePath("/clients");
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
}
