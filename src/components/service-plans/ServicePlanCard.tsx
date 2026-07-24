"use client";

import type { ReactNode } from "react";

import {
  BadgeDollarSign,
  CalendarDays,
  Clock3,
  Info,
  PauseCircle,
  PlayCircle,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import type { ServicePlan } from "@/app/(private)/service-plans/actions";

import {
  footerClassName,
  footerMessage,
  formatCurrencyBRL,
  formatDateLabel,
  recurrenceLabel,
  rightStatusClassName,
  rightStatusLabel,
} from "@/app/(private)/service-plans/service-plans.helpers";

type ServicePlanCardProps = {
  plan: ServicePlan;
  customerName: string;
  pending?: boolean;
  onStatusChange?: (
    plan: ServicePlan,
    status: "ACTIVE" | "PAUSED",
  ) => void;
};

type InfoBlockProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function InfoBlock({
  icon,
  label,
  value,
}: InfoBlockProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        <span className="text-sky-600">
          {icon}
        </span>

        {label}
      </div>

      <div className="text-sm font-semibold leading-6 text-slate-800">
        {value}
      </div>
    </div>
  );
}

export function ServicePlanCard({
  plan,
  customerName,
  pending = false,
  onStatusChange,
}: ServicePlanCardProps) {
  const canPause =
    plan.status === "ACTIVE";

  const canActivate =
    plan.status === "PAUSED";

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <h3 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              {plan.title}
            </h3>

            {plan.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                {plan.description}
              </p>
            ) : (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Sem descrição informada.
              </p>
            )}
          </div>

          <div
            className={[
              "inline-flex min-h-10 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold",
              rightStatusClassName(
                plan.status,
              ),
            ].join(" ")}
          >
            {rightStatusLabel(
              plan.status,
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <InfoBlock
            icon={
              <UserRound className="h-3.5 w-3.5" />
            }
            label="Cliente"
            value={customerName}
          />

          <InfoBlock
            icon={
              <Clock3 className="h-3.5 w-3.5" />
            }
            label="Recorrência"
            value={recurrenceLabel(
              plan,
            )}
          />

          <InfoBlock
            icon={
              <CalendarDays className="h-3.5 w-3.5" />
            }
            label="Início da rotina"
            value={formatDateLabel(
              plan.startDate,
            )}
          />

          <InfoBlock
            icon={
              <BadgeDollarSign className="h-3.5 w-3.5" />
            }
            label="Valor da rotina"
            value={formatCurrencyBRL(
              plan.totalAmount,
            )}
          />
        </div>

        {(canPause ||
          canActivate) && (
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            {canPause && (
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl px-4"
                disabled={pending}
                onClick={() =>
                  onStatusChange?.(
                    plan,
                    "PAUSED",
                  )
                }
              >
                <PauseCircle className="mr-2 h-4 w-4" />

                Pausar rotina
              </Button>
            )}

            {canActivate && (
              <Button
                type="button"
                className="btn-brand h-10 rounded-xl px-4 text-white"
                disabled={pending}
                onClick={() =>
                  onStatusChange?.(
                    plan,
                    "ACTIVE",
                  )
                }
              >
                <PlayCircle className="mr-2 h-4 w-4" />

                Reativar rotina
              </Button>
            )}
          </div>
        )}
      </div>

      <div
        className={[
          "flex items-start gap-2 px-5 py-4 text-sm sm:px-6",
          footerClassName(
            plan.status,
          ),
        ].join(" ")}
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0" />

        <p className="leading-6">
          {footerMessage(
            plan.status,
          )}
        </p>
      </div>
    </article>
  );
}

export default ServicePlanCard;