// src/app/(private)/quickstart/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QuickStart from "@/components/quickstart/QuickStart";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function QuickStartPage() {
  const cookieStore = await cookies();

  const token = cookieStore.get("mappa_access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const passos = [
    {
      id: "adicionar_tecnicos",
      titulo: "Adicione técnicos",
      descricao:
        "Cadastre os profissionais que vão executar as visitas e receber as rotas.",
      acao: {
        label: "Adicionar técnicos",
        href: "/technicians",
      },
    },
    {
      id: "importar_clientes",
      titulo: "Cadastre ou importe clientes",
      descricao:
        "Crie clientes manualmente e registre o endereço da piscina para montagem das rotas.",
      acao: {
        label: "Clientes",
        href: "/clients",
      },
    },
    {
      id: "criar_ordens",
      titulo: "Crie ordens de serviço",
      descricao:
        "Cadastre as limpezas que precisam ser executadas antes de organizá-las em uma rota.",
      acao: {
        label: "Ordens de serviço",
        href: "/workorders",
      },
    },
    {
      id: "criar_rotas",
      titulo: "Monte a rota do dia",
      descricao:
        "Selecione o técnico, escolha a data e adicione as piscinas que serão atendidas.",
      acao: {
        label: "Criar rota",
        href: "/routes/builder",
      },
    },
    {
      id: "acompanhar_rotas",
      titulo: "Acompanhe a execução",
      descricao:
        "Veja as rotas planejadas, acompanhe os atendimentos e confira o andamento das visitas.",
      acao: {
        label: "Controle das rotas",
        href: "/routes/dashboard",
      },
    },
  ] as const;

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <QuickStart
        titulo="Siga o caminho rápido para dominar o Aqua Mappa"
        subtitulo="Complete estes passos para começar a operar em minutos."
        passos={passos as any}
        storageKey="quickstart:aqua-mappa"
        classe="mx-auto max-w-5xl"
      />
    </div>
  );
}