"use client";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal } from "lucide-react";

export type StopItem = {
  id: string;
  name: string;
  address: string;
  durationMin: number;
  lat: number;
  lng: number;
  eta?: string;
  etd?: string;
};

function Row({ item }: { item: StopItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="border rounded p-2 flex items-center justify-between bg-white">
      <div className="text-sm">
        <div className="font-medium">{item.name}</div>
        <div className="text-muted-foreground">{item.address}</div>
        {item.eta && <div className="text-xs mt-1">est {item.eta}–{item.etd}</div>}
      </div>
      <button {...attributes} {...listeners} className="cursor-grab p-1">
        <MoreHorizontal />
      </button>
    </div>
  );
}

type Props = {
  items: StopItem[];
  onReorder: (newItems: StopItem[]) => void;
};

export default function StopList({ items, onReorder }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({active,over})=>{
      if (!over || active.id === over.id) return;
      const oldIdx = items.findIndex(i=>i.id===String(active.id));
      const newIdx = items.findIndex(i=>i.id===String(over.id));
      const arr = arrayMove(items, oldIdx, newIdx).map((it, idx)=>({ ...it })); // order visual
      onReorder(arr);
    }}>
      <SortableContext items={items.map(i=>i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((it)=><Row key={it.id} item={it} />)}
        </div>
      </SortableContext>
    </DndContext>
  );
}
