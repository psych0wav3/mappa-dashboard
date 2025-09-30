"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";

export default function IconDatePicker({
  value,
  onChange,
  className = "",
  title = "Escolher data",
}: {
  value: string;                   // yyyy-mm-dd
  onChange: (v: string) => void;   // recebe yyyy-mm-dd
  className?: string;
  title?: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);

  return (
    <div className={"relative " + className}>
      {/* input nativo: fica visualmente escondido, mas é focável via botão */}
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only" /* acessível, mas fora de vista */
        aria-label="Selecionar data"
      />
      <button
        type="button"
        onClick={() => ref.current?.showPicker?.() ?? ref.current?.click()}
        className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50"
        title={title}
        aria-label={title}
      >
        <CalendarDays className="h-5 w-5" />
      </button>
    </div>
  );
}
