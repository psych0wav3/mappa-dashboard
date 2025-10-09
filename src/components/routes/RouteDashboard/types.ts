export type Visit = {
  id: string;
  clientName: string;
  address?: string;
  windowStart: number;
  windowEnd: number;
  status: "PLANNED" | "IN_PROGRESS" | "DONE" | string;
  lat?: number | null;
  lng?: number | null;
  order?: number;
};

export type TechDay = {
  techId: string;
  techName: string;
  planned: number;
  done: number;
  durationMin?: number;
  distanceKm?: number;
  visits: Visit[];
};

export type ApiResult = { items: TechDay[] };

// Utils compartilhados
export const pad2 = (n: number) => String(n).padStart(2, "0");
export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const addDays = (iso: string, delta: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return toISODate(d);
};
export function formatLongDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}
export function getWeekStrip(centerISO: string) {
  const d = new Date(centerISO + "T00:00:00");
  const dow = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - dow);
  const todayISO = toISODate(new Date());
  const days: { iso: string; wd: string; dd: string; isToday: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(start);
    dd.setDate(start.getDate() + i);
    days.push({
      iso: toISODate(dd),
      wd: dd.toLocaleDateString("pt-BR", { weekday: "short" }),
      dd: pad2(dd.getDate()),
      isToday: toISODate(dd) === todayISO,
    });
  }
  return days;
}
