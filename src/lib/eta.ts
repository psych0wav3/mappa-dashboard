import { estimateTravelMin, routeDistanceKm, LatLng, haversine } from "./geo";

export type StopInput = {
  id: string;
  lat: number;
  lng: number;
  durationMin: number;
};

export function makeSchedule(
  startTime: string, // "08:00"
  orderIds: string[],
  idToStop: Record<string, StopInput>,
  avgKmh = 28
) {
  const parse = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const toStr = (min: number) =>
    `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

  let curMin = parse(startTime);
  const legs: { travelMin: number; distanceKm: number }[] = [];
  const timeline: { id: string; eta: string; etd: string }[] = [];

  for (let i = 0; i < orderIds.length; i++) {
    if (i === 0) {
      // primeira parada: sem deslocamento (ou considere base do técnico)
      legs.push({ travelMin: 0, distanceKm: 0 });
    } else {
      const a = idToStop[orderIds[i - 1]];
      const b = idToStop[orderIds[i]];
      const dKm = haversine(a, b);
      const tMin = estimateTravelMin(dKm, avgKmh);
      curMin += tMin;
      legs.push({ travelMin: tMin, distanceKm: dKm });
    }
    const s = idToStop[orderIds[i]];
    const eta = curMin;
    const etd = eta + s.durationMin;
    timeline.push({ id: s.id, eta: toStr(eta), etd: toStr(etd) });
    curMin = etd;
  }

  // total
  const points: LatLng[] = orderIds.map((id) => idToStop[id]);
  const totalKm = routeDistanceKm(points, points.map((_, i) => i));
  const totalMin = curMin - parse(startTime);

  return { legs, timeline, total: { distanceKm: totalKm, durationMin: totalMin } };
}
