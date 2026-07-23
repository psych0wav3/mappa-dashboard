"use client";

import {
  BadgeCheck,
  BadgeX,
  Building2,
  UserRound,
} from "lucide-react";

import type { Client } from "@/app/(private)/clients/actions";

import { getInitials } from "./client-form.utils";

function getCustomerType(document?: string | null) {
  const digits = String(document || "").replace(/\D+/g, "");

  if (digits.length === 14) {
    return {
      label: "Pessoa jurídica",
      icon: Building2,
    };
  }

  return {
    label: "Pessoa física",
    icon: UserRound,
  };
}

export default function ClientIdentityCard({
  client,
}: {
  client: Client;
}) {
  const customerType = getCustomerType(client.document);
  const CustomerTypeIcon = customerType.icon;

  return (
    <section className="overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-white">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-sky-600 text-xl font-bold text-white shadow-sm">
            {getInitials(client.name)}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="break-words text-xl font-bold leading-tight text-slate-950 sm:text-2xl">
              {client.name || "Cliente sem nome"}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                {client.active ? (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <BadgeX className="h-4 w-4 shrink-0 text-amber-600" />
                )}

                {client.active ? "Cliente ativo" : "Cliente inativo"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}