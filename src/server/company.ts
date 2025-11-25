// src/server/company.ts
import { prisma } from "@/lib/prisma"; // ajuste o caminho pro seu client do Prisma
import { createClientServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Busca usuário logado + metadata do Supabase
export async function getCurrentUserWithMetadata() {
  const supabase = await createClientServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;

  const meta = (user.user_metadata || {}) as {
    fullName?: string;
    plan?: string;
    planStatus?: string;
    cpf?: string;
    phone?: string;
    companyName?: string;
    poolCount?: number;
  };

  return { user, meta };
}

// Retorna a empresa do usuário ou null
export async function getCompanyForUser(userId: string) {
  return prisma.companyUser.findFirst({
    where: { userId },
    include: { company: true },
  });
}

// Cria empresa a partir dos metadados do usuário + plano do Supabase
export async function createCompanyForUser() {
  const { user, meta } = await getCurrentUserWithMetadata();

  const existing = await getCompanyForUser(user.id);
  if (existing?.company) {
    return existing.company;
  }

  const planKey = (meta.plan || "starter").toLowerCase();
  const planStatus = meta.planStatus || "active";

  const name =
    meta.companyName ||
    meta.fullName ||
    user.email ||
    "Minha empresa de piscinas";

  const slugBase = slugify(name);
  let slug = slugBase;
  let attempt = 1;

  // garante slug único
  while (
    await prisma.company.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    slug = `${slugBase}-${attempt++}`;
  }

  const company = await prisma.company.create({
    data: {
      name,
      slug,
      ownerId: user.id,
      plan: planKey,
      planStatus,
      poolCount:
        typeof meta.poolCount === "number" ? meta.poolCount : null,
      users: {
        create: {
          userId: user.id,
          role: "ADMIN",
        },
      },
    },
  });

  return company;
}
