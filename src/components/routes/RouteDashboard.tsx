"use client";

import * as React from "react";
import { toast } from "sonner";

type Item = {
  tech: string;
  planned: number;
  in_progress: number;
  done: number;
  total: number;
  visits: Array<{ client: string; window: string; status: string }>;
};

export default function RouteDashboard() {
  const [dateISO, setDateISO] = React.useState(() => new Date().toISOString().slice(0,10));
  const [rows, setRows] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/route-dashboard?date=${dateISO}`);
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setRows(data.items || []);
    } catch (e: any) {
      toast.error(e?.message || "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, [dateISO]);

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Data</label>
        <input type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)}
          className="h-10 rounded-md border border-neutral-300 px-3 text-sm" />
        <button onClick={load} className="text-sm underline">Atualizar</button>
      </div>

      {loading ? <div className="text-sm text-neutral-500">Carregando…</div> : (
        <div className="space-y-4">
          {rows.map((r, idx) => (
            <div key={idx} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{r.tech}</div>
                <div className="text-sm text-neutral-600">
                  planned: {r.planned} · in_progress: {r.in_progress} · done: {r.done} · total: {r.total}
                </div>
              </div>
              <ul className="mt-2 text-sm text-neutral-700 grid sm:grid-cols-2 gap-x-4">
                {r.visits.map((v, i) => (
                  <li key={i} className="flex items-center justify-between border-b py-1">
                    <span>{v.client}</span>
                    <span className="text-neutral-500">{v.window} — {v.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {rows.length === 0 && <div className="text-sm text-neutral-500">Sem visitas para esta data.</div>}
        </div>
      )}
    </div>
  );
}
