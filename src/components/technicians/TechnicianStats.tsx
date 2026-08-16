import {
  UserCheck,
  UsersRound,
  UserX,
} from "lucide-react";

import type {
  TechnicianCounts,
} from "./technician.types";

type TechnicianStatsProps = {
  counts: TechnicianCounts;
};

export default function TechnicianStats({
  counts,
}: TechnicianStatsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total de técnicos
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-950">
              {counts.total}
            </p>
          </div>

          <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-sky-700">
            <UsersRound className="h-5 w-5" />
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Técnicos ativos
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {counts.active}
            </p>
          </div>

          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Técnicos inativos
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-800">
              {counts.inactive}
            </p>
          </div>

          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-amber-700 shadow-sm">
            <UserX className="h-5 w-5" />
          </div>
        </div>
      </article>
    </section>
  );
}