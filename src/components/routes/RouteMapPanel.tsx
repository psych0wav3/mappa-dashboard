"use client";

import { MapPin } from "lucide-react";

import MapCanvas from "@/components/routes/MapCanvas";

type RouteMapStop = {
  id: string;
  customerName: string;
  title: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
};

export default function RouteMapPanel({ stops, height = 320 }: { stops: RouteMapStop[]; height?: number }) {
  const mappedStops = stops.filter((stop) => Number(stop.lat || 0) !== 0 && Number(stop.lng || 0) !== 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
            <MapPin className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Mapa da rota</h3>

            <p className="mt-0.5 text-xs text-slate-500">
              {mappedStops.length} de {stops.length} paradas possuem coordenadas.
            </p>
          </div>
        </div>
      </div>

      {mappedStops.length > 0 ? (
        <MapCanvas height={height} markers={mappedStops.map((stop, index) => ({ id: stop.id, lat: Number(stop.lat), lng: Number(stop.lng), label: String(index + 1) }))} />
      ) : (
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(186,230,253,0.65)_0%,rgba(224,242,254,0.8)_45%,rgba(220,252,231,0.75)_45%,rgba(240,253,244,0.9)_100%)]" style={{ height }}>
          <div className="absolute inset-x-[10%] top-[28%] h-px rotate-6 bg-slate-300" />
          <div className="absolute inset-x-[8%] bottom-[28%] h-px -rotate-6 bg-slate-300" />
          <div className="absolute bottom-[8%] left-[42%] top-[5%] w-px rotate-6 bg-slate-300" />

          <div className="relative z-10 grid h-full place-items-center p-6">
            <div className="max-w-sm rounded-2xl border border-white/70 bg-white/90 px-5 py-4 text-center shadow-lg backdrop-blur">
              <MapPin className="mx-auto h-7 w-7 text-sky-600" />

              <p className="mt-2 text-sm font-semibold text-slate-700">
                Mapa aguardando localizações
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                As paradas aparecerão aqui quando houver latitude e longitude cadastradas.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}