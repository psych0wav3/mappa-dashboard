"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  dateISO: string;                          // yyyy-mm-dd
  onChangeDate: (nextISO: string) => void;  // dispara quando muda o mês/dia
  className?: string;
};

function fromISO(iso: string) { return new Date(iso + "T00:00:00Z"); }
function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function addMonths(d: Date, n: number) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, Math.min(d.getUTCDate(), 28)));
}
function monthLabelPT(d: Date) {
  return d.toLocaleString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
}

export default function MonthNavigator({ dateISO, onChangeDate, className }: Props) {
  const cur = fromISO(dateISO);

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <Button variant="outline" size="sm" onClick={() => onChangeDate(toISO(addMonths(cur, -12)))}>«</Button>
      <Button variant="outline" size="sm" onClick={() => onChangeDate(toISO(addMonths(cur, -1)))}>‹</Button>

      <div className="min-w-[180px] text-center font-medium capitalize">
        {monthLabelPT(cur)}
      </div>

      <Button variant="outline" size="sm" onClick={() => onChangeDate(toISO(addMonths(cur, +1)))}>›</Button>
      <Button variant="outline" size="sm" onClick={() => onChangeDate(toISO(addMonths(cur, +12)))}>»</Button>

      <Button
        className="ml-2 btn-brand text-white"
        size="sm"
        onClick={() => onChangeDate(toISO(new Date()))}
      >
        Hoje
      </Button>
    </div>
  );
}
