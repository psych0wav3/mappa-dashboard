// src/lib/geocoding.ts
import { prisma } from "@/lib/prisma";

export async function ensureClientLatLng(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, lat: true, lng: true, address: true, city: true, state: true, zip: true },
  });
  if (!client) return null;
  if (client.lat != null && client.lng != null) return { lat: client.lat, lng: client.lng };

  const address = [client.address, client.city, client.state, client.zip].filter(Boolean).join(", ");
  if (!address) return null;

  // ⚠️ Precisa de GOOGLE_MAPS_API_KEY com Geocoding API habilitada
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const json = await res.json();

  const loc = json?.results?.[0]?.geometry?.location;
  if (!loc) return null;

  await prisma.client.update({
    where: { id: clientId },
    data: { lat: loc.lat, lng: loc.lng },
  });

  return { lat: loc.lat, lng: loc.lng };
}
