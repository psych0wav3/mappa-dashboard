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
import {
  getRouteForDate,
  saveRouteForDate,
} from "@/app/(private)/routes/actions";

type Tech = {
  id: string;
  firstName: string;
  lastName: string;
};

type ClientLite = {
  id: string;
  firstName: string;
  lastName: string;

  customerAddressId?: string | null;

  street?: string | null;
  number?: string | null;
  district?: string | null;
  city?: string | null;
  uf?: string | null;

  poolStreet?: string | null;
  poolNumber?: string | null;
  poolDistrict?: string | null;
  poolCity?: string | null;
  poolUf?: string | null;

  lat?: number | null;
  lng?: number | null;
};

type SelectedItem = {
  id: string;
  label: string;
  customerAddressId?: string | null;
  windowStart: number;
  windowEnd: number;
  order: number;
  lat?: number | null;
  lng?: number | null;
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function todayISO() {
  const date = new Date();

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}`;
}

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

function buildAddress(c: ClientLite) {
  const street = c.poolStreet ?? c.street ?? "";
  const number = c.poolNumber ?? c.number ?? "";
  const city = c.poolCity ?? c.city ?? "";
  const uf = c.poolUf ?? c.uf ?? "";

  const line1 = [street, number].filter(Boolean).join(", ");
  const line2 = [city, uf].filter(Boolean).join(" / ");

  return [line1, line2].filter(Boolean).join(" — ");
}

async function geocodeAddress(
  addr: string,
): Promise<{ lat: number; lng: number } | null> {
  if (!addr.trim()) return null;

  const gm = (globalThis as any).google?.maps;

  if (!gm?.Geocoder) return null;

  const geocoder = new gm.Geocoder();

  return new Promise((resolve) => {
    geocoder.geocode({ address: addr }, (results: any, status: any) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;

        resolve({
          lat: loc.lat(),
          lng: loc.lng(),
        });
      } else {
        resolve(null);
      }
    });
  });
}

function mergeByIdKeepUser(
  serverItems: SelectedItem[],
  userItems: SelectedItem[],
): SelectedItem[] {
  const byId = new Map(userItems.map((item) => [item.id, item]));

  const merged = serverItems.map((serverItem) => {
    const userItem = byId.get(serverItem.id);

    return userItem
      ? {
          ...serverItem,
          windowStart: userItem.windowStart,
          windowEnd: userItem.windowEnd,
          order: userItem.order,
        }
      : serverItem;
  });

  for (const userItem of userItems) {
    if (!merged.some((item) => item.id === userItem.id)) {
      merged.push(userItem);
    }
  }

  return merged
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item, index) => ({
      ...item,
      order: index + 1,
    }));
}

export default function RouteBuilder({
  technicians,
  clients,
}: {
  technicians: Tech[];
  clients: ClientLite[];
}) {
  const [mounted, setMounted] = React.useState(false);
  const [dateISO, setDateISO] = React.useState("");
  const [techId, setTechId] = React.useState(technicians[0]?.id ?? "");
  const [selecionados, setSelecionados] = React.useState<SelectedItem[]>([]);
  const [loadingRoute, setLoadingRoute] = React.useState(false);

  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
    setDateISO(todayISO());
  }, []);

  React.useEffect(() => {
    const el = searchRef.current;

    if (!el) return;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (typeof customEvent.detail === "string") {
        setSearch(customEvent.detail);
      }
    };

    el.addEventListener("gm-place", handler as EventListener);

    return () => {
      el.removeEventListener("gm-place", handler as EventListener);
    };
  }, []);

  const enabled = Boolean(techId) && Boolean(dateISO);

  const clientIndex = React.useMemo(() => {
    const idx = new Map<
      string,
      {
        customerAddressId?: string | null;
        firstName: string;
        lastName: string;
        lat?: number | null;
        lng?: number | null;
      }
    >();

    clients.forEach((client) => {
      idx.set(client.id, {
        customerAddressId: client.customerAddressId ?? null,
        firstName: client.firstName,
        lastName: client.lastName,
        lat: client.lat ?? null,
        lng: client.lng ?? null,
      });
    });

    return idx;
  }, [clients]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      if (!techId || !dateISO) {
        setSelecionados([]);
        return;
      }

      try {
        setLoadingRoute(true);

        const routeItems = await getRouteForDate({
          employeeUserId: techId,
          routeDate: dateISO,
        });

        const normalized = routeItems.map((item: any, index: number) => {
          const client = clientIndex.get(item.id);

          return {
            id: item.id,
            label:
              item.label ||
              [client?.firstName, client?.lastName].filter(Boolean).join(" ") ||
              "Cliente",
            customerAddressId: client?.customerAddressId ?? null,
            windowStart: item.windowStart ?? 9,
            windowEnd: item.windowEnd ?? 10,
            order: item.order ?? index + 1,
            lat: item.lat ?? client?.lat ?? null,
            lng: item.lng ?? client?.lng ?? null,
          };
        });

        if (!cancelled) {
          setSelecionados((prev) => mergeByIdKeepUser(normalized, prev));
        }
      } catch (error: any) {
        console.error("Falha ao carregar rota:", error?.message || error);

        if (!cancelled) {
          setSelecionados([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingRoute(false);
        }
      }
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [techId, dateISO, clientIndex]);

  const selectedIds = React.useMemo(
    () => new Set(selecionados.map((item) => item.id)),
    [selecionados],
  );

  const availableClients = React.useMemo(
    () => clients.filter((client) => !selectedIds.has(client.id)),
    [clients, selectedIds],
  );

  const addClient = async (client: ClientLite) => {
    if (selectedIds.has(client.id)) return;

    let lat = client.lat ?? undefined;
    let lng = client.lng ?? undefined;

    if (lat == null || lng == null) {
      try {
        const addr = buildAddress(client);
        const hit = await geocodeAddress(addr);

        if (hit) {
          lat = hit.lat;
          lng = hit.lng;

          import("@/app/(private)/clients/actions")
            .then(({ saveClientCoords }) =>
              saveClientCoords(client.id, hit.lat, hit.lng),
            )
            .catch(() => {});
        }
      } catch {
        // Não bloqueia a criação da rota se o geocode falhar.
      }
    }

    setSelecionados((current) => [
      ...current,
      {
        id: client.id,
        label: `${client.firstName} ${client.lastName}`.trim(),
        customerAddressId: client.customerAddressId ?? null,
        windowStart: 9,
        windowEnd: 10,
        order: current.length + 1,
        lat,
        lng,
      },
    ]);

    setSearch("");

    if (searchRef.current) {
      searchRef.current.value = "";
      const event = new Event("input", { bubbles: true });
      searchRef.current.dispatchEvent(event);
    }

    toast.message("Cliente adicionado à rota.");
  };

  const removeClient = (id: string) => {
    setSelecionados((current) =>
      current
        .filter((item) => item.id !== id)
        .map((item, index) => ({
          ...item,
          order: index + 1,
        })),
    );
  };

  const updateItem = (id: string, patch: Partial<SelectedItem>) => {
    setSelecionados((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setSelecionados((current) =>
      arrayMove(
        current,
        current.findIndex((item) => item.id === String(active.id)),
        current.findIndex((item) => item.id === String(over.id)),
      ).map((item, index) => ({
        ...item,
        order: index + 1,
      })),
    );
  };

  const conflitos = React.useMemo(() => {
    const list = [...selecionados].sort(
      (a, b) => a.windowStart - b.windowStart || a.order - b.order,
    );

    const bad: Array<{ a: string; b: string }> = [];

    for (let i = 0; i < list.length - 1; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const A = list[i];
        const B = list[j];

        if (A.windowStart < B.windowEnd && B.windowStart < A.windowEnd) {
          bad.push({ a: A.id, b: B.id });
        }
      }
    }

    return bad;
  }, [selecionados]);

  const hasConflict = (id: string) =>
    conflitos.some((conflict) => conflict.a === id || conflict.b === id);

  const existeConflito = conflitos.length > 0;

  const stats = React.useMemo(() => {
    const minutos = selecionados.reduce(
      (total, item) => total + (item.windowEnd - item.windowStart) * 60,
      0,
    );

    let km = 0;

    const pts = selecionados.filter(
      (item) => item.lat != null && item.lng != null,
    ) as Array<Required<Pick<SelectedItem, "lat" | "lng">>>;

    for (let i = 1; i < pts.length; i++) {
      km += haversineKm(
        {
          lat: pts[i - 1].lat,
          lng: pts[i - 1].lng,
        },
        {
          lat: pts[i].lat,
          lng: pts[i].lng,
        },
      );
    }

    return { minutos, km };
  }, [selecionados]);

  const salvar = async () => {
    try {
      if (!techId) throw new Error("Selecione o técnico.");
      if (!dateISO) throw new Error("Informe a data da rota.");
      if (selecionados.length === 0) {
        throw new Error("Adicione clientes à rota.");
      }

      for (const item of selecionados) {
        if (item.windowStart >= item.windowEnd) {
          throw new Error(`Janela inválida para ${item.label}.`);
        }

        if (!item.customerAddressId) {
          throw new Error(
            `O cliente ${item.label} não possui endereço principal da piscina.`,
          );
        }
      }

      const result = await saveRouteForDate({
        employeeUserId: techId,
        routeDate: dateISO,
        items: selecionados.map((item, index) => ({
          clientId: item.id,
          customerAddressId: item.customerAddressId,
          clientName: item.label,
          windowStart: item.windowStart,
          windowEnd: item.windowEnd,
          order: index + 1,
        })),
      });

      if (Array.isArray(result.items)) {
        setSelecionados((previous) => mergeByIdKeepUser(result.items, previous));
      }

      toast.success("Rota criada com sucesso!");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao salvar rota");
    }
  };

  const getAddress = React.useCallback(
    (id: string) => {
      const client = clients.find((item) => item.id === id);

      if (!client) return undefined;

      return buildAddress(client);
    },
    [clients],
  );

  const getAddressParts = React.useCallback(
    (id: string) => {
      const client = clients.find((item) => item.id === id);

      if (!client) return undefined;

      const street = client.poolStreet ?? client.street ?? "";
      const number = client.poolNumber ?? client.number ?? undefined;
      const neighborhood = client.poolDistrict ?? client.district ?? undefined;
      const city = client.poolCity ?? client.city ?? undefined;
      const state = client.poolUf ?? client.uf ?? undefined;

      return {
        street,
        number,
        neighborhood,
        city,
        state,
      };
    },
    [clients],
  );

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96 text-neutral-500">
        Carregando mapa…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {existeConflito && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          Existem janelas sobrepostas. Você ainda pode salvar, mas recomenda-se
          ajustar.
        </div>
      )}

      {loadingRoute && (
        <div className="rounded-md bg-slate-50 border border-slate-200 text-slate-600 px-3 py-2 text-sm">
          Carregando rota desta data…
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <LeftTechDayCard
            technicians={technicians}
            techId={techId}
            onTechChange={setTechId}
            dateISO={dateISO}
            onDateChange={setDateISO}
          />

          <RouteListCard
            items={selecionados}
            onDragEnd={onDragEnd}
            hasConflict={hasConflict}
            stats={stats}
            onChangeItem={updateItem}
            onRemoveItem={removeClient}
            getAddress={getAddress}
            getAddressParts={getAddressParts}
          />

          <div className="flex">
            <Button
              className="w-full btn-brand hover:bg-blue-700 text-white"
              onClick={salvar}
              disabled={!enabled}
            >
              Salvar rota
            </Button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-4">
          <RightAssignmentCard
            clients={availableClients}
            enabled={enabled}
            onAddClient={(client) => {
              void addClient(client);
            }}
          />

          <div className="rounded-md border bg-white">
            <div className="px-3 py-2 border-b">
              <div className="relative w-full max-w-[320px]">
                <Input
                  ref={searchRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar endereço no mapa…"
                  className="pr-8"
                />

                {search.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");

                      if (searchRef.current) {
                        searchRef.current.value = "";
                        const event = new Event("input", { bubbles: true });
                        searchRef.current.dispatchEvent(event);
                        searchRef.current.focus();
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    aria-label="Limpar busca"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <MapCanvas
              markers={selecionados
                .filter((item) => item.lat != null && item.lng != null)
                .map((item, index) => ({
                  id: item.id,
                  lat: item.lat as number,
                  lng: item.lng as number,
                  label: String(index + 1),
                }))}
              searchInputRef={searchRef}
              height={520}
            />
          </div>
        </div>
      </div>
    </div>
  );
}