"use client";

import * as React from "react";
import { Loader } from "@googlemaps/js-api-loader";

type Marker = { id: string; lat: number; lng: number; label?: string };

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  version: "weekly",
  libraries: ["marker"], // garante AdvancedMarkerElement
});

export default function MapCanvas({
  markers,
  height = 520,
}: {
  markers: Marker[];
  height?: number;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);

  const advRefs = React.useRef<Record<string, google.maps.marker.AdvancedMarkerElement>>({});
  const markerRefs = React.useRef<Record<string, google.maps.Marker>>({});

  // cria o mapa uma vez
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      await loader.load(); // garante google.maps disponível
      if (cancelled || !ref.current || mapRef.current) return;

      mapRef.current = new google.maps.Map(ref.current, {
        center: { lat: -23.55052, lng: -46.633308 }, // SP (fallback)
        zoom: 11,
        mapId: (process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || undefined) as string | undefined,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: false,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // sincroniza pins
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remover os que saíram
    const incomingIds = new Set(markers.map((m) => m.id));
    for (const id of Object.keys(advRefs.current)) {
      if (!incomingIds.has(id)) {
        advRefs.current[id].map = null;
        delete advRefs.current[id];
      }
    }
    for (const id of Object.keys(markerRefs.current)) {
      if (!incomingIds.has(id)) {
        markerRefs.current[id].setMap(null);
        delete markerRefs.current[id];
      }
    }

    // Adicionar/atualizar os atuais
    const Advanced = (google.maps as any).marker?.AdvancedMarkerElement as
      | typeof google.maps.marker.AdvancedMarkerElement
      | undefined;

    markers.forEach((m, idx) => {
      if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return;

      if (Advanced) {
        // conteúdo do pin
        const el = document.createElement("div");
        el.style.width = "28px";
        el.style.height = "28px";
        el.style.borderRadius = "14px";
        el.style.background = "#2563eb";
        el.style.color = "white";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.fontSize = "12px";
        el.style.fontWeight = "700";
        el.style.boxShadow = "0 1px 8px rgba(0,0,0,.25)";
        el.textContent = (m.label ?? String(idx + 1)).toString();

        const pos = { lat: m.lat, lng: m.lng } as google.maps.LatLngAltitudeLiteral;

        if (!advRefs.current[m.id]) {
          advRefs.current[m.id] = new Advanced({
            map,
            position: pos,
            content: el,
          });
        } else {
          advRefs.current[m.id].position = pos;
          advRefs.current[m.id].content = el;
          advRefs.current[m.id].map = map;
        }
      } else {
        if (!markerRefs.current[m.id]) {
          markerRefs.current[m.id] = new google.maps.Marker({
            position: { lat: m.lat, lng: m.lng },
            map,
            label: m.label ?? String(idx + 1),
          });
        } else {
          markerRefs.current[m.id].setPosition({ lat: m.lat, lng: m.lng });
          markerRefs.current[m.id].setLabel(m.label ?? String(idx + 1));
          markerRefs.current[m.id].setMap(map);
        }
      }
    });

    // Ajuste de bounds
    const valid = markers.filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));
    if (valid.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      valid.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, 60);
        const z = map.getZoom() ?? 0;
        if (z > 16) map.setZoom(16);
      }
    }
  }, [markers]);

  return <div ref={ref} style={{ height }} className="w-full rounded-md overflow-hidden" />;
}
