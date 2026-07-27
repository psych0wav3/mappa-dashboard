import type { Metadata } from "next";
import { UserPlus } from "lucide-react";

import FormPage from "@/components/form-layout/FormPage";
import FormPageHeader from "@/components/form-layout/FormPageHeader";

import NewTechnicianClient from "./NewTechnicianClient";

export const metadata: Metadata = {
  title: "Novo técnico — Aqua Mappa",
};

export default function NewTechnicianPage() {
  return (
    <FormPage className="max-w-6xl">
      <FormPageHeader
        icon={UserPlus}
        badge="Equipe técnica"
        title="Novo técnico"
        description="Cadastre um novo integrante da equipe técnica e prepare seu acesso para a rotina operacional da empresa."
      />

      <NewTechnicianClient />
    </FormPage>
  );
}