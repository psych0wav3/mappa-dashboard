"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import ClientSearchCombobox, { ClientLite } from "./ClientSearchCombobox";

type Frequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "ONCE";

export default function RightAssignmentCard({
  clients,
  enabled,
  onAddClient,
}: {
  clients: ClientLite[];
  enabled: boolean;
  onAddClient: (client: ClientLite, opts: { freq: Frequency; start?: string; stop?: string }) => void;
}) {
  const [clientId, setClientId] = React.useState<string>("");
  const [freq, setFreq] = React.useState<Frequency>("WEEKLY");
  const [start, setStart] = React.useState<string>("");
  const [stop, setStop] = React.useState<string>("no_end");

  const selected = React.useMemo(
    () => clients.find((c) => c.id === clientId),
    [clients, clientId]
  );

  const canAdd = !!selected && enabled;

  const handleAdd = () => {
    if (!selected) return;
    onAddClient(selected, { freq, start, stop });
    setClientId("");
  };

  return (
    <div className="rounded-md border bg-white p-3">
      <div className="grid grid-cols-12 gap-3 items-end">
        <div className="col-span-12">
          <ClientSearchCombobox
            clients={clients}
            value={clientId}
            onChange={setClientId}
            disabled={!enabled}
          />
        </div>

        <div className="col-span-12 sm:col-span-4">
          <label className="text-xs font-medium text-neutral-600">Frequência</label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-neutral-300 px-2 text-sm"
            value={freq}
            onChange={(e) => setFreq(e.target.value as Frequency)}
            disabled={!enabled}
          >
            <option value="WEEKLY">Semanal</option>
            <option value="BIWEEKLY">Quinzenal</option>
            <option value="MONTHLY">Mensal</option>
            <option value="ONCE">Único</option>
          </select>
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label className="text-xs font-medium text-neutral-600">Começa em</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            disabled={!enabled}
            className="mt-1 h-9 w-full rounded-md border border-neutral-300 px-2 text-sm"
          />
        </div>

        <div className="col-span-6 sm:col-span-4">
          <label className="text-xs font-medium text-neutral-600">Termina após</label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-neutral-300 px-2 text-sm"
            value={stop}
            onChange={(e) => setStop(e.target.value)}
            disabled={!enabled}
          >
            <option value="no_end">sem término</option>
            <option value="5">5 visitas</option>
            <option value="10">10 visitas</option>
            <option value="date">data específica…</option>
          </select>
        </div>

        <div className="col-span-12">
          <Button className="w-full" variant="primary" disabled={!canAdd} onClick={handleAdd}>
            + Adicionar ao planejamento
          </Button>
        </div>
      </div>
    </div>
  );
}
