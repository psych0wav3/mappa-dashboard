# 📘 Aqua Mappa Dashboard

Painel administrativo e operacional do **Aqua Mappa**, desenvolvido em **Next.js + React**.  
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
  - [Postgres](https://www.postgresql.org/)

- **Integrações**
  - Google Maps JavaScript API (mapas, geocodificação, autocomplete, advanced markers)

---

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


##Instalação
npm install

##Rodar localmente
npm run dev
App rodará em http://localhost:3000


## 🔄 Fluxos Principais

### 1. Gestão de Técnicos
- Cadastrar e gerenciar técnicos (nome, email, CPF, telefone, ativo/inativo, função).
- Técnicos podem ser **OWNER** ou **TECH**.
- Tabela com edição inline, ativação/desativação e exclusão com confirmação.

### 2. Gestão de Clientes
- Cadastro de clientes com **dados pessoais e empresariais** (CPF/CNPJ, email, telefone).
- Endereços separados: cobrança e piscina.
- Geocodificação automática da piscina (gera lat/lng para pins no mapa).
- Tabela de clientes com busca, edição e exclusão.

### 3. Planejamento de Rotas
- **Weekly Route Builder**: criar rotas semanais por técnico e dia da semana.
- **Ad-hoc Routes**: rotas ocasionais fora do planejamento fixo.
- Interface drag & drop para ordenar visitas.
- Armazenamento de rotas no banco via Prisma.

### 4. Dashboard de Rotas
- Calendário semanal/mensal para seleção de data.
- Coluna 1: **Técnicos do dia** com progresso em tempo real (ex: `3/10 concluídas`).
- Coluna 2: **Rota detalhada** do técnico (ordem, cliente, endereço, status).
- Coluna 3: **Mapa interativo** com pins coloridos (por técnico ou rota selecionada).
- Alternância entre **“Rota Selecionada”** e **“Todas as Rotas”**.

### 5. Quickstart & Onboarding
- Checklist guiado para configuração inicial:
  - Cadastro de técnicos
  - Cadastro de clientes
  - Criação de rotas
- Armazena progresso no `localStorage`.
- Botões de ação diretos para cada etapa.

### 6. Infraestrutura e Integração
- **Banco**: PostgreSQL.
- **ORM**: Prisma, com tipagem forte e migrations.
- **Frontend**: Next.js (App Router) + React + Tailwind + shadcn/ui.
- **Mapas**: Google Maps API (Markers, Advanced Markers, Autocomplete).



## 📅 Roadmap Interno

- [ ] **Rotas**
  - [ ] Finalizar integração de status em tempo real no **Dashboard de Rotas**.
  - [ ] Melhorar visualização de métricas (distância total, tempo estimado).
  - [ ] Implementar otimização automática de rotas.

- [ ] **Clientes**
  - [ ] Adicionar upload de fotos/documentos do cliente.
  - [ ] Melhorar validação de endereço + geocodificação.

- [ ] **Técnicos**
  - [ ] Permitir cadastro em massa via CSV/Excel.
  - [ ] Registro de localização em tempo real (mobile app futuro).

- [ ] **UI/UX**
  - [ ] Melhorar design do calendário (integração semanal/mensal).
  - [ ] Criar dark mode.
  - [ ] Ajustar responsividade para mobile.

- [ ] **Infraestrutura**
  - [ ] Deploy no Vercel (preview + produção).
  - [ ] Configuração de CI/CD com testes automatizados.
  - [ ] Monitoramento de erros (Sentry).

- [ ] **Onboarding & Quickstart**
  - [ ] Finalizar guia inicial com integração de rotas e clientes.
  - [ ] Adicionar dicas de uso (tooltips interativos).




























