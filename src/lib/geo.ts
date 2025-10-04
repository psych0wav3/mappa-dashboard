export type LatLng = { lat: number; lng: number };

const R = 6371; // km
export function haversine(a: LatLng, b: LatLng) {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h)); // km
}

// estima tempo de deslocamento (km / velocidade média urbana)
export function estimateTravelMin(distanceKm: number, avgKmh = 28) {
  return Math.ceil((distanceKm / avgKmh) * 60);
}

// nearest-neighbor para construir ordem inicial
export function nearestNeighborOrder(points: LatLng[], startIndex = 0) {
  const n = points.length;
  const visited = new Array(n).fill(false);
  const order: number[] = [];
  let cur = startIndex;
  for (let k = 0; k < n; k++) {
    order.push(cur);
    visited[cur] = true;
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < n; i++) {
      if (!visited[i]) {
        const d = haversine(points[cur], points[i]);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
    }
    if (best === -1) break;
    cur = best;
  }
  return order;
}

// 2-opt melhora local
export function twoOpt(points: LatLng[], order: number[]) {
  const improved = [...order];
  let changed = true;
  const dist = (i: number, j: number) =>
    haversine(points[i], points[j]);

  function total(o: number[]) {
    let t = 0;
    for (let i = 0; i < o.length - 1; i++) t += dist(o[i], o[i + 1]);
    return t;
  }

  let bestLen = total(improved);
  while (changed) {
    changed = false;
    for (let i = 1; i < improved.length - 2; i++) {
      for (let k = i + 1; k < improved.length - 1; k++) {
        const newOrder = [
          ...improved.slice(0, i),
          ...improved.slice(i, k + 1).reverse(),
          ...improved.slice(k + 1),
        ];
        const len = total(newOrder);
        if (len + 1e-6 < bestLen) {
          bestLen = len;
          for (let z = 0; z < improved.length; z++) improved[z] = newOrder[z];
          changed = true;
        }
      }
    }
  }
  return improved;
}

export function routeDistanceKm(points: LatLng[], order: number[]) {
  let km = 0;
  for (let i = 0; i < order.length - 1; i++) {
    km += haversine(points[order[i]], points[order[i + 1]]);
  }
  return km;
}
