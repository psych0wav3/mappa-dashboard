import type { Metadata } from "next";
import AgreementsClient from "./AgreementsClient";
import { listAgreementsAdmin } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Termos e acordos — Aqua Mappa",
};

export default async function AgreementsPage() {
  let agreements: Awaited<ReturnType<typeof listAgreementsAdmin>> = [];

  try {
    agreements = await listAgreementsAdmin(false);
  } catch {
    agreements = [];
  }

  return <AgreementsClient initialAgreements={agreements} />;
}
