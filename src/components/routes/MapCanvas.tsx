"use client";

import * as React from "react";
import { Loader } from "@googlemaps/js-api-loader";

type Marker = { id: string; lat: number; lng: number; label?: string };

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  version: "weekly",
  libraries: ["marker", "places"],
});

type Props = {
  markers: Marker[];
  height?: number;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  pinColor?: string | ((m: Marker, idx: number) => string);
  pinGlyphColor?: string | ((m: Marker, idx: number) => string);
  maxZoomAfterFit?: number;
};

export default function MapCanvas({
  markers,
  height = 520,
  searchInputRef,
  pinColor = "#2563eb",
  pinGlyphColor = "#ffffff",
  maxZoomAfterFit = 16,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);

  const advRefs = React.useRef<Record<string, google.maps.marker.AdvancedMarkerElement>>({});
  const markerRefs = React.useRef<Record<string, google.maps.Marker>>({});
  const searchMarkerRef = React.useRef<
    google.maps.marker.AdvancedMarkerElement | google.maps.Marker | null
  >(null);

  // util: resolve string | fn
  const colorOf = (val: Props["pinColor"], m: Marker, idx: number) =>
    typeof val === "function" ? val(m, idx) : val;
  const glyphColorOf = (val: Props["pinGlyphColor"], m: Marker, idx: number) =>
    typeof val === "function" ? val(m, idx) : val;

  // log de entrada para debug
  React.useEffect(() => {
    const snapshot = markers.map((m) => ({
      ...m,
      latType: typeof m.lat,
      lngType: typeof m.lng,
      valid: Number.isFinite(m.lat) && Number.isFinite(m.lng),
    }));
    console.log("[MapCanvas] markers prop:", snapshot);
  }, [markers]);

  // cria o mapa uma vez
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      await loader.load();
      if (cancelled || !containerRef.current || mapRef.current) return;

      const center = { lat: -23.55052, lng: -46.633308 }; // SP (fallback)
      mapRef.current = new google.maps.Map(containerRef.current, {
        center,
        zoom: 11,
        // Se quiser ativar Advanced Markers no futuro, defina o mapId:
        // mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID as string,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: false,
      });

      // Smoke test usando Marker "clássico" (sempre funciona)
      new google.maps.Marker({
        position: center,
        map: mapRef.current,
        title: "smoke-test",
        label: "T",
      });

      const Advanced = (google.maps as any).marker?.AdvancedMarkerElement;
      const PinElement = (google.maps as any).marker?.PinElement;
      const mapIdFromMap = (mapRef.current as any)?.get?.("mapId");
      const canUseAdvanced = Boolean(Advanced && PinElement && mapIdFromMap);
      console.log(
        "[MapCanvas] AdvancedMarker support?",
        { Advanced: !!Advanced, PinElement: !!PinElement, mapIdFromMap, canUseAdvanced }
      );
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Autocomplete (Places)
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const input = searchInputRef?.current;
    if (!input) return;

    let autocomplete: google.maps.places.Autocomplete | null = null;
    try {
      autocomplete = new google.maps.places.Autocomplete(input, {
        fields: ["geometry", "formatted_address", "name"],
        types: ["geocode"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete!.getPlace();
        const loc = place.geometry?.location;
        if (!loc) return;

        map.panTo(loc);
        map.setZoom(15);

        const Advanced = (google.maps as any).marker?.AdvancedMarkerElement;
        const PinElement = (google.maps as any).marker?.PinElement;
        const mapIdFromMap = (map as any)?.get?.("mapId");
        const canUseAdvanced = Boolean(Advanced && PinElement && mapIdFromMap);

        if (canUseAdvanced) {
          const pin = new (PinElement as any)({
            background: "#111827",
            glyph: "🔍",
            glyphColor: "#ffffff",
            borderColor: "#111827",
            scale: 1.1,
          });
          if (!searchMarkerRef.current || !(searchMarkerRef.current instanceof Advanced)) {
            searchMarkerRef.current = new (Advanced as any)({
              map,
              position: loc,
              content: pin.element,
              zIndex: 9999,
            });
          } else {
            (searchMarkerRef.current as any).position = loc;
            (searchMarkerRef.current as any).content = pin.element;
            (searchMarkerRef.current as any).map = map;
          }
        } else {
          if (!searchMarkerRef.current || !(searchMarkerRef.current instanceof google.maps.Marker)) {
            searchMarkerRef.current = new google.maps.Marker({
              map,
              position: loc,
              label: "🔍",
              zIndex: 9999,
            });
          } else {
            (searchMarkerRef.current as google.maps.Marker).setPosition(loc);
            (searchMarkerRef.current as google.maps.Marker).setMap(map);
          }
        }
      });
    } catch (err) {
      console.warn("[MapCanvas] Autocomplete indisponível:", err);
    }
  }, [searchInputRef]);

  // sincroniza pins (clientes)
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const Advanced = (google.maps as any).marker?.AdvancedMarkerElement;
    const PinElement = (google.maps as any).marker?.PinElement;
    const mapIdFromMap = (map as any)?.get?.("mapId");
    const canUseAdvanced = Boolean(Advanced && PinElement && mapIdFromMap);

    // Remover ausentes
    const incomingIds = new Set(markers.map((m) => m.id));
    Object.keys(advRefs.current).forEach((id) => {
      if (!incomingIds.has(id)) {
        advRefs.current[id].map = null as any;
        delete advRefs.current[id];
      }
    });
    Object.keys(markerRefs.current).forEach((id) => {
      if (!incomingIds.has(id)) {
        markerRefs.current[id].setMap(null);
        delete markerRefs.current[id];
      }
    });

    let created = 0;

    markers.forEach((m, idx) => {
      if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return;
      const pos = { lat: m.lat, lng: m.lng } as google.maps.LatLngLiteral;

      if (canUseAdvanced) {
        const pin = new (PinElement as any)({
          background: colorOf(pinColor, m, idx),
          glyph: (m.label ?? String(idx + 1)).toString(),
          glyphColor: glyphColorOf(pinGlyphColor, m, idx),
          borderColor: colorOf(pinColor, m, idx),
          scale: 1.0,
        });

        if (!advRefs.current[m.id]) {
          advRefs.current[m.id] = new (Advanced as any)({
            map,
            position: pos,
            content: pin.element,
          });
        } else {
          advRefs.current[m.id].position = pos as any;
          (advRefs.current[m.id] as any).content = pin.element;
          advRefs.current[m.id].map = map as any;
        }
      } else {
        if (!markerRefs.current[m.id]) {
          markerRefs.current[m.id] = new google.maps.Marker({
            position: pos,
            map,
            label: m.label ?? String(idx + 1),
          });
        } else {
          markerRefs.current[m.id].setPosition(pos);
          markerRefs.current[m.id].setLabel(m.label ?? String(idx + 1));
          markerRefs.current[m.id].setMap(map);
        }
      }
      created++;
    });

    console.log("[MapCanvas] pins criados/atualizados:", created, "canUseAdvanced:", canUseAdvanced);

    // Ajusta bounds
    const valid = markers.filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));
    if (valid.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      valid.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, 60);
        const z = map.getZoom() ?? 0;
        if (z > maxZoomAfterFit) map.setZoom(maxZoomAfterFit);
      }
    }
  }, [markers, pinColor, pinGlyphColor, maxZoomAfterFit]);

  return <div ref={containerRef} style={{ height }} className="w-full rounded-md overflow-hidden" />;
}
