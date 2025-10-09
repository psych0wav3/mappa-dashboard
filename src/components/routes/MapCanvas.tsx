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
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  pinColor?: string | ((m: Marker, idx: number) => string);
  pinGlyphColor?: string | ((m: Marker, idx: number) => string);
  maxZoomAfterFit?: number;
};

const PIN_SIZE = 40;
const ORANGE = "#f97316";

function svgPin(bg: string, text: string, textColor: string) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_SIZE}" height="${PIN_SIZE * 1.25}" viewBox="0 0 40 50">
  <defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,.35)"/></filter></defs>
  <g filter="url(#s)">
    <path fill="${bg}" d="M20 0c-8.837 0-16 7.163-16 16 0 11.5 16 32 16 32s16-20.5 16-32C36 7.163 28.837 0 20 0z"/>
    <circle cx="20" cy="16" r="10" fill="white" opacity=".15"/>
  </g>
  <text x="20" y="19.5" text-anchor="middle" font-family="Inter,system-ui,Roboto,Arial"
        font-size="13" font-weight="700" fill="${textColor}">${text}</text>
</svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

export default function MapCanvas({
  markers,
  height = 520,
  searchInputRef,
  pinColor = "#2563eb",
  pinGlyphColor = "#ffffff",
  maxZoomAfterFit = 16,
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);

  const advRefs = React.useRef<Record<string, google.maps.marker.AdvancedMarkerElement>>({});
  const markerRefs = React.useRef<Record<string, google.maps.Marker>>({});

  // pin de busca
  const searchMarkerRef = React.useRef<google.maps.Marker | null>(null);
  const searchAdvRef = React.useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const searchPosRef = React.useRef<google.maps.LatLngLiteral | null>(null); // <- posição do pin laranja

  // cria mapa
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      await loader.load();
      if (cancelled || !ref.current || mapRef.current) return;
      mapRef.current = new google.maps.Map(ref.current, {
        center: { lat: -23.55052, lng: -46.633308 },
        zoom: 11,
        // mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID as string,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: false,
      });
    })();
    return () => { cancelled = true; };
  }, []);

  const colorOf = (v: Props["pinColor"], m: Marker, i: number) => (typeof v === "function" ? v(m, i) : v);
  const glyphColorOf = (v: Props["pinGlyphColor"], m: Marker, i: number) =>
    (typeof v === "function" ? v(m, i) : v);

  // 👉 helper: fit só das piscinas
  const fitToMarkers = React.useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const valid = markers.filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));
    if (valid.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    valid.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 60);
      const z = map.getZoom() ?? 0;
      if (z > maxZoomAfterFit) map.setZoom(maxZoomAfterFit);
    }
  }, [markers, maxZoomAfterFit]);

  // 👉 helper: fit piscinas + pin laranja (quando houver)
  const fitAll = React.useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const valid = markers.filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));
    const hasMarkers = valid.length > 0;
    const hasSearch = Boolean(searchPosRef.current);

    // se só tem busca e nenhum marker, centraliza como antes
    if (!hasMarkers && hasSearch) {
      const loc = searchPosRef.current!;
      map.setCenter(loc);
      map.setZoom(17);
      return;
    }

    if (!hasMarkers && !hasSearch) return;

    const bounds = new google.maps.LatLngBounds();
    valid.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
    if (hasSearch) bounds.extend(searchPosRef.current!);

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 60);
      const z = map.getZoom() ?? 0;
      if (z > maxZoomAfterFit) map.setZoom(maxZoomAfterFit);
    }
  }, [markers, maxZoomAfterFit]);

  // Autocomplete: cria pin laranja e faz fitAll()
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const input = searchInputRef?.current;
    if (!input) return;

    let autocomplete: google.maps.places.Autocomplete | null = null;
    let inputListener: ((this: HTMLInputElement, ev: Event) => any) | null = null;

    try {
      autocomplete = new google.maps.places.Autocomplete(input, {
        fields: ["geometry", "formatted_address", "name"],
        types: ["geocode"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete!.getPlace();
        const geom = place.geometry;
        const display = place.formatted_address || place.name || "";
        input.dispatchEvent(new CustomEvent("gm-place", { detail: display, bubbles: true }));
        if (!geom) return;

        // remove pin anterior
        if (searchMarkerRef.current) { searchMarkerRef.current.setMap(null); searchMarkerRef.current = null; }
        if (searchAdvRef.current) { (searchAdvRef.current as any).map = null; searchAdvRef.current = null; }
        searchPosRef.current = null;

        const Advanced = (google.maps as any).marker?.AdvancedMarkerElement;
        const PinElement = (google.maps as any).marker?.PinElement;
        const canUseAdvanced = Boolean(Advanced && PinElement && (map as any)?.get?.("mapId"));

        if (geom.location) {
          const loc = { lat: geom.location.lat(), lng: geom.location.lng() };
          searchPosRef.current = loc;

          if (canUseAdvanced) {
            const pin = new (PinElement as any)({
              background: ORANGE,
              borderColor: ORANGE,
              glyphColor: "#ffffff",
              glyph: "",
              scale: 1.1,
            });
            searchAdvRef.current = new (Advanced as any)({
              map,
              position: loc,
              content: pin.element,
              zIndex: 9999,
            });
          } else {
            const url = svgPin(ORANGE, "", "#ffffff");
            searchMarkerRef.current = new google.maps.Marker({
              position: loc,
              map,
              zIndex: 9999,
              icon: {
                url,
                scaledSize: new google.maps.Size(PIN_SIZE, PIN_SIZE * 1.25),
                anchor: new google.maps.Point(PIN_SIZE / 2, PIN_SIZE * 1.25),
              },
            });
          }
        }

        // Em vez de focar só no viewport do lugar, enquadra tudo:
        fitAll();
      });

      // limpar → remove pin laranja e volta para visão geral das piscinas
      inputListener = function () {
        if (this.value.trim() === "") {
          if (searchMarkerRef.current) { searchMarkerRef.current.setMap(null); searchMarkerRef.current = null; }
          if (searchAdvRef.current) { (searchAdvRef.current as any).map = null; searchAdvRef.current = null; }
          searchPosRef.current = null;
          fitToMarkers();
        }
      };
      input.addEventListener("input", inputListener);
    } catch (err) {
      console.warn("[MapCanvas] Autocomplete indisponível:", err);
    }

    return () => {
      if (inputListener && input) input.removeEventListener("input", inputListener);
    };
  }, [searchInputRef, fitAll, fitToMarkers]);

  // sincroniza pins dos clientes (inalterado) + usa fitAll() no final
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const Advanced = (google.maps as any).marker?.AdvancedMarkerElement;
    const PinElement = (google.maps as any).marker?.PinElement;
    const canUseAdvanced = Boolean(Advanced && PinElement && (map as any)?.get?.("mapId"));

    const incomingIds = new Set(markers.map((m) => m.id));
    Object.keys(advRefs.current).forEach((id) => {
      if (!incomingIds.has(id)) { advRefs.current[id].map = null as any; delete advRefs.current[id]; }
    });
    Object.keys(markerRefs.current).forEach((id) => {
      if (!incomingIds.has(id)) { markerRefs.current[id].setMap(null); delete markerRefs.current[id]; }
    });

    markers.forEach((m, idx) => {
      if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return;
      const pos = { lat: m.lat, lng: m.lng } as google.maps.LatLngLiteral;

      if (canUseAdvanced) {
        const pin = new (PinElement as any)({
          background: colorOf(pinColor, m, idx),
          glyph: (m.label ?? String(idx + 1)).toString(),
          glyphColor: glyphColorOf(pinGlyphColor, m, idx),
          borderColor: colorOf(pinColor, m, idx),
          scale: 1.25,
        });

        if (!advRefs.current[m.id]) {
          advRefs.current[m.id] = new (Advanced as any)({ map, position: pos, content: pin.element });
        } else {
          advRefs.current[m.id].position = pos as any;
          (advRefs.current[m.id] as any).content = pin.element;
          (advRefs.current[m.id] as any).map = map;
        }
      } else {
        const bg = colorOf(pinColor, m, idx);
        const glyph = (m.label ?? String(idx + 1)).toString();
        const glyphColor = glyphColorOf(pinGlyphColor, m, idx);
        const url = svgPin(bg as string, glyph, glyphColor as string);

        if (!markerRefs.current[m.id]) {
          markerRefs.current[m.id] = new google.maps.Marker({
            position: pos, map,
            icon: {
              url,
              scaledSize: new google.maps.Size(PIN_SIZE, PIN_SIZE * 1.25),
              anchor: new google.maps.Point(PIN_SIZE / 2, PIN_SIZE * 1.25),
            },
          });
        } else {
          markerRefs.current[m.id].setPosition(pos);
          markerRefs.current[m.id].setIcon({
            url,
            scaledSize: new google.maps.Size(PIN_SIZE, PIN_SIZE * 1.25),
            anchor: new google.maps.Point(PIN_SIZE / 2, PIN_SIZE * 1.25),
          });
          markerRefs.current[m.id].setMap(map);
        }
      }
    });

    // 👇 agora enquadra piscinas + pin de busca (se houver)
    fitAll();
  }, [markers, pinColor, pinGlyphColor, maxZoomAfterFit, fitAll]);

  return <div ref={ref} style={{ height }} className="w-full rounded-md overflow-hidden" />;
}
