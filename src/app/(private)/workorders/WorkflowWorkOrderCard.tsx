"use client";

import * as React from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react";

import type { WorkOrderListItem } from "./actions";

export function formatWorkOrderDate(
  value?: string | null,
) {
  if (!value) return "Data não informada";

  const [datePart] = value.split("T");
  const [year, month, day] =
    datePart.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function formatWorkOrderMoney(
  value?: number | null,
) {
  return Number(value || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );
}

export function getDescriptionPreview(
  value?: string | null,
) {
  const lines = String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (line) => !line.startsWith("-----"),
    );

  return lines[0] || "Sem descrição informada.";
}

export default function WorkflowWorkOrderCard({
  order,
  badge,
  badgeClassName,
  footer,
  action,
  showApprovalDate = false,
}: {
  order: WorkOrderListItem;
  badge: string;
  badgeClassName: string;
  footer?: React.ReactNode;
  action?: React.ReactNode;
  showApprovalDate?: boolean;
}) {
  const hasAddress = Boolean(
    order.customerAddressId,
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              {order.title}
            </h3>

            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClassName}`}
            >
              {badge}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
            {getDescriptionPreview(
              order.description,
            )}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoBox
              icon={UserRound}
              label="Cliente"
              value={order.customerName}
            />

            <InfoBox
              icon={CalendarDays}
              label="Data prevista"
              value={formatWorkOrderDate(
                order.scheduledDate,
              )}
            />

            <InfoBox
              icon={MapPin}
              label="Endereço"
              value={
                hasAddress
                  ? order.address ||
                    "Endereço vinculado ao cliente"
                  : "Endereço pendente"
              }
              warning={!hasAddress}
            />

            {showApprovalDate ? (
              <InfoBox
                icon={CheckCircle2}
                label="Aprovação do cliente"
                value={
                  order.customerApprovedAt
                    ? formatWorkOrderDate(
                        order.customerApprovedAt,
                      )
                    : "Aprovação registrada"
                }
              />
            ) : (
              <InfoBox
                icon={Clock3}
                label="Solicitada em"
                value={formatWorkOrderDate(
                  order.createdAt,
                )}
              />
            )}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[230px]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Valor total
            </div>

            <div className="mt-1 text-lg font-bold text-slate-900">
              {order.totalAmount > 0
                ? formatWorkOrderMoney(
                    order.totalAmount,
                  )
                : "Ainda não definido"}
            </div>
          </div>

          {action}
        </div>
      </div>

      {footer}
    </article>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
  warning = false,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-start gap-2 rounded-xl px-3 py-3 ${
        warning
          ? "bg-amber-50"
          : "bg-slate-50"
      }`}
    >
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${
          warning
            ? "text-amber-600"
            : "text-sky-600"
        }`}
      />

      <div className="min-w-0">
        <div
          className={`text-[10px] font-semibold uppercase tracking-wide ${
            warning
              ? "text-amber-600"
              : "text-slate-400"
          }`}
        >
          {label}
        </div>

        <div
          className={`mt-1 truncate text-sm font-medium ${
            warning
              ? "text-amber-800"
              : "text-slate-700"
          }`}
          title={value}
        >
          {value}
        </div>
      </div>
    </div>
  );
}