"use client";
import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function fmtYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addMonths(d: Date, n: number) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  // travar em dia 1 pra não pular de mês em meses curtos
  return x;
}

export default function MonthNav({ date }: { date: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const cur = new Date(date + "T00:00:00Z");

  const pushDate = (d: Date) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("date", fmtYMD(d));
    router.replace(`${pathname}?${sp}`, { scroll: false });
  };

  const monthLabel = cur.toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => pushDate(addMonths(cur, -12))}>
        «
      </Button>
      <Button variant="outline" size="sm" onClick={() => pushDate(addMonths(cur, -1))}>
        ‹
      </Button>
      <div className="min-w-[180px] text-center font-medium capitalize">{monthLabel}</div>
      <Button variant="outline" size="sm" onClick={() => pushDate(addMonths(cur, +1))}>
        ›
      </Button>
      <Button variant="outline" size="sm" onClick={() => pushDate(addMonths(cur, +12))}>
        »
      </Button>

      <Button
        className="ml-3 btn-brand text-white"
        size="sm"
        onClick={() => pushDate(new Date())}
      >
        Hoje
      </Button>
    </div>
  );
}
