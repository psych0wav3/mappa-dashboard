"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import VisitCard, { Instance as CardInstance } from "./VisitCard";

type Tech = { id: string; firstName: string; lastName: string };

type Props = {
  tech: Tech;
  items: CardInstance[];
  onNormalize: () => void;
  onDropColumn: (e: React.DragEvent<Element>) => void;
  onDragStartCard: (e: React.DragEvent<Element>, inst: CardInstance) => void;
  onDropBeforeCard: (e: React.DragEvent<Element>, beforeId: string) => void;
};

function initials(t: Tech) {
  const a = (t.firstName?.[0] || "").toUpperCase();
  const b = (t.lastName?.[0] || "").toUpperCase();
  return (a + b) || "T";
}

export default function TechColumn({
  tech,
  items,
  onNormalize,
  onDropColumn,
  onDragStartCard,
  onDropBeforeCard,
}: Props) {
  const count = items.length;

  return (
    <div className="rounded-xl border overflow-hidden bg-white">
      {/* Cabeçalho colorido */}
      <div className="bg-blue-50/80 border-b px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar simples com iniciais */}
          <div className="h-9 w-9 rounded-full bg-blue-600 text-white grid place-items-center font-semibold">
            {initials(tech)}
          </div>

          <div>
            <div className="font-semibold text-neutral-900 leading-tight">
              Técnico: {tech.firstName} {tech.lastName}
            </div>
            {/* Badge de quantidade */}
            <div className="mt-1 inline-flex items-center rounded-full bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5">
              {count} {count === 1 ? "piscina" : "piscinas"}
            </div>
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={onNormalize}>
          Fixar
        </Button>
      </div>

      {/* Área de cartões / DnD */}
      <div
        className="p-3 min-h-[200px] space-y-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDropColumn}
      >
        {items.map((inst) => (
          <div
            key={inst.id}
            draggable
            onDragStart={(e) => onDragStartCard(e, inst)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDropBeforeCard(e, inst.id)}
          >
            <VisitCard data={inst} />
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center text-sm text-neutral-400 py-10">
            Nenhuma operação
            <div className="text-xs text-neutral-400">
              Arraste visitas para cá
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
