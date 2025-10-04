"use client";

import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import * as React from "react";

export type MapMarker = { id: string; lat: number; lng: number; label?: string };

export default function MapCanvas({
  markers,
  height = 520,
}: { markers: MapMarker[]; height?: number }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const { isLoaded } = useJsApiLoader({
    id: "gmap-sdk",
    googleMapsApiKey: apiKey || "DUMMY",
  });

  const defaultCenter = React.useMemo(
    () =>
      markers[0]
        ? { lat: markers[0].lat, lng: markers[0].lng }
        : { lat: -23.55, lng: -46.63 },
    [markers]
  );

  if (!apiKey || !isLoaded) {
    return (
      <div className="grid place-items-center bg-neutral-50 text-neutral-500" style={{ height }}>
        <div className="text-sm">(Mapa indisponível — defina NEXT_PUBLIC_GOOGLE_MAPS_KEY)</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden" style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ height, width: "100%" }}
        center={defaultCenter}
        zoom={12}
        options={{ streetViewControl: false, mapTypeControl: true, fullscreenControl: true }}
      >
        {markers.map((m, idx) => (
          <MarkerF key={m.id} position={{ lat: m.lat, lng: m.lng }} label={String(m.label ?? idx + 1)} />
        ))}
      </GoogleMap>
    </div>
  );
}
