
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveWeeklyRouteBulk } from "@/app/routes/actions";

type Tech = { id: string; firstName: string; lastName: string };

export default function AssignRoutes({ technicians }: { technicians: Tech[] }) {
  const [srcTech, setSrcTech] = React.useState<string>(technicians[0]?.id ?? "");
  const [srcDay, setSrcDay] = React.useState<number>(1);
  const [dstTechs, setDstTechs] = React.useState<string[]>([]);
  const [dstDays, setDstDays] = React.useState<number[]>([]);
  const [replace, setReplace] = React.useState<boolean>(false);

  // Para simplificar o MVP, pedimos ao usuário colar os items (json) ou reaproveitar do builder depois
  const [itemsJson, setItemsJson] = React.useState<string>("[]");

  const toggleDstTech = (id: string) =>
    setDstTechs((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const toggleDstDay = (d: number) =>
    setDstDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const run = async () => {
    try {
      const parsed: Array<{ clientId: string; windowStart: number; windowEnd: number; order: number }> = JSON.parse(itemsJson);
      if (!parsed.length) throw new Error("Cole os itens da rota (JSON) ou integre com o builder.");
      if (dstTechs.length === 0) throw new Error("Selecione 1+ técnicos destino");
      if (dstDays.length === 0) throw new Error("Selecione 1+ dias destino");

      // MVP: apenas grava para cada destino. (replace futuro: limpar/archivar antes)
      for (const tech of dstTechs) {
        await saveWeeklyRouteBulk({ technicianId: tech, weekdays: dstDays, items: parsed });
      }
      toast.success("Rotas atribuídas!");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao atribuir rotas");
    }
  };

  return (
    <div className="space-y-4 rounded-xl border bg-white p-4">
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">Origem – técnico</label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={srcTech} onChange={(e) => setSrcTech(e.target.value)}>
            {technicians.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Origem – dia</label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={srcDay} onChange={(e) => setSrcDay(Number(e.target.value))}>
            {[1,2,3,4,5,6].map((d) => <option key={d} value={d}>{["Seg","Ter","Qua","Qui","Sex","Sáb"][d-1]}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
            Substituir destino (futuro)
          </label>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Destino – técnicos</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {technicians.map((t) => {
            const active = dstTechs.includes(t.id);
            return (
              <button
                key={t.id}
                className={`h-9 px-3 rounded-md border text-sm ${active ? "bg-blue-600 text-white border-blue-600" : "border-neutral-300 hover:bg-neutral-50"}`}
                onClick={() => toggleDstTech(t.id)}
              >
                {t.firstName}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Destino – dias</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {[1,2,3,4,5,6].map((d) => {
            const active = dstDays.includes(d);
            return (
              <button
                key={d}
                className={`h-9 px-3 rounded-md border text-sm ${active ? "bg-blue-600 text-white border-blue-600" : "border-neutral-300 hover:bg-neutral-50"}`}
                onClick={() => toggleDstDay(d)}
              >
                {["Seg","Ter","Qua","Qui","Sex","Sáb"][d-1]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Itens (JSON)</label>
        <textarea
          rows={6}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          placeholder='[{"clientId":"...", "windowStart":9, "windowEnd":10, "order":1}]'
          value={itemsJson}
          onChange={(e) => setItemsJson(e.target.value)}
        />
      </div>

      <Button onClick={run} className="bg-blue-600 hover:bg-blue-700 text-white">
        Atribuir
      </Button>
    </div>
  );
}
