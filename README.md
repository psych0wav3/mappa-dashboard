# 📘 Aqua Check Dashboard

Painel administrativo e operacional do **Aqua Check**, desenvolvido em **Next.js + React**.  
Focado em **gestão de técnicos, clientes, visitas e rotas**, com recursos avançados de calendário, planejamento de rotas e integração com mapas.

---

## 🚀 Tecnologias principais

- **Frontend**
  - [Next.js](https://nextjs.org/) (App Router)
  - [React](https://react.dev/) + Server Actions
  - [Tailwind CSS](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/) (componentes UI)
  - [Lucide Icons](https://lucide.dev/) (ícones)
  - [DnD Kit](https://dndkit.com/) (drag-and-drop nas rotas)

- **Backend**
  - [Prisma ORM](https://www.prisma.io/)  
  - [Postgres](https://www.postgresql.org/) (hospedado no Supabase)

- **Integrações**
  - Google Maps JavaScript API (mapas, geocodificação, autocomplete, advanced markers)

---

## 📂 Estrutura de pastas

src/
├─ app/
│ ├─ (private)/
│ │ ├─ clients/ → gestão de clientes
│ │ ├─ technicians/ → gestão de técnicos
│ │ ├─ routes/ → criar rota, atribuir rota, dashboard da rota
│ │ ├─ dashboard/ → painel de controle
│ │ └─ quickstart/ → onboarding (passo a passo inicial)
│ └─ (site)/
│ ├─ builder/ → página de apresentação
│ ├─ dashboard/ → landing interna
│ └─ using/ → guias de uso
│
├─ components/
│ ├─ routes/ → RouteBuilder, RouteDashboard, RouteListCard, etc.
│ ├─ clients/ → tabelas e formulários de clientes
│ ├─ calendar/ → calendário custom
│ ├─ ui/ → base shadcn + custom (botões, inputs, etc.)
│ └─ shell/ → layout geral (sidebar + topbar)
│
├─ lib/ → utilitários (ex.: geocode, helpers)
├─ server/ → lógica server-side (geocodificação, ações Prisma)
└─ prisma/ → schema Prisma


## 📌 Principais módulos

- **Quickstart**  
  Onboarding guiado em formato de checklist com progresso salvo em `localStorage`.

- **Dashboard**  
  Painel principal com visão geral (em evolução).

- **Técnicos**  
  Cadastro, edição, ativação/desativação e papéis (`OWNER`, `TECH`).

- **Clientes**  
  Cadastro com informações pessoais, cobrança e localização da piscina.  
  Inclui **geocodificação automática** e **coordenadas** (`poolLat`, `poolLng`) para pins no mapa.

- **Rotas**
  - **Criar rota** → montagem manual de rota semanal ou ad-hoc.
  - **Atribuir rota** → distribuição de clientes entre técnicos.  
  - **Dashboard da rota** → visão diária com:
    - Coluna 1: técnicos do dia (com progresso em tempo real `x/y` piscinas feitas).  
    - Coluna 2: rota detalhada do técnico (ordem das visitas, cliente, endereço, status).  
    - Coluna 3: mapa interativo (visualização da rota do técnico ou todas as rotas).

- **Configurações**  
  Inclui também o gerenciamento de conta e logout.

---

## 🗄️ Banco de dados (Prisma)

Principais modelos:

- **Client** → informações de clientes e piscinas.  
- **Technician** → técnicos (usuários operacionais).  
- **VisitPlan / VisitInstance** → planos semanais de visitas e ocorrências.  
- **RoutePlan / RoutePlanItem** → planejamento de rotas.  
- **RouteTemplate / RouteOccurrence** → templates e execuções otimizadas.  

Todos os relacionamentos já estão indexados para **consultas de calendário e rotas**.

---

## ⚙️ Setup do projeto

### Pré-requisitos
- Node.js 18+
- Postgres (via Supabase)
- API Key do Google Maps

### Variáveis de ambiente

Criar um arquivo `.env.local` na raiz com:

```bash
# Banco
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."

# Map style (opcional)
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID="..."


Instalação
npm install

Rodar localmente
npm run dev
App rodará em http://localhost:3000

#🔄 Fluxos principais

Criação de rota → seleção de clientes e técnicos → grava em RoutePlan.

Execução de rota → gera VisitInstance para o dia.

Dashboard da rota → agrupa visitas/instâncias e exibe em cards + mapa.

Atualização em tempo real → conforme técnico dá check-in/checkout, progresso aparece no card (3/10).

#📅 Roadmap interno
Finalizar integração de status em tempo real no Dashboard (via Supabase Realtime).
Finalizar integração de status em tempo real no Dashboard (via Supabase Realtime).