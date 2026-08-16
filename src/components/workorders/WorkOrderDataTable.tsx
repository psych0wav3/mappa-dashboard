"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Search,
  X,
} from "lucide-react";

import type {
  WorkOrderListItem,
} from "@/app/(private)/workorders/actions";

import { Input } from "@/components/ui/input";

import {
  formatWorkOrderDate,
  workOrderStatusClassName,
  workOrderStatusDotClassName,
  workOrderStatusLabelForOrder,
  workOrderTypeLabel,
} from "./work-order-table.helpers";

const PAGE_SIZE_OPTIONS = [
  10,
  20,
  50,
] as const;

type WorkOrderDataTableProps = {
  title?: string;
  description?: string;

  orders?: WorkOrderListItem[];

  search: string;

  onSearchChange: (
    value: string,
  ) => void;

  searchPlaceholder?: string;
  resultLabel?: string;

  emptyTitle: string;
  emptyDescription: string;

  actionHeader?: string;

  renderAction?: (
    order: WorkOrderListItem,
  ) => React.ReactNode;

  expandedOrderId?: string | null;

  renderExpandedRow?: (
    order: WorkOrderListItem,
  ) => React.ReactNode;

  headerAction?: React.ReactNode;
};

function getPageNumbers(
  currentPage: number,
  totalPages: number,
) {
  if (totalPages <= 5) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (
    currentPage >=
    totalPages - 2
  ) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
}

export default function WorkOrderDataTable({
  title,
  description,
  orders = [],
  search,
  onSearchChange,
  searchPlaceholder =
    "Buscar cliente ou serviço...",
  resultLabel,
  emptyTitle,
  emptyDescription,
  actionHeader = "Ações",
  renderAction,
  expandedOrderId = null,
  renderExpandedRow,
  headerAction,
}: WorkOrderDataTableProps) {
  const safeOrders =
    Array.isArray(orders)
      ? orders
      : [];

  const [
    currentPage,
    setCurrentPage,
  ] = React.useState(1);

  const [
    pageSize,
    setPageSize,
  ] = React.useState(10);

  const totalItems =
    safeOrders.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / pageSize,
    ),
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    pageSize,
  ]);

  React.useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages,
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedOrders =
    React.useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        pageSize;

      return safeOrders.slice(
        startIndex,
        startIndex + pageSize,
      );
    }, [
      currentPage,
      pageSize,
      safeOrders,
    ]);

  const firstVisibleItem =
    totalItems === 0
      ? 0
      : (currentPage - 1) *
          pageSize +
        1;

  const lastVisibleItem =
    Math.min(
      currentPage * pageSize,
      totalItems,
    );

  const pageNumbers =
    getPageNumbers(
      currentPage,
      totalPages,
    );

  const hasActions =
    Boolean(renderAction);

  const tableColumnCount =
    hasActions ? 6 : 5;

  function changePage(
    nextPage: number,
  ) {
    const safePage = Math.min(
      Math.max(
        nextPage,
        1,
      ),
      totalPages,
    );

    setCurrentPage(
      safePage,
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-sm font-semibold text-slate-800">
                {title}
              </h2>
            ) : (
              <p className="text-sm font-semibold text-slate-800">
                {resultLabel ||
                  `${totalItems} ${
                    totalItems === 1
                      ? "ordem encontrada"
                      : "ordens encontradas"
                  }`}
              </p>
            )}

            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              {description ||
                resultLabel ||
                "Ordens organizadas pela data mais próxima do atendimento."}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:min-w-80 lg:w-96">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={search}
                onChange={(event) =>
                  onSearchChange(
                    event.target.value,
                  )
                }
                placeholder={
                  searchPlaceholder
                }
                className="h-10 rounded-xl pl-10 pr-10"
              />

              {search.trim() && (
                <button
                  type="button"
                  onClick={() =>
                    onSearchChange("")
                  }
                  aria-label="Limpar pesquisa"
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {headerAction}
          </div>
        </div>
      </header>

      {safeOrders.length === 0 ? (
        <div className="px-5 py-12 text-center sm:px-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <ClipboardList className="h-5 w-5" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-800">
            {emptyTitle}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
            {emptyDescription}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[920px] table-fixed border-collapse">
              <colgroup>
                <col className="w-[13%]" />
                <col className="w-[24%]" />
                <col className="w-[16%]" />
                <col className="w-[24%]" />

                <col
                  className={
                    hasActions
                      ? "w-[15%]"
                      : "w-[23%]"
                  }
                />

                {hasActions && (
                  <col className="w-[8%]" />
                )}
              </colgroup>

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Data
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    OS / Serviço
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Tipo de OS
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Cliente
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  {hasActions && (
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {actionHeader}
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.map(
                  (order) => {
                    const orderType =
                      workOrderTypeLabel(
                        order,
                      );

                    return (
                      <React.Fragment
                        key={order.id}
                      >
                        <tr className="border-b border-slate-100 transition hover:bg-sky-50/40">
                          <td className="whitespace-nowrap px-5 py-3.5 text-sm font-medium text-slate-700">
                            {formatWorkOrderDate(
                              order.scheduledDate,
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <div
                              className="truncate text-sm font-semibold text-slate-900"
                              title={order.title}
                            >
                              {order.title}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div
                              className="truncate text-sm text-slate-600"
                              title={orderType}
                            >
                              {orderType}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div
                              className="truncate text-sm text-slate-700"
                              title={
                                order.customerName
                              }
                            >
                              {
                                order.customerName
                              }
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={[
                                "inline-flex min-h-7 max-w-full items-center gap-2 rounded-full border px-3 text-xs font-semibold",

                                workOrderStatusClassName(
                                  order.status,
                                ),
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "h-1.5 w-1.5 shrink-0 rounded-full",

                                  workOrderStatusDotClassName(
                                    order.status,
                                  ),
                                ].join(" ")}
                              />

                              <span className="truncate">
                                {workOrderStatusLabelForOrder(
                                  order,
                                )}
                              </span>
                            </span>
                          </td>

                          {hasActions && (
                            <td className="px-5 py-3.5 text-right">
                              {renderAction?.(
                                order,
                              )}
                            </td>
                          )}
                        </tr>

                        {expandedOrderId ===
                          order.id &&
                          renderExpandedRow && (
                            <tr>
                              <td
                                colSpan={
                                  tableColumnCount
                                }
                                className="p-0"
                              >
                                {renderExpandedRow(
                                  order,
                                )}
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {paginatedOrders.map(
              (order) => {
                const orderType =
                  workOrderTypeLabel(
                    order,
                  );

                return (
                  <article
                    key={order.id}
                    className="space-y-3 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-sky-700">
                          {formatWorkOrderDate(
                            order.scheduledDate,
                          )}
                        </p>

                        <h3 className="mt-1 truncate text-sm font-semibold text-slate-900">
                          {order.title}
                        </h3>

                        <p className="mt-1 truncate text-xs font-medium text-slate-600">
                          {orderType}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {
                            order.customerName
                          }
                        </p>
                      </div>

                      <span
                        className={[
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",

                          workOrderStatusClassName(
                            order.status,
                          ),
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "h-1.5 w-1.5 rounded-full",

                            workOrderStatusDotClassName(
                              order.status,
                            ),
                          ].join(" ")}
                        />

                        {workOrderStatusLabelForOrder(
                          order,
                        )}
                      </span>
                    </div>

                    {renderAction && (
                      <div className="flex justify-end">
                        {renderAction(
                          order,
                        )}
                      </div>
                    )}

                    {expandedOrderId ===
                      order.id &&
                      renderExpandedRow && (
                        <div>
                          {renderExpandedRow(
                            order,
                          )}
                        </div>
                      )}
                  </article>
                );
              },
            )}
          </div>

          <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-500">
                Mostrando{" "}

                <strong className="font-semibold text-slate-700">
                  {firstVisibleItem}
                </strong>

                {" "}a{" "}

                <strong className="font-semibold text-slate-700">
                  {lastVisibleItem}
                </strong>

                {" "}de{" "}

                <strong className="font-semibold text-slate-700">
                  {totalItems}
                </strong>
              </span>

              <label className="flex items-center gap-2 text-xs text-slate-500">
                Por página

                <select
                  value={pageSize}
                  onChange={(event) =>
                    setPageSize(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-sky-500"
                >
                  {PAGE_SIZE_OPTIONS.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  changePage(
                    currentPage - 1,
                  )
                }
                aria-label="Página anterior"
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:text-sky-700 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {pageNumbers.map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() =>
                      changePage(
                        pageNumber,
                      )
                    }
                    aria-current={
                      pageNumber ===
                      currentPage
                        ? "page"
                        : undefined
                    }
                    className={[
                      "grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-semibold transition",

                      pageNumber ===
                      currentPage
                        ? "bg-sky-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-700",
                    ].join(" ")}
                  >
                    {pageNumber}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  changePage(
                    currentPage + 1,
                  )
                }
                aria-label="Próxima página"
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:text-sky-700 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </>
      )}
    </section>
  );
}