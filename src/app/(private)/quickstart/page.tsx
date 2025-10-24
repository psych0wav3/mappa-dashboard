// src/app/quickstart/page.tsx
import QuickStart from "@/components/quickstart/QuickStart";

export default function QuickStartPage() {
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
          titulo="Siga o caminho rápido para dominar o Aqqua"
          subtitulo="Complete estes passos para começar a operar em minutos."
          passos={passos as any}
          storageKey="quickstart:aquacheck"
          classe="max-w-5xl mx-auto"
        />
      </div>
    
  );
}
