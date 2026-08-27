import type { Metadata } from "next";

import AgreementsClient from "./AgreementsClient";

import {
  listAgreementsAdmin,
} from "./actions";

export const dynamic =
  "force-dynamic";

export const fetchCache =
  "force-no-store";

export const metadata: Metadata = {
  title:
    "Termos e acordos — Aqua Mappa",
};

export default async function AgreementsPage() {
  /*
   * A lista de termos é o dado principal
   * desta página.
   *
   * Se a API falhar, não retornamos []
   * fingindo que nenhum termo foi cadastrado.
   *
   * O erro sobe para:
   * src/app/(private)/error.tsx
   */
  const agreements =
    await listAgreementsAdmin(
      false,
    );

  return (
    <AgreementsClient
      initialAgreements={
        agreements
      }
    />
  );
}