import type { Metadata } from "next";
import { UserPlus } from "lucide-react";

import FormPage from "@/components/form-layout/FormPage";
import FormPageHeader from "@/components/form-layout/FormPageHeader";

import NewClientPageClient from "./NewClientPageClient";

export const metadata: Metadata = {
  title: "Novo cliente — Aqua Mappa",
};

export default function NewClientPage() {
  return (
    <FormPage>
      <FormPageHeader
        icon={UserPlus}
        badge="Novo cadastro"
        title="Novo cliente"
        description="Cadastre os dados de acesso e o endereço principal da piscina ou local de atendimento."
      />

      <NewClientPageClient />
    </FormPage>
  );
}