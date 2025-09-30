"use client";

import * as React from "react";

// Tipo compartilhado com a página / coluna
export type Instance = {
  id: string;
  startHour: number;  // 6..18
  endHour: number;    // > startHour
  order: number;
  status: string;     // "planned" | ...
  client: {
    id: string;
    firstName: string;
    lastName: string;
    street: string | null;
    number: string | null;
  };
};

type Props = {
  data: Instance; // <- padronizamos para 'data'
};

function hourLabel(h: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:00`;
}

export default function VisitCard({ data }: Props) {
  const { client, startHour, endHour, status } = data;

  return (
    <div className="rounded-lg border p-3 bg-white shadow-sm">
      <div className="text-sm font-medium">
        {client.firstName} {client.lastName}
      </div>

      {(client.street || client.number) && (
        <div className="text-xs text-neutral-500">
          {client.street ?? ""} {client.number ?? ""}
        </div>
      )}

      <div className="mt-1 text-sm">
        <span className="font-semibold">
          {hourLabel(startHour)}–{hourLabel(endHour)}
        </span>{" "}
        •{" "}
        <span className="uppercase text-xs px-2 py-0.5 rounded-full bg-neutral-100">
          {status}
        </span>
      </div>
    </div>
  );
}
