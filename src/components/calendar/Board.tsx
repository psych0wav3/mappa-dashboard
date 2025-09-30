// components/calendar/Board.tsx
"use client";
import * as React from "react";
import TechColumn from "./TechColumn";
import type { Instance as CardInstance } from "./VisitCard";

type Tech = { id: string; firstName: string; lastName: string };

type DragHandlers = {
  onDragStart: (e: React.DragEvent, inst: CardInstance) => void;
  onDropOnColumn: (e: React.DragEvent, techId: string) => void;
  onDropOnCard: (e: React.DragEvent, techId: string, beforeId: string) => void;
  allowDrop: (e: React.DragEvent) => void;
};

export default function Board({
  date, // reservado para usos futuros (exibir no header da coluna, etc.)
  techs,
  instances,
  onFixOrder,
  onDragHandlers,
}: {
  date: string;
  techs: Tech[];
  instances: (CardInstance & { technician: Tech })[];
  onFixOrder: (techId: string) => void;
  onDragHandlers: DragHandlers;
}) {
  // agrupar por técnico
  const map = React.useMemo(() => {
    const m: Record<string, (CardInstance & { technician: Tech })[]> = {};
    for (const t of techs) m[t.id] = [];
    for (const i of instances) {
      const tid = i.technician.id;
      (m[tid] ||= []).push(i);
    }
    for (const tid of Object.keys(m)) m[tid].sort((a, b) => a.order - b.order);
    return m;
  }, [techs, instances]);

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techs.map((t) => (
            <TechColumn
              key={t.id}
              tech={t}
              items={(map[t.id] || []) as CardInstance[]}
              // nome correto no TechColumn é onNormalize:
              onNormalize={() => onFixOrder(t.id)}
              // adapta os nomes dos handlers:
              onDropColumn={(e) => onDragHandlers.onDropOnColumn(e, t.id)}
              onDragStartCard={onDragHandlers.onDragStart}
              onDropBeforeCard={(e, beforeId) =>
                onDragHandlers.onDropOnCard(e, t.id, beforeId)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
