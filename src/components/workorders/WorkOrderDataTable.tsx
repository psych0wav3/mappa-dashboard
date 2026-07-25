"use client";

import * as React from "react";

import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Search,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import type {
  WorkOrderListItem,
} from "@/app/(private)/workorders/actions";

import {
  formatWorkOrderDate,
  formatWorkOrderMoney,
  workOrderStatusClassName,
  workOrderStatusDotClassName,
  workOrderStatusLabel,
} from "./work-order-table.helpers";

const PAGE_SIZE_OPTIONS = [
  10,
  20,
  50,
] as const;

type WorkOrderDataTableProps = {
  title: string;
  description: string;
  orders?: WorkOrderListItem[];
  search: string;

  onSearchChange: (
    value: string,
  ) => void;

  searchPlaceholder?: string;
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
      (_, index) =>
        index + 1,
    );
  }

  if (currentPage <= 3) {
    return [
      1,
      2,
      3,
      4,
      5,
    ];
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

  const totalPages =
    Math.max(
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

  function changePage(
    nextPage: number,
  ) {
    const safePage =
      Math.min(
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
      <header className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <ClipboardList className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {title}
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {description}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
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
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    OS / Serviço
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Cliente
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Data
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Valor
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="w-40 px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {actionHeader}
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.map(
                  (order) => (
                    <React.Fragment
                      key={order.id}
                    >
                      <tr className="border-b border-slate-100 transition hover:bg-sky-50/40">
                        <td className="max-w-72 px-5 py-3.5">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {order.title}
                          </div>

                          {order.description && (
                            <div className="mt-0.5 truncate text-xs text-slate-400">
                              {
                                order.description
                              }
                            </div>
                          )}
                        </td>

                        <td className="max-w-64 px-4 py-3.5">
                          <div className="truncate text-sm text-slate-700">
                            {
                              order.customerName
                            }
                          </div>

                          {order.address && (
                            <div className="mt-0.5 truncate text-xs text-slate-400">
                              {
                                order.address
                              }
                            </div>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600">
                          {formatWorkOrderDate(
                            order.scheduledDate,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600">
                          {formatWorkOrderMoney(
                            order.totalAmount,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span
                            className={[
                              "inline-flex h-7 items-center gap-2 rounded-full border px-3 text-xs font-semibold",
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
                              ].join(
                                " ",
                              )}
                            />

                            {workOrderStatusLabel(
                              order.status,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          {renderAction ? (
                            renderAction(
                              order,
                            )
                          ) : (
                            <span className="text-xs text-slate-400">
                              —
                            </span>
                          )}
                        </td>
                      </tr>

                      {expandedOrderId ===
                        order.id &&
                        renderExpandedRow && (
                          <tr>
                            <td
                              colSpan={6}
                              className="p-0"
                            >
                              {renderExpandedRow(
                                order,
                              )}
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {paginatedOrders.map(
              (order) => (
                <article
                  key={order.id}
                  className="space-y-3 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {order.title}
                      </h3>

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
                        ].join(
                          " ",
                        )}
                      />

                      {workOrderStatusLabel(
                        order.status,
                      )}
                    </span>
                  </div>

                  {order.address && (
                    <p className="line-clamp-2 text-xs leading-5 text-slate-400">
                      {order.address}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400">
                        Data
                      </div>

                      <div className="mt-1 font-medium text-slate-700">
                        {formatWorkOrderDate(
                          order.scheduledDate,
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400">
                        Valor
                      </div>

                      <div className="mt-1 font-medium text-slate-700">
                        {formatWorkOrderMoney(
                          order.totalAmount,
                        )}
                      </div>
                    </div>
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
              ),
            )}
          </div>

          <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-500">
                Mostrando{" "}

                <strong className="font-semibold text-slate-700">
                  {
                    firstVisibleItem
                  }
                </strong>

                {" "}a{" "}

                <strong className="font-semibold text-slate-700">
                  {
                    lastVisibleItem
                  }
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
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500"
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
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
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
                    className={[
                      "grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-semibold",
                      pageNumber ===
                      currentPage
                        ? "bg-sky-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600",
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
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
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