"use client";

import * as React from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableRow, { type SelectedItem } from "./SortableRow";

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

type AddressParts = {
  street: string;
  number?: string | number;
  neighborhood?: string; // bairro
  city?: string;
  state?: string; // UF
};

export default function RouteListCard({
  items,
  onDragEnd,
  hasConflict,
  stats,
  onChangeItem,
  onRemoveItem,
  getAddress,
  getAddressParts,
}: {
  items: SelectedItem[];
  onDragEnd: (e: DragEndEvent) => void;
  hasConflict: (id: string) => boolean;
  stats: { minutos: number; km: number };
  onChangeItem: (id: string, patch: Partial<SelectedItem>) => void;
  onRemoveItem: (id: string) => void;
  getAddress: (id: string) => string | undefined;
  getAddressParts?: (id: string) => AddressParts | undefined;
}) {
  return (
    <div className="rounded-md border bg-white">
      <div className="px-3 py-2 text-sm text-neutral-700 border-b">
        <span className="font-semibold">{items.length} piscinas</span>
        <span className="mx-2">•</span>
        <span>{formatDuration(stats.minutos)}</span>
        <span className="mx-2">•</span>
        <span>{stats.km.toFixed(1)} km</span>
      </div>

      <div className="p-3 max-h-[520px] overflow-auto space-y-2">
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {items.length === 0 && (
              <div className="text-sm text-neutral-500">Escolha um técnico e um dia.</div>
            )}

            {items.map((s) => {
              const parts = getAddressParts?.(s.id);
              const legacy = getAddress(s.id);
              return (
                <SortableRow
                  key={s.id}
                  id={s.id}
                  label={s.label}
                  value={s}
                  conflict={hasConflict(s.id)}
                  onChange={(patch) => onChangeItem(s.id, patch)}
                  onRemove={() => onRemoveItem(s.id)}
                  addressParts={parts}
                  address={!parts ? legacy : undefined}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
