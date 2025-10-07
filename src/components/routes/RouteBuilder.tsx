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
import { saveWeeklyRoute, saveAdHocRoute, getWeeklyRoute } from "@/app/(private)/routes/actions";

type Tech = { id: string; firstName: string; lastName: string };
type ClientLite = {
  id: string;
  firstName: string;
  lastName: string;
  street?: string | null;
  number?: string | null;
  city?: string | null;
  uf?: string | null;
  lat?: number | null;
  lng?: number | null;
};
type SelectedItem = {
  id: string;
  label: string;
  windowStart: number;
  windowEnd: number;
  order: number;
  lat?: number | null;
  lng?: number | null;
};

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng), la1 = toRad(a.lat), la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function RouteBuilder({
  technicians,
  clients,
}: {
  technicians: Tech[];
  clients: ClientLite[];
}) {
  const [modo] = React.useState<"weekly" | "adhoc">("weekly");
  const [dia, setDia] = React.useState<number>(1);
  const [dataISO, setDataISO] = React.useState<string>(() => new Date().toISOString().slice(0, 10));
  const [techId, setTechId] = React.useState<string>(technicians[0]?.id ?? "");
  const [selecionados, setSelecionados] = React.useState<SelectedItem[]>([]);

  const enabled = Boolean(techId) && Boolean(dia);

  // Índice {clientId -> {lat,lng}} para enriquecer itens carregados
  const clientIndex = React.useMemo(() => {
    const idx = new Map<string, { lat?: number | null; lng?: number | null }>();
    clients.forEach((c) => idx.set(c.id, { lat: c.lat ?? null, lng: c.lng ?? null }));
    return idx;
  }, [clients]);

  // Carrega planejamento salvo ao trocar técnico/dia e garante lat/lng
  React.useEffect(() => {
    let cancel = false;
    async function load() {
      if (!techId || !dia) {
        setSelecionados([]);
        return;
      }
      try {
        const items = await getWeeklyRoute({ technicianId: techId, weekday: dia });
        const withCoords = items.map((s: SelectedItem) => {
          const c = clientIndex.get(s.id);
          return c
            ? { ...s, lat: s.lat ?? c.lat ?? undefined, lng: s.lng ?? c.lng ?? undefined }
            : s;
        });
        if (!cancel) setSelecionados(withCoords);
      } catch (e: any) {
        console.error("Falha ao carregar planejamento:", e?.message || e);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, [techId, dia, clientIndex]);

  // Adiciona cliente manualmente (painel direito)
  const addClient = (c: ClientLite) => {
    setSelecionados((cur) =>
      cur.some((s) => s.id === c.id)
        ? cur
        : [
            ...cur,
            {
              id: c.id,
              label: `${c.firstName} ${c.lastName}`.trim(),
              windowStart: 9,
              windowEnd: 10,
              order: cur.length + 1,
              lat: c.lat ?? undefined,
              lng: c.lng ?? undefined,
            },
          ]
    );
  };

  const removeClient = (id: string) =>
    setSelecionados((cur) => cur.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })));

  const updateItem = (id: string, patch: Partial<SelectedItem>) =>
    setSelecionados((cur) => cur.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setSelecionados((cur) =>
      arrayMove(
        cur,
        cur.findIndex((i) => i.id === String(active.id)),
        cur.findIndex((i) => i.id === String(over.id))
      ).map((s, i) => ({ ...s, order: i + 1 }))
    );
  };

  // Conflitos de janela
  const conflitos = React.useMemo(() => {
    const list = [...selecionados].sort((a, b) => a.windowStart - b.windowStart || a.order - b.order);
    const bad: Array<{ a: string; b: string }> = [];
    for (let i = 0; i < list.length - 1; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const A = list[i], B = list[j];
        if (A.windowStart < B.windowEnd && B.windowStart < A.windowEnd) bad.push({ a: A.id, b: B.id });
      }
    }
    return bad;
  }, [selecionados]);
  const hasConflict = (id: string) => conflitos.some((c) => c.a === id || c.b === id);
  const existeConflito = conflitos.length > 0;

  // Stats
  const stats = React.useMemo(() => {
    const minutos = selecionados.reduce((a, s) => a + (s.windowEnd - s.windowStart) * 60, 0);
    let km = 0;
    const pts = selecionados.filter((s) => s.lat && s.lng) as Array<Required<Pick<SelectedItem, "lat" | "lng">>>;
    for (let i = 1; i < pts.length; i++) {
      km += haversineKm(
        { lat: pts[i - 1].lat!, lng: pts[i - 1].lng! },
        { lat: pts[i].lat!, lng: pts[i].lng! }
      );
    }
    return { minutos, km };
  }, [selecionados]);

  // Salvar
  const salvar = async () => {
    try {
      if (!techId) throw new Error("Selecione o técnico.");
      if (selecionados.length === 0) throw new Error("Adicione clientes à rota.");
      for (const s of selecionados) {
        if (s.windowStart >= s.windowEnd) throw new Error(`Janela inválida para ${s.label}.`);
      }
      if (modo === "weekly") {
        await saveWeeklyRoute({
          technicianId: techId,
          weekday: dia,
          items: selecionados.map((s, i) => ({
            clientId: s.id,
            windowStart: s.windowStart,
            windowEnd: s.windowEnd,
            order: i + 1,
          })),
        });
        toast.success("Rota semanal salva!");
      } else {
        await saveAdHocRoute({
          technicianId: techId,
          dateISO: dataISO,
          items: selecionados.map((s, i) => ({
            clientId: s.id,
            startHour: s.windowStart,
            endHour: s.windowEnd,
            order: i + 1,
          })),
        });
        toast.success("Rota avulsa criada!");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar rota");
    }
  };

  const getAddress = React.useCallback(
  (id: string) => {
    const c = clients.find((x) => x.id === id);
    if (!c) return undefined;
    const street = [c.street, c.number].filter(Boolean).join(", ");
    const cityUf = [c.city, c.uf].filter(Boolean).join(" / ");
    const line = [street, cityUf].filter(Boolean).join(" — ");
    return line || undefined;
  },
  [clients]
);

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
            getAddress={getAddress}
          />

          <div className="flex">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={salvar}
            >
              Salvar rota
            </Button>
          </div>
        </div>

        {/* DIREITA */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <RightAssignmentCard
            clients={clients}
            enabled={enabled}
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
                .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
                .map((s, i) => ({
                  id: s.id,
                  lat: s.lat as number,
                  lng: s.lng as number,
                  label: String(i + 1),
                }))}
              height={520}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
