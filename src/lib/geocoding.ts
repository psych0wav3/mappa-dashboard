// src/lib/geocoding.ts
import { prisma } from "@/lib/prisma";

/**
 * Garante poolLat/poolLng no Client a partir do endereço da PISCINA
 * e devolve as coords. Retorna null se não conseguir.
 */
export async function ensureClientLatLng(
  clientId: string
): Promise<{ lat: number; lng: number } | null> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      // coords da piscina
      poolLat: true,
      poolLng: true,
      // endereço da piscina
      poolStreet: true,
      poolNumber: true,
      poolDistrict: true,
      poolCity: true,
      poolUf: true,
      poolCep: true,
    },
  });
  if (!client) return null;

  // já tem coordenadas?
  if (client.poolLat != null && client.poolLng != null) {
    return { lat: client.poolLat, lng: client.poolLng };
  }

  // monta endereço "Rua, Nº - Bairro, Cidade - UF, CEP"
  const street = [client.poolStreet, client.poolNumber].filter(Boolean).join(", ");
  const cityUf = [client.poolCity, client.poolUf].filter(Boolean).join(" - ");
  const address = [street, client.poolDistrict, cityUf, client.poolCep]
    .filter(Boolean)
    .join(", ");

  if (!address) return null;

  // ⚠️ use uma API key de servidor com Geocoding API habilitada
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const json = await res.json();
  const loc = json?.results?.[0]?.geometry?.location as
    | { lat: number; lng: number }
    | undefined;

  if (!loc) return null;

  // persiste nas colunas corretas
  await prisma.client.update({
    where: { id: clientId },
    data: { poolLat: loc.lat, poolLng: loc.lng },
  });

  return { lat: loc.lat, lng: loc.lng };
}
