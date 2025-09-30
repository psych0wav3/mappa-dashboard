// src/components/visits/TechFilter.tsx
"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function TechFilter({
  technicians,
}: {
  technicians: { id: string; firstName: string; lastName: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const current = params.get("tech") ?? "";

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const sp = new URLSearchParams(params.toString());
    const val = e.target.value;
    if (val) sp.set("tech", val);
    else sp.delete("tech"); // "Todos"
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-neutral-700">Técnico:</label>
      <select
        className="h-9 rounded-md border border-neutral-300 px-3 text-sm bg-white"
        value={current}
        onChange={onChange}
      >
        <option value="">Todos</option>
        {technicians.map((t) => (
          <option key={t.id} value={t.id}>
            {t.firstName} {t.lastName}
          </option>
        ))}
      </select>
    </div>
  );
}
