"use client";

import {
  Building2,
  Fingerprint,
  UserRound,
} from "lucide-react";

import type { Client } from "@/app/(private)/clients/actions";

import ClientDetailItem from "./ClientDetailItem";

function getRegistrationType(document?: string | null) {
  const digits = String(document || "").replace(/\D+/g, "");

  if (digits.length === 14) {
    return "Pessoa jurídica";
  }

  if (digits.length === 11) {
    return "Pessoa física";
  }

  return "Não identificado";
}

function getDocumentLabel(document?: string | null) {
  const digits = String(document || "").replace(/\D+/g, "");

  if (digits.length === 14) {
    return "CNPJ";
  }

  if (digits.length === 11) {
    return "CPF";
  }

  return "CPF ou CNPJ";
}

export default function ClientRegistrationSection({
  client,
}: {
  client: Client;
}) {
  const registrationType = getRegistrationType(client.document);
  const documentLabel = getDocumentLabel(client.document);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Dados cadastrais
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Informações de identificação e situação do cliente.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ClientDetailItem
          icon={
            registrationType === "Pessoa jurídica" ? (
              <Building2 className="h-4 w-4" />
            ) : (
              <UserRound className="h-4 w-4" />
            )
          }
          label="Tipo de cadastro"
          value={registrationType}
        />

        <ClientDetailItem
          icon={<Fingerprint className="h-4 w-4" />}
          label={documentLabel}
          value={client.document || "Não informado"}
        />
      </div>
    </section>
  );
}