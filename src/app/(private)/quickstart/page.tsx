// src/app/(private)/quickstart/page.tsx
import { redirect } from "next/navigation";
import QuickStart from "@/components/quickstart/QuickStart";
import { createClientServer } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default async function QuickStartPage() {
  // 🔐 Usuário logado
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

  // 👇 cast só para este arquivo, pra não brigar com o tipo do PrismaClient
  const db = prisma as any;

  // 🔎 Verifica se o usuário já está vinculado a alguma empresa
  const existingCompanyUser = await db.companyUser.findFirst({
    where: { userId: user.id },
    include: { company: true },
  });

  if (!existingCompanyUser) {
    // 🏢 Cria empresa a partir dos metadados
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
      await db.company.findUnique({
        where: { slug },
        select: { id: true },
      })
    ) {
      slug = `${slugBase}-${attempt++}`;
    }

    await db.company.create({
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
  }

  const passos = [
    {
      id: "adicionar_tecnicos",
      titulo: "Adicione técnicos",
      descricao:
        "Cadastre os profissionais que vão executar as visitas e gere os acessos deles.",
      acao: { label: "Adicionar técnicos", href: "/technicians" },
    },
    {
      id: "importar_clientes",
      titulo: "Cadastre ou importe clientes",
      descricao:
        "Crie clientes manualmente ou faça upload de uma planilha para acelerar.",
      acao: { label: "Clientes", href: "/clients" },
    },
    {
      id: "criar_rotas",
      titulo: "Monte sua rota semanal",
      descricao:
        "Use o construtor de rotas para planejar o dia de cada técnico.",
      acao: { label: "Criar rota", href: "/routes/builder" },
    },
    {
      id: "baixar_app",
      titulo: "Instale o app do técnico",
      descricao:
        "Baixe o aplicativo no celular do técnico para receber as visitas do dia e registrar serviços.",
      acao: { label: "Instruções de download", href: "/help/tecnico-app" },
    },
  ] as const;

  return (
    <div className="min-h-screen bg-neutral-50 px-4 sm:px-6 lg:px-8 py-6">
      <QuickStart
        titulo="Siga o caminho rápido para dominar o Aqua Mappa"
        subtitulo="Complete estes passos para começar a operar em minutos."
        passos={passos as any}
        storageKey="quickstart:aquacheck"
        classe="max-w-5xl mx-auto"
      />
    </div>
  );
}
