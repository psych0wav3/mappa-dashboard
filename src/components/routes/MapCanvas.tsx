"use client";

import * as React from "react";
import { Loader } from "@googlemaps/js-api-loader";

type Marker = {
  id: string;
  lat: number;
  lng: number;
  label?: string;
};

type Props = {
  markers: Marker[];
  height?: number;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  pinColor?: string | ((marker: Marker, index: number) => string);
  pinGlyphColor?: string | ((marker: Marker, index: number) => string);
  maxZoomAfterFit?: number;
};

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const loader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["marker", "places"],
});

const PIN_SIZE = 40;
const ORANGE = "#f97316";

function svgPin(
  backgroundColor: string,
  text: string,
  textColor: string,
) {
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${PIN_SIZE}"
      height="${PIN_SIZE * 1.25}"
      viewBox="0 0 40 50"
    >
      <defs>
        <filter id="s">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            flood-color="rgba(0,0,0,.35)"
          />
        </filter>
      </defs>

      <g filter="url(#s)">
        <path
          fill="${backgroundColor}"
          d="M20 0c-8.837 0-16 7.163-16 16 0 11.5 16 32 16 32s16-20.5 16-32C36 7.163 28.837 0 20 0z"
        />
        <circle
          cx="20"
          cy="16"
          r="10"
          fill="white"
          opacity=".15"
        />
      </g>

      <text
        x="20"
        y="19.5"
        text-anchor="middle"
        font-family="Inter,system-ui,Roboto,Arial"
        font-size="13"
        font-weight="700"
        fill="${textColor}"
      >
        ${text}
      </text>
    </svg>
  `;

  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg)
  );
}

function resolvePinColor(
  value: Props["pinColor"],
  marker: Marker,
  index: number,
) {
  return typeof value === "function"
    ? value(marker, index)
    : value;
}

function resolvePinGlyphColor(
  value: Props["pinGlyphColor"],
  marker: Marker,
  index: number,
) {
  return typeof value === "function"
    ? value(marker, index)
    : value;
}

function hasMapId(map: google.maps.Map) {
  return Boolean(map.get("mapId"));
}

export default function MapCanvas({
  markers,
  height = 520,
  searchInputRef,
  pinColor = "#0077C8",
  pinGlyphColor = "#ffffff",
  maxZoomAfterFit = 16,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);

  const advancedMarkerRefs = React.useRef<
    Record<string, google.maps.marker.AdvancedMarkerElement>
  >({});

  const markerRefs = React.useRef<
    Record<string, google.maps.Marker>
  >({});

  const searchMarkerRef =
    React.useRef<google.maps.Marker | null>(null);

  const searchAdvancedMarkerRef =
    React.useRef<google.maps.marker.AdvancedMarkerElement | null>(
      null,
    );

  const searchPositionRef =
    React.useRef<google.maps.LatLngLiteral | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      await loader.load();

      if (
        cancelled ||
        !containerRef.current ||
        mapRef.current
      ) {
        return;
      }

      mapRef.current = new google.maps.Map(
        containerRef.current,
        {
          center: {
            lat: -23.55052,
            lng: -46.633308,
          },
          zoom: 11,
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: false,
        },
      );
    }

    void initializeMap();

    return () => {
      cancelled = true;
    };
  }, []);

  const fitToMarkers = React.useCallback(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const validMarkers = markers.filter(
      (marker) =>
        Number.isFinite(marker.lat) &&
        Number.isFinite(marker.lng),
    );

    if (validMarkers.length === 0) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    validMarkers.forEach((marker) => {
      bounds.extend({
        lat: marker.lat,
        lng: marker.lng,
      });
    });

    if (bounds.isEmpty()) {
      return;
    }

    map.fitBounds(bounds, 60);

    const zoom = map.getZoom() ?? 0;

    if (zoom > maxZoomAfterFit) {
      map.setZoom(maxZoomAfterFit);
    }
  }, [markers, maxZoomAfterFit]);

  const fitAll = React.useCallback(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const validMarkers = markers.filter(
      (marker) =>
        Number.isFinite(marker.lat) &&
        Number.isFinite(marker.lng),
    );

    const searchPosition = searchPositionRef.current;
    const hasMarkers = validMarkers.length > 0;
    const hasSearchPosition = searchPosition !== null;

    if (!hasMarkers && hasSearchPosition) {
      map.setCenter(searchPosition);
      map.setZoom(17);
      return;
    }

    if (!hasMarkers && !hasSearchPosition) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    validMarkers.forEach((marker) => {
      bounds.extend({
        lat: marker.lat,
        lng: marker.lng,
      });
    });

    if (searchPosition) {
      bounds.extend(searchPosition);
    }

    if (bounds.isEmpty()) {
      return;
    }

    map.fitBounds(bounds, 60);

    const zoom = map.getZoom() ?? 0;

    if (zoom > maxZoomAfterFit) {
      map.setZoom(maxZoomAfterFit);
    }
  }, [markers, maxZoomAfterFit]);

  React.useEffect(() => {
    const map = mapRef.current;
    const input = searchInputRef?.current;

    if (!map || !input) {
      return;
    }

    let autocomplete:
      | google.maps.places.Autocomplete
      | null = null;

    let placeChangedListener:
      | google.maps.MapsEventListener
      | null = null;

    const handleInput = () => {
      if (input.value.trim() !== "") {
        return;
      }

      if (searchMarkerRef.current) {
        searchMarkerRef.current.setMap(null);
        searchMarkerRef.current = null;
      }

      if (searchAdvancedMarkerRef.current) {
        searchAdvancedMarkerRef.current.map = null;
        searchAdvancedMarkerRef.current = null;
      }

      searchPositionRef.current = null;
      fitToMarkers();
    };

    try {
      autocomplete = new google.maps.places.Autocomplete(
        input,
        {
          fields: [
            "geometry",
            "formatted_address",
            "name",
          ],
          types: ["geocode"],
        },
      );

      placeChangedListener = autocomplete.addListener(
        "place_changed",
        () => {
          if (!autocomplete) {
            return;
          }

          const place = autocomplete.getPlace();
          const geometry = place.geometry;

          const displayValue =
            place.formatted_address ??
            place.name ??
            "";

          input.dispatchEvent(
            new CustomEvent<string>("gm-place", {
              detail: displayValue,
              bubbles: true,
            }),
          );

          if (!geometry?.location) {
            return;
          }

          if (searchMarkerRef.current) {
            searchMarkerRef.current.setMap(null);
            searchMarkerRef.current = null;
          }

          if (searchAdvancedMarkerRef.current) {
            searchAdvancedMarkerRef.current.map = null;
            searchAdvancedMarkerRef.current = null;
          }

          const position: google.maps.LatLngLiteral = {
            lat: geometry.location.lat(),
            lng: geometry.location.lng(),
          };

          searchPositionRef.current = position;

          const canUseAdvancedMarker = hasMapId(map);

          if (canUseAdvancedMarker) {
            const pin =
              new google.maps.marker.PinElement({
                background: ORANGE,
                borderColor: ORANGE,
                glyphColor: "#ffffff",
                glyph: "",
                scale: 1.1,
              });

            searchAdvancedMarkerRef.current =
              new google.maps.marker.AdvancedMarkerElement({
                map,
                position,
                content: pin.element,
                zIndex: 9999,
              });
          } else {
            const url = svgPin(
              ORANGE,
              "",
              "#ffffff",
            );

            searchMarkerRef.current =
              new google.maps.Marker({
                position,
                map,
                zIndex: 9999,
                icon: {
                  url,
                  scaledSize: new google.maps.Size(
                    PIN_SIZE,
                    PIN_SIZE * 1.25,
                  ),
                  anchor: new google.maps.Point(
                    PIN_SIZE / 2,
                    PIN_SIZE * 1.25,
                  ),
                },
              });
          }

          fitAll();
        },
      );

      input.addEventListener("input", handleInput);
    } catch (error: unknown) {
      console.warn(
        "[MapCanvas] Autocomplete indisponível:",
        error,
      );
    }

    return () => {
      input.removeEventListener("input", handleInput);
      placeChangedListener?.remove();
    };
  }, [searchInputRef, fitAll, fitToMarkers]);

  React.useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const canUseAdvancedMarker = hasMapId(map);

    const incomingIds = new Set(
      markers.map((marker) => marker.id),
    );

    Object.keys(advancedMarkerRefs.current).forEach(
      (id) => {
        if (incomingIds.has(id)) {
          return;
        }

        advancedMarkerRefs.current[id].map = null;
        delete advancedMarkerRefs.current[id];
      },
    );

    Object.keys(markerRefs.current).forEach((id) => {
      if (incomingIds.has(id)) {
        return;
      }

      markerRefs.current[id].setMap(null);
      delete markerRefs.current[id];
    });

    markers.forEach((marker, index) => {
      if (
        !Number.isFinite(marker.lat) ||
        !Number.isFinite(marker.lng)
      ) {
        return;
      }

      const position: google.maps.LatLngLiteral = {
        lat: marker.lat,
        lng: marker.lng,
      };

      const backgroundColor =
        resolvePinColor(
          pinColor,
          marker,
          index,
        ) ?? "#0077C8";

      const glyphColor =
        resolvePinGlyphColor(
          pinGlyphColor,
          marker,
          index,
        ) ?? "#ffffff";

      const glyph = (
        marker.label ??
        String(index + 1)
      ).toString();

      if (canUseAdvancedMarker) {
        const pin =
          new google.maps.marker.PinElement({
            background: backgroundColor,
            glyph,
            glyphColor,
            borderColor: backgroundColor,
            scale: 1.25,
          });

        const existingMarker =
          advancedMarkerRefs.current[marker.id];

        if (!existingMarker) {
          advancedMarkerRefs.current[marker.id] =
            new google.maps.marker.AdvancedMarkerElement({
              map,
              position,
              content: pin.element,
            });

          return;
        }

        existingMarker.position = position;
        existingMarker.content = pin.element;
        existingMarker.map = map;

        return;
      }

      const url = svgPin(
        backgroundColor,
        glyph,
        glyphColor,
      );

      const existingMarker =
        markerRefs.current[marker.id];

      if (!existingMarker) {
        markerRefs.current[marker.id] =
          new google.maps.Marker({
            position,
            map,
            icon: {
              url,
              scaledSize: new google.maps.Size(
                PIN_SIZE,
                PIN_SIZE * 1.25,
              ),
              anchor: new google.maps.Point(
                PIN_SIZE / 2,
                PIN_SIZE * 1.25,
              ),
            },
          });

        return;
      }

      existingMarker.setPosition(position);
      existingMarker.setIcon({
        url,
        scaledSize: new google.maps.Size(
          PIN_SIZE,
          PIN_SIZE * 1.25,
        ),
        anchor: new google.maps.Point(
          PIN_SIZE / 2,
          PIN_SIZE * 1.25,
        ),
      });
      existingMarker.setMap(map);
    });

    fitAll();
  }, [
    markers,
    pinColor,
    pinGlyphColor,
    fitAll,
  ]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full overflow-hidden rounded-md"
    />
  );
}