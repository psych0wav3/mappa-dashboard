"use client";
import { useState } from "react";
import StopList, { StopItem } from "./StopList";
import { Button } from "@/components/ui/button";

type Props = {
  tech: string | null;
  weekday: number;
  setTech: (id: string) => void;
  setWeekday: (n: number) => void;
  stops: StopItem[];
  setStops: (s: StopItem[]) => void;
  totals: { count: number; durationMin: number; distanceKm: number };
  onOptimize: () => Promise<void>;
};

export default function LeftPanel(p: Props) {
  const [more, setMore] = useState(true);
  const [showActivesNoAssign, setShowActivesNoAssign] = useState(true);

  return (
    <div className="rounded border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button className="text-sm text-blue-600" onClick={()=>setMore(v=>!v)}>
          {more? "< Less options" : "More options >"}
        </button>
        <Button size="sm" onClick={p.onOptimize}>Optimize Route</Button>
      </div>

      {more && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <select className="border rounded px-2 py-1 w-full" value={p.tech ?? ""} onChange={(e)=>p.setTech(e.target.value)}>
              <option value="">Choose Tech</option>
              <option value="t1">Adevaldo Coutinho</option>
            </select>
            <select className="border rounded px-2 py-1 w-full" value={p.weekday} onChange={(e)=>p.setWeekday(Number(e.target.value))}>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input id="chk" type="checkbox" className="size-4" checked={showActivesNoAssign} onChange={()=>setShowActivesNoAssign(v=>!v)} />
            <label htmlFor="chk" className="text-sm">Show active customers without route assignments</label>
          </div>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        <span className="font-medium">{p.totals.count} pools</span> · {Math.round(p.totals.durationMin)}m · {p.totals.distanceKm.toFixed(1)} km
      </div>

      {p.stops.length === 0 ? (
        <div className="text-sm text-muted-foreground">Choose tech and day.</div>
      ) : (
        <StopList items={p.stops} onReorder={p.setStops} />
      )}
    </div>
  );
}
