import type { Metadata } from "next";
import { Building2 } from "lucide-react";

import FormPage from "@/components/form-layout/FormPage";
import FormPageHeader from "@/components/form-layout/FormPageHeader";

import CompanyProfileClient from "./CompanyProfileClient";
import { getAccountCompany } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Dados da empresa — Aqua Mappa",
};

export default async function AccountPage() {
  const company = await getAccountCompany();

  return (
    <FormPage>
      <FormPageHeader icon={Building2} title="Dados da empresa" description="Consulte as informações cadastrais da empresa selecionada." />

      <CompanyProfileClient company={company} />
    </FormPage>
  );
}