"use client";

import * as React from "react";

import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  CirclePlay,
  Plus,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type {
  ServicePlan,
} from "@/app/(private)/service-plans/actions";

import {
  formatDateLabel,
  recurrenceLabel,
  rightStatusClassName,
  rightStatusLabel,
} from "@/app/(private)/service-plans/service-plans.helpers";

type ServicePlanListProps = {
  plans: ServicePlan[];
  filteredPlans: ServicePlan[];
  searchQuery: string;
  pending?: boolean;

  getCustomerName: (
    plan: ServicePlan,
  ) => string;

  onSearchChange: (
    value: string,
  ) => void;

  onClearSearch: () => void;
  onCreateFirst: () => void;

  onStatusChange: (
    plan: ServicePlan,
    status: "ACTIVE" | "PAUSED",
  ) => void;

  onGenerateOrders?: (
    plan: ServicePlan,
  ) => void;
};

const PAGE_SIZE_OPTIONS = [
  10,
  20,
  50,
] as const;

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

function getStatusDotClassName(
  status: string,
) {
  switch (status) {
    case "PENDING_APPROVAL":
      return "bg-blue-500";

    case "ACTIVE":
      return "bg-emerald-500";

    case "PAUSED":
      return "bg-amber-500";

    case "CANCELED":
    case "FINISHED":
      return "bg-slate-400";

    default:
      return "bg-slate-300";
  }
}

export default function ServicePlanList({
  plans,
  filteredPlans,
  searchQuery,
  pending = false,
  getCustomerName,
  onSearchChange,
  onClearSearch,
  onCreateFirst,
  onStatusChange,
  onGenerateOrders,
}: ServicePlanListProps) {
  const [
    currentPage,
    setCurrentPage,
  ] = React.useState(1);

  const [
    pageSize,
    setPageSize,
  ] = React.useState<number>(10);

  const totalItems =
    filteredPlans.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / pageSize,
    ),
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    pageSize,
  ]);

  React.useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedPlans =
    React.useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        pageSize;

      return filteredPlans.slice(
        startIndex,
        startIndex + pageSize,
      );
    }, [
      currentPage,
      filteredPlans,
      pageSize,
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

  const hasPlans =
    plans.length > 0;

  const hasFilteredPlans =
    filteredPlans.length > 0;

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

    setCurrentPage(safePage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function renderAction(
    plan: ServicePlan,
  ) {
    if (
      plan.status === "ACTIVE"
    ) {
      return (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() =>
              onGenerateOrders?.(
                plan,
              )
            }
            className="h-8 rounded-lg px-3 text-xs"
          >
            Gerar visitas
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() =>
              onStatusChange(
                plan,
                "PAUSED",
              )
            }
            className="h-8 rounded-lg px-3 text-xs"
          >
            <CirclePause className="mr-1.5 h-3.5 w-3.5" />

            Pausar
          </Button>
        </div>
      );
    }

    if (
      plan.status === "PAUSED"
    ) {
      return (
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() =>
            onStatusChange(
              plan,
              "ACTIVE",
            )
          }
          className="btn-brand h-8 rounded-lg px-3 text-xs text-white"
        >
          <CirclePlay className="mr-1.5 h-3.5 w-3.5" />

          Reativar
        </Button>
      );
    }

    return (
      <span className="text-xs text-slate-400">
        —
      </span>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <CalendarClock className="h-4.5 w-4.5" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Rotinas cadastradas
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Consulte e gerencie os
                atendimentos recorrentes.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative w-full sm:min-w-80 lg:w-96">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={searchQuery}
                onChange={(event) =>
                  onSearchChange(
                    event.target.value,
                  )
                }
                placeholder="Buscar cliente ou rotina..."
                className="h-10 rounded-xl pl-10 pr-10"
              />

              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={
                    onClearSearch
                  }
                  aria-label="Limpar busca"
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {!hasPlans ? (
        <div className="px-5 py-12 text-center sm:px-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <CalendarClock className="h-5 w-5" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nenhuma rotina cadastrada
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            Crie a primeira rotina de
            atendimento e envie para
            aprovação do cliente.
          </p>

          <Button
            type="button"
            onClick={onCreateFirst}
            className="btn-brand mt-5 h-10 rounded-xl px-4 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />

            Criar primeira rotina
          </Button>
        </div>
      ) : !hasFilteredPlans ? (
        <div className="px-5 py-12 text-center sm:px-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Search className="h-5 w-5" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Nenhuma rotina encontrada
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            Não encontramos resultados
            para a pesquisa informada.
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={onClearSearch}
            className="mt-5 h-10 rounded-xl px-4"
          >
            Limpar pesquisa
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Rotina
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Cliente
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Recorrência
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Início
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="w-28 px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedPlans.map(
                  (
                    plan,
                    index,
                  ) => (
                    <tr
                      key={plan.id}
                      className={[
                        "transition hover:bg-sky-50/40",
                        index !==
                        paginatedPlans.length -
                          1
                          ? "border-b border-slate-100"
                          : "",
                      ].join(" ")}
                    >
                      <td className="max-w-64 px-5 py-3.5">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {plan.title}
                        </div>

                        {plan.description && (
                          <div className="mt-0.5 truncate text-xs text-slate-400">
                            {
                              plan.description
                            }
                          </div>
                        )}
                      </td>

                      <td className="max-w-56 px-4 py-3.5">
                        <div className="truncate text-sm text-slate-700">
                          {getCustomerName(
                            plan,
                          )}
                        </div>
                      </td>

                      <td className="max-w-48 px-4 py-3.5">
                        <div className="truncate text-sm text-slate-600">
                          {recurrenceLabel(
                            plan,
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600">
                        {formatDateLabel(
                          plan.startDate,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={[
                            "inline-flex h-7 items-center gap-2 rounded-full px-3 text-xs font-semibold",
                            rightStatusClassName(
                              plan.status,
                            ),
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              getStatusDotClassName(
                                plan.status,
                              ),
                            ].join(
                              " ",
                            )}
                          />

                          {rightStatusLabel(
                            plan.status,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {renderAction(
                          plan,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {paginatedPlans.map(
              (plan) => (
                <article
                  key={plan.id}
                  className="space-y-3 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {plan.title}
                      </h3>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {getCustomerName(
                          plan,
                        )}
                      </p>
                    </div>

                    <span
                      className={[
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        rightStatusClassName(
                          plan.status,
                        ),
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "h-1.5 w-1.5 rounded-full",
                          getStatusDotClassName(
                            plan.status,
                          ),
                        ].join(" ")}
                      />

                      {rightStatusLabel(
                        plan.status,
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400">
                        Recorrência
                      </div>

                      <div className="mt-1 font-medium text-slate-700">
                        {recurrenceLabel(
                          plan,
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400">
                        Início
                      </div>

                      <div className="mt-1 font-medium text-slate-700">
                        {formatDateLabel(
                          plan.startDate,
                        )}
                      </div>
                    </div>
                  </div>

                  {(
                    plan.status ===
                      "ACTIVE" ||
                    plan.status ===
                      "PAUSED"
                  ) && (
                    <div className="flex justify-end">
                      {renderAction(
                        plan,
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
                  {firstVisibleItem}
                </strong>{" "}
                a{" "}
                <strong className="font-semibold text-slate-700">
                  {lastVisibleItem}
                </strong>{" "}
                de{" "}
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
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  changePage(
                    currentPage - 1,
                  )
                }
                className="h-8 rounded-lg px-2"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
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
                          ? "bg-sky-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100",
                      ].join(" ")}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  changePage(
                    currentPage + 1,
                  )
                }
                className="h-8 rounded-lg px-2"
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </footer>
        </>
      )}
    </section>
  );
}