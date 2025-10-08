// app/components/SortableRow.tsx
"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const HOURS = Array.from({ length: 14 }, (_, i) => 6 + i); // 6..19

export type SelectedItem = {
  id: string;
  label: string;
  windowStart: number;
  windowEnd: number;
  order: number;
};

type AddressParts = {
  street: string;
  number?: string | number;
  neighborhood?: string; // bairro
  city?: string;
  state?: string; // UF
};

export default function SortableRow({
  id,
  label,
  value,
  conflict,
  onChange,
  onRemove,
  address,
  addressParts,
}: {
  id: string;
  label: string;
  value: SelectedItem;
  conflict?: boolean;
  onChange: (patch: Partial<SelectedItem>) => void;
  onRemove: () => void;
  address?: string; // legado
  addressParts?: AddressParts; // preferido
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  // 1ª linha: rua, número, bairro
  const line1 = addressParts
    ? [
        addressParts.street,
        addressParts.number ? String(addressParts.number) : undefined,
        addressParts.neighborhood,
      ]
        .filter(Boolean)
        .join(", ")
    : undefined;

  // 2ª linha: cidade / UF  (ajustado para " / ")
  const line2 = addressParts
    ? [addressParts.city, addressParts.state].filter(Boolean).join(" / ")
    : undefined;

  const fullAddress = addressParts ? [line1, line2].filter(Boolean).join(" | ") : address;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-md border px-3 py-2 flex items-center gap-3 bg-white ${
        isDragging ? "opacity-80" : ""
      } ${conflict ? "border-red-400" : ""}`}
      title={conflict ? "Janela sobreposta com outra visita" : ""}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab select-none text-neutral-400"
        title="Arrastar"
        aria-label="Arrastar"
      >
        ⋮⋮
      </button>

      {/* Ordem */}
      <div
        className="w-7 h-7 rounded bg-green-600 text-white grid place-items-center text-sm font-semibold shrink-0"
        aria-label={`Ordem ${String(value.order ?? 1)}`}
      >
        {String(value.order ?? 1)}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{label}</div>

        {/* Endereço (duas linhas quando addressParts for passado) */}
        {addressParts ? (
          <>
            <div
              className="text-xs text-neutral-700 mt-0.5 truncate"
              title={fullAddress}
            >
              {line1}
            </div>
            <div
              className="text-xs text-neutral-500 truncate"
              title={fullAddress}
            >
              {line2}
            </div>
          </>
        ) : (
          address && (
            <div className="text-xs text-neutral-500 mt-0.5 truncate" title={address}>
              {address}
            </div>
          )
        )}

        {/* Janelas de horário */}
        <div className="flex items-center gap-2 mt-2">
          <select
            className="h-8 rounded border border-neutral-300 px-2 text-xs"
            value={value.windowStart}
            onChange={(e) => onChange({ windowStart: Number(e.target.value) })}
            aria-label="Hora inicial"
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
            aria-label="Hora final"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "00")}:00
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

      {/* Botão remover com confirmação */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            className="w-8 h-8 p-0 grid place-items-center rounded-md bg-red-600 hover:bg-red-700 text-white"
            title="Remover visita"
            aria-label="Remover visita"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover esta visita da rota? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onRemove}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}