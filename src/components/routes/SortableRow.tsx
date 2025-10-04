"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const HOURS = Array.from({ length: 14 }, (_, i) => 6 + i); // 6..19

export type SelectedItem = {
  id: string;
  label: string;
  windowStart: number;
  windowEnd: number;
  order: number;
};

export default function SortableRow({
  id,
  label,
  value,
  conflict,
  onChange,
  onRemove,
}: {
  id: string;
  label: string;
  value: SelectedItem;
  conflict?: boolean;
  onChange: (patch: Partial<SelectedItem>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-md border px-3 py-2 flex items-center gap-3 bg-white ${
        isDragging ? "opacity-80" : ""
      } ${conflict ? "border-red-400" : ""}`}
      title={conflict ? "Janela sobreposta com outra visita" : ""}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab select-none text-neutral-400"
        title="Arrastar"
      >
        ⋮⋮
      </button>

      <div className="w-7 h-7 rounded bg-green-600 text-white grid place-items-center text-sm font-semibold shrink-0">
        {String(value.order ?? 1)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{label}</div>
        <div className="flex items-center gap-2 mt-1">
          <select
            className="h-8 rounded border border-neutral-300 px-2 text-xs"
            value={value.windowStart}
            onChange={(e) => onChange({ windowStart: Number(e.target.value) })}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}:00
              </option>
            ))}
          </select>
          <span className="text-xs text-neutral-500">—</span>
          <select
            className="h-8 rounded border border-neutral-300 px-2 text-xs"
            value={value.windowEnd}
            onChange={(e) => onChange({ windowEnd: Number(e.target.value) })}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </div>
        {conflict && (
          <div className="text-xs text-red-600 mt-1">
            Janela sobreposta. Ajuste horários/ordem.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="text-red-600 hover:underline text-xs"
      >
        Remover
      </button>
    </div>
  );
}
