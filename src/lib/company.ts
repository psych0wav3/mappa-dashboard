// src/lib/company.ts
import { prisma } from "@/lib/prisma";
import { createClientServer } from "@/lib/supabase/server";

export async function getCurrentCompany() {
  const supabase = await createClientServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) return null;

  const cu = await prisma.companyUser.findFirst({
    where: { userId: data.user.id },
    include: { company: true },
  });

  return cu?.company ?? null;
}
