"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Client = { id: string; name: string; address: string; lat: number; lng: number };
type Props = { onAdd: (c: Client) => void };

export default function RouteAssign({ onAdd }: Props) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Client[]>([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await fetch("/api/clients/search?q="+encodeURIComponent(q));
      const j = await res.json();
      setItems(j.items);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Buscar por nome/endereço…"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
        />
      </div>
      <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
        {items.map((c)=>(
          <div key={c.id} className="border rounded p-2 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-muted-foreground">{c.address}</div>
            </div>
            <Button size="sm" onClick={()=>onAdd(c)}>Adicionar</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
