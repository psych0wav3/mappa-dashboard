import type { Metadata } from "next";
import Link from "next/link";
import { Plus, UsersRound } from "lucide-react";

import { listTechnicians } from "./actions";

import FormPage from "@/components/form-layout/FormPage";
import FormPageHeader from "@/components/form-layout/FormPageHeader";
import TechnicianTable from "@/components/technicians/TechnicianTable";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Técnicos — Aqua Mappa",
};

export default async function TechniciansPage() {
  const technicians = await listTechnicians();

  return (
    <FormPage>
      <FormPageHeader icon={UsersRound} title="Técnicos" description="Gerencie os profissionais que acessam o aplicativo, executam atendimentos e recebem rotas." actions={<Link href="/technicians/new" className="btn-brand inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-5 text-sm font-medium text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"><Plus className="mr-2 h-4 w-4 shrink-0" />Novo técnico</Link>} />
      <TechnicianTable initialData={technicians} />
    </FormPage>
  );
}
