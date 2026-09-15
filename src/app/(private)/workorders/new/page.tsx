import type { Metadata } from "next";
import { ClipboardPlus } from "lucide-react";

import FormPage from "@/components/form-layout/FormPage";
import FormPageHeader from "@/components/form-layout/FormPageHeader";

import NewWorkOrderClient from "./NewWorkOrderClient";

import {
  listWorkOrderChecklistTemplates,
  listWorkOrderCustomers,
  listWorkOrderMeasurementTemplates,
} from "../actions";

import { safeLoad } from "@/lib/mappa/safe-load";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Nova ordem de serviço — Aqua Mappa",
};

export default async function NewWorkOrderPage() {
  const [customers, checklistTemplates, measurementTemplates] =
    await Promise.all([
      listWorkOrderCustomers(),
      safeLoad({
        resource: "checklists",
        loader: listWorkOrderChecklistTemplates,
        fallback: [],
      }),
      safeLoad({
        resource: "medições",
        loader: listWorkOrderMeasurementTemplates,
        fallback: [],
      }),
    ]);

  return (
    <FormPage>
      <FormPageHeader
        icon={ClipboardPlus}
        badge="Atendimento avulso"
        title="Nova ordem de serviço"
        description="Cadastre reparos, visitas técnicas, trocas de areia, entregas de produtos e outros serviços pontuais."
      />

      <NewWorkOrderClient
        customers={customers}
        checklistTemplates={checklistTemplates.data}
        measurementTemplates={measurementTemplates.data}
      />
    </FormPage>
  );
}