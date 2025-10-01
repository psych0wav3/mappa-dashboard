"use client";
import * as React from "react";

type Tech = { id: string; firstName: string; lastName: string };

export default function TechFilter({
  techs, value, onChange, className = "",
}: {
  techs: Tech[]; value: string[]; onChange: (ids: string[]) => void; className?: string;
}) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id]);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {techs.map(t => {
        const checked = value.includes(t.id);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            className={[
              "px-3 py-1.5 rounded-full text-sm border",
              checked ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-neutral-50"
            ].join(" ")}
          >
            {t.firstName} {t.lastName}
          </button>
        );
      })}
    </div>
  );
}
