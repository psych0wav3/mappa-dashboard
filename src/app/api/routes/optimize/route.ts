import { NextResponse } from "next/server";
import { nearestNeighborOrder, twoOpt } from "@/lib/geo";
import { makeSchedule, StopInput } from "@/lib/eta";

export type OptimizeInput = {
  techStartLatLng?: { lat: number; lng: number }; // (não usado no mock)
  startTime: string; // "08:00"
  stops: Array<{ id: string; lat: number; lng: number; durationMin: number }>;
};

export async function POST(req: Request) {
  const body = (await req.json()) as OptimizeInput;

  if (!body?.stops?.length) {
    return NextResponse.json({ error: "stops required" }, { status: 400 });
  }

  const pts = body.stops.map((s) => ({ lat: s.lat, lng: s.lng }));
  const nn = nearestNeighborOrder(pts, 0);
  const best = twoOpt(pts, nn);

  const orderIds = best.map((idx) => body.stops[idx].id);

  const idTo: Record<string, StopInput> = {};
  for (const s of body.stops) idTo[s.id] = s;

  const { legs, timeline, total } = makeSchedule(body.startTime ?? "08:00", orderIds, idTo);

  return NextResponse.json({
    order: orderIds,
    legs,
    etas: timeline,
    total,
  });
}

