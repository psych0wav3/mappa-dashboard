"use client";
import { useMemo, useState } from "react";
import LeftPanel from "@/components/routes/LeftPanel";
import RouteAssignmentForm from "@/components/routes/RouteAssignmentForm";
import MapCanvas from "@/components/routes/MapCanvas";
import { StopItem } from "@/components/routes/StopList";

export default function RouteBuilderPage() {
  const [tech, setTech] = useState<string | null>("t1");
  const [weekday, setWeekday] = useState<number>(1);
  const [startTime] = useState<string>("08:00");
  const [stops, setStops] = useState<StopItem[]>([]);

  const markers = useMemo(() => stops.map((s, i) => ({ id: s.id, lat: s.lat, lng: s.lng, label: String(i + 1) })), [stops]);

  // totais (tempo via ETAs quando houver, caso contrário soma de durações)
  const totals = useMemo(() => {
    let durationMin = stops.reduce((a, s) => a + (s.durationMin ?? 30), 0);
    // distância: se você armazenar legs no estado após optimize, use daqui; por ora calcula aproximado por lat/lng
    let distanceKm = 0;
    for (let i = 1; i < stops.length; i++) {
      const a = stops[i-1], b = stops[i];
      const toRad = (x:number)=>x*Math.PI/180;
      const R=6371, dLat=toRad(b.lat-a.lat), dLng=toRad(b.lng-a.lng);
      const la1=toRad(a.lat), la2=toRad(b.lat);
      const h=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
      distanceKm += 2*R*Math.asin(Math.sqrt(h));
    }
    // se houver ETA/ETD, substitui duraçãoMin real:
    if (stops[0]?.eta && stops.at(-1)?.etd) {
      const parse = (s:string)=>{ const [h,m]=s.split(":").map(Number); return h*60+m; };
      durationMin = parse(stops.at(-1)!.etd!) - parse(stops[0]!.eta!);
    }
    return { count: stops.length, durationMin, distanceKm };
  }, [stops]);

  async function handleOptimize() {
    const res = await fetch("/api/routes/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime,
        stops: stops.map((s)=>({ id: s.id, lat: s.lat, lng: s.lng, durationMin: s.durationMin })),
      }),
    });
    const j = await res.json();
    if (j?.order) {
      const byId = Object.fromEntries(stops.map(s=>[s.id, s]));
      const newStops = j.order.map((id: string) => ({ ...byId[id] }));
      const byEta: Record<string, { eta: string; etd: string }> = {};
      for (const e of j.etas) byEta[e.id] = { eta: e.eta, etd: e.etd };
      setStops(newStops.map(s=>({ ...s, ...byEta[s.id] })));
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Route Builder</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* ESQUERDA */}
        <div className="col-span-4">
          <LeftPanel
            tech={tech}
            weekday={weekday}
            setTech={setTech}
            setWeekday={setWeekday}
            stops={stops}
            setStops={setStops}
            totals={totals}
            onOptimize={handleOptimize}
          />
        </div>

        {/* DIREITA */}
        <div className="col-span-8 space-y-4">
          <RouteAssignmentForm
            onAddAssignment={(c/*, cfg*/) => {
              // No MVP, Add Route Assignment = adicionar cliente à lista em ordem
              setStops((prev)=>[...prev, {
                id: c.id, name: c.name, address: c.address, lat: c.lat, lng: c.lng, durationMin: 30
              }]);
            }}
          />
          <div className="rounded border p-2">
            <div className="px-2 pb-2">
              <input className="border rounded px-2 py-1 w-[320px]" placeholder="Search for address…" />
            </div>
            <MapCanvas markers={markers} />
          </div>
        </div>
      </div>
    </div>
  );
}
