"use client";

import * as React from "react";
import { Loader } from "@googlemaps/js-api-loader";

type Marker = { id: string; lat: number; lng: number; label?: string };

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  version: "weekly",
  libraries: ["marker"], // AdvancedMarkerElement
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
      if (!ref.current || mapRef.current) return;
      await loader.load();
      if (cancelled) return;

      mapRef.current = new google.maps.Map(ref.current, {
        center: { lat: -23.55052, lng: -46.633308 }, // SP (fallback)
        zoom: 11,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID, // opcional
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: false,
      });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sincroniza pins
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const ids = new Set(markers.map((m) => m.id));
    Object.keys(advRefs.current).forEach((id) => {
      if (!ids.has(id)) {
        advRefs.current[id].map = null as any;
        delete advRefs.current[id];
      }
    });
    Object.keys(markerRefs.current).forEach((id) => {
      if (!ids.has(id)) {
        markerRefs.current[id].setMap(null);
        delete markerRefs.current[id];
      }
    });

    const Advanced = (google.maps as any).marker?.AdvancedMarkerElement;
    markers.forEach((m, idx) => {
      if (typeof m.lat !== "number" || typeof m.lng !== "number") return;

      if (Advanced) {
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

        if (!advRefs.current[m.id]) {
          advRefs.current[m.id] = new Advanced({
            position: { lat: m.lat, lng: m.lng },
            content: el,
            map,
          });
        } else {
          advRefs.current[m.id].position = { lat: m.lat, lng: m.lng } as any;
          (advRefs.current[m.id] as any).content = el;
          advRefs.current[m.id].map = map as any;
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

    const valid = markers.filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));
    if (valid.length > 0) {
      const b = new google.maps.LatLngBounds();
      valid.forEach((m) => b.extend({ lat: m.lat, lng: m.lng }));
      if (!b.isEmpty()) {
        // ✅ use número (ou objeto com top/right/bottom/left)
        map.fitBounds(b, 60);
        if ((map.getZoom() || 0) > 16) map.setZoom(16);
      }
    }
  }, [markers]);

  return <div ref={ref} style={{ height }} className="w-full rounded-md overflow-hidden" />;
}
