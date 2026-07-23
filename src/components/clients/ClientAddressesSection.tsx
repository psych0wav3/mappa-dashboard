"use client";

import * as React from "react";
import {
  Compass,
  Hash,
  Home,
  Map,
  MapPin,
  Navigation,
  Plus,
} from "lucide-react";

import type {
  AddClientAddressInput,
  ClientAddress,
} from "@/app/(private)/clients/actions";

import { Button } from "@/components/ui/button";

import ClientAddressForm from "./ClientAddressForm";
import ClientDetailItem from "./ClientDetailItem";

import { formatAddress } from "./client-form.utils";

function formatCoordinate(value?: number | null) {
  if (value === null || value === undefined) {
    return "Não informada";
  }

  return String(value);
}

function AddressCard({
  address,
  index,
}: {
  address: ClientAddress;
  index: number;
}) {
  const formatted = formatAddress(address);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <header className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
            <MapPin className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-slate-900">
                {address.isMain
                  ? "Endereço principal"
                  : `Local de atendimento ${index + 1}`}
              </h4>

              {address.isMain && (
                <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                  Principal
                </span>
              )}
            </div>

            <p className="mt-1 break-words text-sm font-medium text-slate-700">
              {formatted.firstLine}
            </p>

            {formatted.secondLine && (
              <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                {formatted.secondLine}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
        <ClientDetailItem
          icon={<Navigation className="h-4 w-4" />}
          label="Logradouro"
          value={address.street || "Não informado"}
        />

        <ClientDetailItem
          icon={<Hash className="h-4 w-4" />}
          label="Número"
          value={address.number || "Não informado"}
        />

        <ClientDetailItem
          icon={<Home className="h-4 w-4" />}
          label="Complemento"
          value={address.complement || "Não informado"}
        />

        <ClientDetailItem
          icon={<MapPin className="h-4 w-4" />}
          label="Bairro"
          value={address.neighborhood || "Não informado"}
        />

        <ClientDetailItem
          icon={<Map className="h-4 w-4" />}
          label="Cidade e UF"
          value={
            [address.city, address.state].filter(Boolean).join("/") ||
            "Não informado"
          }
        />

        <ClientDetailItem
          icon={<Compass className="h-4 w-4" />}
          label="CEP"
          value={address.zipCode || "Não informado"}
        />
      </div>
    </article>
  );
}

type ClientAddressesSectionProps = {
  addresses: ClientAddress[];
  pending: boolean;
  onAddAddress: (address: AddClientAddressInput) => Promise<void>;
};

export default function ClientAddressesSection({
  addresses,
  pending,
  onAddAddress,
}: ClientAddressesSectionProps) {
  const [showForm, setShowForm] = React.useState(false);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Endereços e locais de atendimento
          </h3>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
            Consulte todos os endereços cadastrados. O endereço principal é
            utilizado automaticamente em novas ordens de serviço, rotas e
            planos.
          </p>
        </div>

        {!showForm && (
          <Button
            type="button"
            variant="outline"
            className="shrink-0 rounded-xl"
            onClick={() => setShowForm(true)}
            disabled={pending}
          >
            <Plus className="mr-2 h-4 w-4" />

            Adicionar endereço
          </Button>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {addresses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-5 py-10 text-center">
            <MapPin className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 text-sm font-semibold text-slate-600">
              Nenhum endereço cadastrado
            </p>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
              Adicione um endereço para utilizá-lo em ordens de serviço,
              planos e rotas.
            </p>
          </div>
        )}

        {addresses.map((address, index) => (
          <AddressCard
            key={
              address.id ||
              `${address.street}-${address.number || ""}-${index}`
            }
            address={address}
            index={index}
          />
        ))}
      </div>

      {showForm && (
        <ClientAddressForm
          pending={pending}
          onCancel={() => setShowForm(false)}
          onSubmit={async (address) => {
            await onAddAddress(address);
            setShowForm(false);
          }}
        />
      )}
    </section>
  );
}