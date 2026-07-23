"use client";

import { Mail, Phone } from "lucide-react";

import type { Client } from "@/app/(private)/clients/actions";

import ClientDetailItem from "./ClientDetailItem";

export default function ClientContactSection({
  client,
}: {
  client: Client;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Contato e acesso
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Dados utilizados para comunicação e acesso ao aplicativo.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <ClientDetailItem
          icon={<Mail className="h-4 w-4" />}
          label="E-mail de acesso"
          value={client.email || "Não informado"}
        />

        <ClientDetailItem
          icon={<Phone className="h-4 w-4" />}
          label="Telefone"
          value={client.phone || "Não informado"}
        />
      </div>
    </section>
  );
}