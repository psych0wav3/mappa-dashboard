import type { Metadata } from "next";
import Link from "next/link";
import { Plus, UsersRound } from "lucide-react";

import ClientTable from "@/components/clients/ClientTable";
import FormPage from "@/components/form-layout/FormPage";
import FormPageHeader from "@/components/form-layout/FormPageHeader";

import { listClients } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Clientes — Aqua Mappa",
};

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <FormPage>
      <FormPageHeader icon={UsersRound} title="Clientes" description="Cadastre clientes, piscinas e locais de atendimento utilizados nas rotinas, ordens de serviço e rotas." actions={<Link href="/clients/new" className="btn-brand inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-5 text-sm font-medium text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"><Plus className="mr-2 h-4 w-4 shrink-0" />Novo cliente</Link>} />
      <ClientTable initialData={clients} />
    </FormPage>
  );
}
