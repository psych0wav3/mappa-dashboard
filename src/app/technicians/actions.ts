"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTechnician(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cpf?: string;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  uf?: string;
  cep?: string;
}) {
  const tech = await prisma.technician.create({ data });
  revalidatePath("/technicians");
  return tech;
}

export async function updateTechnician(
  id: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    cpf?: string;
    street?: string;
    number?: string;
    district?: string;
    city?: string;
    uf?: string;
    cep?: string;
    active?: boolean;
  }
) {
  const tech = await prisma.technician.update({
    where: { id },
    data,
  });
  revalidatePath("/technicians");
  return tech;
}

export async function deleteTechnician(id: string) {
  const tech = await prisma.technician.delete({ where: { id } });
  revalidatePath("/technicians");
  return tech;
}

export async function listTechnicians() {
  return await prisma.technician.findMany({
    orderBy: { firstName: "asc" },
  });
}
