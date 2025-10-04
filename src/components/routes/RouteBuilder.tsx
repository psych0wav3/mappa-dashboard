// src/components/routes/RouteBuilder.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LeftTechDayCard from "./LeftTechDayCard";
import RouteListCard from "./RouteListCard";
import RightAssignmentCard from "./RightAssignmentCard";
import MapCanvas from "./MapCanvas";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { saveWeeklyRoute, saveAdHocRoute } from "@/app/routes/actions";

// tipos leves
type Tech = { id: string; firstName: string; lastName: string };
type ClientLite = {
  id: string; firstName: string; lastName: string;
  street?: string|null; number?: string|null; city?: string|null; uf?: string|null;
  lat?: number|null; lng?: number|null;
};
type SelectedItem = {
  id: string; label: string; windowStart: number; windowEnd: number; order: number;
  lat?: number|null; lng?: number|null;
};

function haversineKm(a:{lat:number;lng:number}, b:{lat:number;lng:number}) {
  const R=6371, toRad=(x:number)=>(x*Math.PI)/180;
  const dLat=toRad(b.lat-a.lat), dLng=toRad(b.lng-a.lng), la1=toRad(a.lat), la2=toRad(b.lat);
  const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

export default function RouteBuilder({ technicians, clients }: { technicians: Tech[]; clients: ClientLite[]; }) {
  const [modo] = React.useState<"weekly" | "adhoc">("weekly");
  const [dia, setDia] = React.useState<number>(1);
  const [dataISO, setDataISO] = React.useState<string>(() => new Date().toISOString().slice(0,10));
  const [techId, setTechId] = React.useState<string>(technicians[0]?.id ?? "");
  const [selecionados, setSelecionados] = React.useState<SelectedItem[]>([]);

  const enabled = Boolean(techId) && Boolean(dia);

  // adicionar cliente ao painel esquerdo
  const addClient = (c: ClientLite) => {
    setSelecionados((cur) =>
      cur.some((s)=>s.id===c.id) ? cur : [
        ...cur,
        {
          id: c.id,
          label: `${c.firstName} ${c.lastName}`.trim(),
          windowStart: 9,
          windowEnd: 10,
          order: cur.length+1,
          lat: c.lat ?? undefined,
          lng: c.lng ?? undefined,
        },
      ]
    );
  };

  const removeClient = (id: string) =>
    setSelecionados((cur)=>cur.filter(s=>s.id!==id).map((s,i)=>({...s,order:i+1})));

  const updateItem = (id:string, patch: Partial<SelectedItem>) =>
    setSelecionados((cur)=>cur.map(s=>s.id===id?{...s,...patch}:s));

  const onDragEnd = (e: DragEndEvent) => {
    const {active,over} = e; if(!over || active.id===over.id) return;
    setSelecionados((cur)=>
      arrayMove(
        cur,
        cur.findIndex(i=>i.id===String(active.id)),
        cur.findIndex(i=>i.id===String(over.id))
      ).map((s,i)=>({...s,order:i+1}))
    );
  };

  // conflitos
  const conflitos = React.useMemo(()=>{
    const list=[...selecionados].sort((a,b)=>a.windowStart-b.windowStart||a.order-b.order);
    const bad: Array<{a:string;b:string}> = [];
    for(let i=0;i<list.length-1;i++){
      for(let j=i+1;j<list.length;j++){
        const A=list[i],B=list[j];
        if(A.windowStart < B.windowEnd && B.windowStart < A.windowEnd) bad.push({a:A.id,b:B.id});
      }
    }
    return bad;
  },[selecionados]);
  const hasConflict = (id:string)=>conflitos.some(c=>c.a===id||c.b===id);
  const existeConflito = conflitos.length>0;

  // stats
  const stats = React.useMemo(()=>{
    const minutos = selecionados.reduce((a,s)=>a+(s.windowEnd-s.windowStart)*60,0);
    let km=0;
    const pts=selecionados.filter(s=>s.lat&&s.lng) as Array<Required<Pick<SelectedItem,"lat"|"lng">>>;
    for(let i=1;i<pts.length;i++){
      km += haversineKm({lat:pts[i-1].lat!,lng:pts[i-1].lng!},{lat:pts[i].lat!,lng:pts[i].lng!});
    }
    return {minutos, km};
  },[selecionados]);

  // salvar rota
  const salvar = async () => {
    try {
      if(!techId) throw new Error("Selecione o técnico.");
      if(selecionados.length===0) throw new Error("Adicione clientes à rota.");
      for(const s of selecionados){
        if(s.windowStart>=s.windowEnd) throw new Error(`Janela inválida para ${s.label}.`);
      }
      if(modo==="weekly"){
        await saveWeeklyRoute({
          technicianId: techId,
          weekday: dia,
          items: selecionados.map((s,i)=>({
            clientId:s.id,
            windowStart:s.windowStart,
            windowEnd:s.windowEnd,
            order:i+1
          })),
        });
        toast.success("Rota semanal salva!");
      } else {
        await saveAdHocRoute({
          technicianId: techId,
          dateISO: dataISO, // ✅ usa a variável correta
          items: selecionados.map((s,i)=>({
            clientId:s.id,
            startHour:s.windowStart,
            endHour:s.windowEnd,
            order:i+1
          })),
        });
        toast.success("Rota avulsa criada!");
      }
    } catch(e:any) { toast.error(e?.message||"Erro ao salvar rota"); }
  };

  return (
    <div className="space-y-4">

      {existeConflito && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          Existem janelas sobrepostas. Você ainda pode salvar, mas recomenda-se ajustar.
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* ESQUERDA */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <LeftTechDayCard
            technicians={technicians}
            techId={techId}
            onTechChange={setTechId}
            weekday={dia}
            onWeekdayChange={setDia}
          />

          <RouteListCard
            items={selecionados}
            onDragEnd={onDragEnd}
            hasConflict={hasConflict}
            stats={stats}
            onChangeItem={updateItem}
            onRemoveItem={removeClient}
          />

          <div className="flex">
            <Button className="w-full" variant="primary" onClick={salvar}>
              Salvar rota
            </Button>
          </div>
        </div>

        {/* DIREITA */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <RightAssignmentCard
            clients={clients}
            enabled={enabled}               // ✅ agora passamos enabled
            onAddClient={(c) => {
              addClient(c);
              toast.message("Adicionado ao planejamento.");
            }}
          />

          <div className="rounded-md border bg-white">
            <div className="px-3 py-2 border-b">
              <Input placeholder="Buscar endereço no mapa…" className="max-w-[320px]" />
            </div>
            <MapCanvas
              markers={selecionados
                .filter(s=>typeof s.lat==="number" && typeof s.lng==="number")
                .map((s,i)=>({id:s.id, lat:s.lat as number, lng:s.lng as number, label:String(i+1)}))}
              height={520}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
