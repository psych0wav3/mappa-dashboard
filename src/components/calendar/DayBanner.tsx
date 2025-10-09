//src/components/calendar/DayBanner.tsx
"use client";
import * as React from "react";

function formatWeekday(isoDate: string) {
  // “segunda-feira”, “terça-feira”, ...
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long" })
    .format(new Date(isoDate + "T00:00:00"))
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default function DayBanner({ dateISO }: { dateISO: string }) {
  return (
    <div className="w-full btn-brand text-white px-4 lg:px-6 py-3">
      <div className="text-base font-medium tracking-wide">
        {formatWeekday(dateISO)}
      </div>
    </div>
  );
}
