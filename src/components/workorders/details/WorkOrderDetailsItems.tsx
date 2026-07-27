"use client";

import { Package } from "lucide-react";

import type {
  WorkOrderListItem,
} from "@/app/(private)/workorders/actions";

import {
  formatWorkOrderMoney,
} from "../work-order-table.helpers";

import type {
  ParsedWorkOrderItem,
} from "./work-order-details.helpers";

export default function WorkOrderDetailsItems({
  items,
  order,
}: {
  items: ParsedWorkOrderItem[];
  order: WorkOrderListItem;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
          <Package className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">
            Itens e valores
          </h3>

          <p className="mt-0.5 text-xs text-slate-400">
            {items.length > 0
              ? `${items.length} ${
                  items.length === 1
                    ? "item cadastrado"
                    : "itens cadastrados"
                }`
              : "Nenhum item estruturado retornado"}
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="overflow-hidden">
          <div className="max-h-[210px] overflow-auto">
            <table className="w-full min-w-[650px] table-fixed text-xs">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[34%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
              </colgroup>

              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Tipo
                  </th>

                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Descrição
                  </th>

                  <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Qtd.
                  </th>

                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Unitário
                  </th>

                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Subtotal
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr
                    key={`${item.index}-${item.description}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-3 py-2.5 font-medium text-slate-700">
                      {item.type}
                    </td>

                    <td
                      className="truncate px-3 py-2.5 text-slate-600"
                      title={item.description}
                    >
                      {item.description}
                    </td>

                    <td className="px-3 py-2.5 text-center text-slate-600">
                      {item.quantity}
                    </td>

                    <td className="px-3 py-2.5 text-right text-slate-600">
                      {item.unitPrice}
                    </td>

                    <td className="px-3 py-2.5 text-right font-semibold text-slate-800">
                      {item.subtotal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Total da OS
              </span>

              <strong className="text-sm font-bold text-sky-700">
                {formatWorkOrderMoney(
                  order.totalAmount,
                )}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-0">
          <div className="px-4 py-4 text-xs leading-5 text-slate-500">
            A API não retornou os itens individualizados desta ordem.
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Total da OS
              </span>

              <strong className="text-sm font-bold text-sky-700">
                {formatWorkOrderMoney(
                  order.totalAmount,
                )}
              </strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}