// src/components/visits/WeekdayTabs.tsx
"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DAYS = [
  { v: 1, short: "Seg" },
  { v: 2, short: "Ter" },
  { v: 3, short: "Qua" },
  { v: 4, short: "Qui" },
  { v: 5, short: "Sex" },
  { v: 6, short: "Sáb" },
];

export default function WeekdayTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const selected = Number(params.get("day") || "0") || getDefaultDay();

  const onSelect = (d: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("day", String(d));
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {DAYS.map((d) => {
        const active = selected === d.v;
        return (
          <button
            key={d.v}
            type="button"
            onClick={() => onSelect(d.v)}
            className={
              "rounded-xl px-4 py-2 text-sm border transition " +
              (active
                ? "bg-blue-600 text-white border-blue-600" // 🔵 ativo azul como o sidebar
                : "bg-white border-neutral-300 hover:bg-blue-50")
            }
          >
            {d.short}
          </button>
        );
      })}
    </div>
  );
}

function getDefaultDay() {
  // JS: 0=Dom..6=Sáb -> queremos 1=Seg..6=Sáb
  const js = new Date().getDay(); // 0..6
  return js === 0 ? 6 : js; // Dom->6, Seg..Sáb = 1..6
}
