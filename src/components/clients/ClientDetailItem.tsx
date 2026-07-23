"use client";

import * as React from "react";

type ClientDetailItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
};

export default function ClientDetailItem({
  icon,
  label,
  value,
  valueClassName,
}: ClientDetailItemProps) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-sky-700 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-slate-400">
            {label}
          </p>

          <p
            className={[
              "mt-1 break-words text-sm font-semibold leading-5 text-slate-800",
              valueClassName || "",
            ].join(" ")}
            title={value}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}