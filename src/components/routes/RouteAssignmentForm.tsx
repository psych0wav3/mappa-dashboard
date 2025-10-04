"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Client = { id: string; name: string; address: string; lat: number; lng: number };
type Props = {
  onAddAssignment: (client: Client, cfg: { frequency: string; startOn: string; stopAfter: string }) => void;
};

export default function RouteAssignmentForm({ onAddAssignment }: Props) {
  const [selected, setSelected] = useState<Client | null>(null);
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState<Client[]>([]);
  const [frequency, setFrequency] = useState("WEEKLY");
  const [startOn, setStartOn] = useState<string>(new Date().toISOString().slice(0, 10));
  const [stopAfter, setStopAfter] = useState<string>("no_end");

  async function search(v: string) {
    const r = await fetch("/api/clients/search?q=" + encodeURIComponent(v));
    const j = await r.json();
    setOpts(j.items);
  }

  return (
    <div className="rounded border p-4 space-y-3">
      <div className="text-sm font-medium">Customer / Location</div>
      <div className="flex gap-2">
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Buscar por nome/endereço…"
          value={q}
          onChange={(e) => { setQ(e.target.value); search(e.target.value); }}
        />
        <select className="border rounded px-2 py-1 min-w-40" value={selected?.id ?? ""} onChange={(e)=>{
          const c = opts.find(o => o.id === e.target.value) || null;
          setSelected(c);
        }}>
          <option value="">Selecione…</option>
          {opts.map(c => <option key={c.id} value={c.id}>{c.name} — {c.address}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-sm text-muted-foreground">Frequency</div>
          <select className="border rounded px-2 py-1 w-full" value={frequency} onChange={(e)=>setFrequency(e.target.value)}>
            <option value="WEEKLY">Weekly</option>
            <option value="BIWEEKLY_A">Biweekly A</option>
            <option value="BIWEEKLY_B">Biweekly B</option>
            <option value="MONTHLY_DAY">Monthly (day)</option>
            <option value="MONTHLY_NTHWEEK">Monthly (nth week)</option>
            <option value="ONCE">Once</option>
          </select>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Start On</div>
          <input className="border rounded px-2 py-1 w-full" type="date" value={startOn} onChange={(e)=>setStartOn(e.target.value)} />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Stop After</div>
          <select className="border rounded px-2 py-1 w-full" value={stopAfter} onChange={(e)=>setStopAfter(e.target.value)}>
            <option value="no_end">no end</option>
            <option value="5">5 visits</option>
            <option value="10">10 visits</option>
            <option value="date">by date…</option>
          </select>
        </div>
      </div>

      <Button
        disabled={!selected}
        className="w-full"
        onClick={() => selected && onAddAssignment(selected, { frequency, startOn, stopAfter })}
      >
        + Add Route Assignment
      </Button>
    </div>
  );
}
