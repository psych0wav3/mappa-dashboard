"use client";

import * as React from "react";

import {
  Check,
  ChevronsUpDown,
  MapPin,
  Search,
  UserRound,
  X,
} from "lucide-react";

import type {
  WorkOrderCustomerOption,
} from "@/app/(private)/workorders/actions";

import { Input } from "@/components/ui/input";

type CustomerComboboxProps = {
  customers: WorkOrderCustomerOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

const INITIAL_RESULTS_LIMIT = 12;
const SEARCH_RESULTS_LIMIT = 50;

function normalizeSearchText(
  value?: string | null,
) {
  return String(value || "")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function getOptionalCustomerValue(
  customer: WorkOrderCustomerOption,
  keys: string[],
) {
  const record =
    customer as unknown as Record<
      string,
      unknown
    >;

  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "";
}

function getCustomerSearchContent(
  customer: WorkOrderCustomerOption,
) {
  const email =
    getOptionalCustomerValue(
      customer,
      [
        "email",
        "customerEmail",
      ],
    );

  const phone =
    getOptionalCustomerValue(
      customer,
      [
        "phone",
        "telephone",
        "customerPhone",
      ],
    );

  const document =
    getOptionalCustomerValue(
      customer,
      [
        "cpf",
        "cnpj",
        "document",
        "documentNumber",
        "customerDocument",
      ],
    );

  const companyName =
    getOptionalCustomerValue(
      customer,
      [
        "companyName",
        "tradeName",
      ],
    );

  return normalizeSearchText(
    [
      customer.name,
      customer.addressLabel,
      email,
      phone,
      document,
      companyName,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function CustomerCombobox({
  customers,
  value,
  onValueChange,
  disabled = false,
}: CustomerComboboxProps) {
  const containerRef =
    React.useRef<HTMLDivElement | null>(
      null,
    );

  const inputRef =
    React.useRef<HTMLInputElement | null>(
      null,
    );

  const [open, setOpen] =
    React.useState(false);

  const [query, setQuery] =
    React.useState("");

  const [
    highlightedIndex,
    setHighlightedIndex,
  ] = React.useState(0);

  const selectedCustomer =
    React.useMemo(
      () =>
        customers.find(
          (customer) =>
            customer.id === value,
        ) || null,
      [customers, value],
    );

  const filteredCustomers =
    React.useMemo(() => {
      const normalizedQuery =
        normalizeSearchText(query);

      if (!normalizedQuery) {
        return customers.slice(
          0,
          INITIAL_RESULTS_LIMIT,
        );
      }

      return customers
        .filter((customer) =>
          getCustomerSearchContent(
            customer,
          ).includes(
            normalizedQuery,
          ),
        )
        .slice(
          0,
          SEARCH_RESULTS_LIMIT,
        );
    }, [customers, query]);

  const hasMoreCustomers =
    React.useMemo(() => {
      const normalizedQuery =
        normalizeSearchText(query);

      if (!normalizedQuery) {
        return (
          customers.length >
          INITIAL_RESULTS_LIMIT
        );
      }

      const totalMatches =
        customers.filter((customer) =>
          getCustomerSearchContent(
            customer,
          ).includes(
            normalizedQuery,
          ),
        ).length;

      return (
        totalMatches >
        SEARCH_RESULTS_LIMIT
      );
    }, [customers, query]);

  React.useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      const target =
        event.target as Node | null;

      if (
        target &&
        containerRef.current &&
        !containerRef.current.contains(
          target,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setHighlightedIndex(0);
      return;
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [open]);

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  function selectCustomer(
    customer:
      WorkOrderCustomerOption,
  ) {
    if (!customer.hasValidAddress) {
      return;
    }

    onValueChange(customer.id);
    setOpen(false);
    setQuery("");
  }

  function clearSelection(
    event: React.MouseEvent,
  ) {
    event.stopPropagation();

    onValueChange("");
    setQuery("");
    setHighlightedIndex(0);
  }

  function handleInputKeyDown(
    event:
      React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key === "ArrowDown"
    ) {
      event.preventDefault();

      setHighlightedIndex(
        (current) =>
          Math.min(
            current + 1,
            Math.max(
              0,
              filteredCustomers.length -
                1,
            ),
          ),
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setHighlightedIndex(
        (current) =>
          Math.max(
            current - 1,
            0,
          ),
      );

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const customer =
        filteredCustomers[
          highlightedIndex
        ];

      if (
        customer &&
        customer.hasValidAddress
      ) {
        selectCustomer(customer);
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() =>
          setOpen((current) => !current)
        }
        className={[
          "flex min-h-11 w-full items-center",
          "justify-between gap-3 rounded-xl",
          "border border-slate-300 bg-white",
          "px-3 py-2 text-left text-sm",
          "outline-none transition",
          "focus:border-sky-500",
          "focus:ring-2 focus:ring-sky-100",
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-slate-400",
        ].join(" ")}
      >
        <div className="flex min-w-0 items-center gap-2">
          <UserRound className="h-4 w-4 shrink-0 text-slate-400" />

          {selectedCustomer ? (
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-800">
                {selectedCustomer.name}
              </div>

              {selectedCustomer.addressLabel && (
                <div className="mt-0.5 truncate text-xs text-slate-400">
                  {
                    selectedCustomer
                      .addressLabel
                  }
                </div>
              )}
            </div>
          ) : (
            <span className="text-slate-500">
              Pesquisar cliente...
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {selectedCustomer && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Limpar cliente selecionado"
              onClick={clearSelection}
              onKeyDown={(event) => {
                if (
                  event.key ===
                    "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();

                  onValueChange("");
                  setQuery("");
                }
              }}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}

          <ChevronsUpDown className="h-4 w-4 text-slate-400" />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                ref={inputRef}
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value,
                  )
                }
                onKeyDown={
                  handleInputKeyDown
                }
                placeholder="Buscar por nome, endereço, documento..."
                className="h-10 rounded-xl pl-10"
              />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Digite parte do nome,
              endereço, telefone ou
              documento.
            </p>
          </div>

          <div
            role="listbox"
            aria-label="Clientes"
            className="max-h-80 overflow-y-auto p-2"
          >
            {filteredCustomers.length >
            0 ? (
              filteredCustomers.map(
                (
                  customer,
                  index,
                ) => {
                  const selected =
                    customer.id === value;

                  const highlighted =
                    index ===
                    highlightedIndex;

                  return (
                    <button
                      key={customer.id}
                      type="button"
                      role="option"
                      aria-selected={
                        selected
                      }
                      disabled={
                        !customer
                          .hasValidAddress
                      }
                      onMouseEnter={() =>
                        setHighlightedIndex(
                          index,
                        )
                      }
                      onClick={() =>
                        selectCustomer(
                          customer,
                        )
                      }
                      className={[
                        "flex w-full items-start gap-3",
                        "rounded-xl px-3 py-3",
                        "text-left transition",
                        highlighted
                          ? "bg-sky-50"
                          : "hover:bg-slate-50",
                        !customer
                          .hasValidAddress
                          ? "cursor-not-allowed opacity-55"
                          : "cursor-pointer",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "mt-0.5 grid h-9 w-9 shrink-0",
                          "place-items-center rounded-xl",
                          selected
                            ? "bg-sky-100 text-sky-700"
                            : "bg-slate-100 text-slate-500",
                        ].join(" ")}
                      >
                        <UserRound className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="truncate text-sm font-semibold text-slate-800">
                            {customer.name}
                          </div>

                          {selected && (
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                          )}
                        </div>

                        {customer.addressLabel && (
                          <div className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-slate-500">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <span>
                              {
                                customer
                                  .addressLabel
                              }
                            </span>
                          </div>
                        )}

                        {!customer.hasValidAddress && (
                          <div className="mt-1 text-xs font-medium text-amber-600">
                            Cliente sem endereço
                            válido
                          </div>
                        )}
                      </div>
                    </button>
                  );
                },
              )
            ) : (
              <div className="px-4 py-10 text-center">
                <Search className="mx-auto h-8 w-8 text-slate-300" />

                <div className="mt-3 text-sm font-semibold text-slate-700">
                  Nenhum cliente
                  encontrado
                </div>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Tente pesquisar com
                  outro nome, endereço ou
                  documento.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {query.trim()
              ? `${filteredCustomers.length} resultado(s) exibido(s)`
              : `Exibindo os primeiros ${Math.min(
                  INITIAL_RESULTS_LIMIT,
                  customers.length,
                )} de ${customers.length} clientes`}

            {hasMoreCustomers && (
              <span className="ml-1">
                — refine a pesquisa para
                encontrar outros.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}