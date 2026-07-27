import type { Metadata } from "next";
import { ClipboardPlus } from "lucide-react";

import FormPage from "@/components/form-layout/FormPage";
import FormPageHeader from "@/components/form-layout/FormPageHeader";

import NewWorkOrderClient from "./NewWorkOrderClient";

import { listWorkOrderCustomers } from "../actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Nova ordem de serviço — Aqua Mappa",
};

export default async function NewWorkOrderPage() {
  const customers = await listWorkOrderCustomers();

  return (
    <FormPage className="max-w-7xl">
      <FormPageHeader
        icon={ClipboardPlus}
        badge="Atendimento avulso"
        title="Nova ordem de serviço"
        description="Cadastre reparos, visitas técnicas, trocas de areia, entregas de produtos e outros serviços pontuais."
      />

      <NewWorkOrderClient customers={customers} />
    </FormPage>
  );
}