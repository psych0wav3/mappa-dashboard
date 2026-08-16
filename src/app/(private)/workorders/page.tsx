import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
} from "lucide-react";

import FormPage from "@/components/form-layout/FormPage";
import FormPageHeader from "@/components/form-layout/FormPageHeader";
import WorkOrderTable from "@/components/workorders/WorkOrderTable";

import { listWorkOrders } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Ordens de Serviço — Aqua Mappa",
};

type WorkOrdersPageProps = {
  searchParams?: {
    status?: string;
    scheduledDate?: string;
    created?: string;
  };
};

export default async function WorkOrdersPage({
  searchParams,
}: WorkOrdersPageProps) {
  const status =
    searchParams?.status?.trim() || "";

  const scheduledDate =
    searchParams?.scheduledDate?.trim() || "";

  const data = await listWorkOrders({
    status:
      status || undefined,

    scheduledDate:
      scheduledDate || undefined,

    hideServicePlanExecutions: true,
  });

  return (
    <FormPage className="max-w-7xl">
      <FormPageHeader
        icon={ClipboardList}
        badge="Gestão de atendimentos"
        title="Ordens de Serviço"
        description="Acompanhe os serviços cadastrados, aprovações, precificações e ordens prontas para entrar em rota."
        actions={
          <Link
            href="/workorders/new"
            className="btn-brand inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            <Plus className="mr-2 h-4 w-4 shrink-0" />

            <span className="whitespace-nowrap">
              Nova OS
            </span>
          </Link>
        }
      />

      <WorkOrderTable
        initialData={data}
        initialStatus={status}
        initialScheduledDate={scheduledDate}
        created={searchParams?.created === "1"}
      />
    </FormPage>
  );
}