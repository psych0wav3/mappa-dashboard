"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Calculator,
  Check,
  CircleDollarSign,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type { WorkOrderListItem } from "../actions";

import FormField from "@/components/form-layout/FormField";
import FormInfoBox from "@/components/form-layout/FormInfoBox";
import StepFormSection from "@/components/form-layout/StepFormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useAppModalPosition from "@/components/ui/useAppModalPosition";

import {
  priceWorkOrder,
  type WorkOrderPricingItemType,
} from "./actions";

type PricingItemForm = {
  id: string;
  type: WorkOrderPricingItemType;
  description: string;
  quantity: number;
  unitPrice: string;
  locked: boolean;
};

type WorkOrderPricingModalProps = {
  order: WorkOrderListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (serviceOrderId: string) => void;
};

const ITEM_TYPE_LABELS: Record<
  WorkOrderPricingItemType,
  string
> = {
  LABOR: "Mão de obra",
  PRODUCT: "Produto",
  MATERIAL: "Material",
  SERVICE: "Serviço adicional",
  OTHER: "Outro",
};

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function createLaborItem(): PricingItemForm {
  return {
    id: createId(),
    type: "LABOR",
    description: "Mão de obra",
    quantity: 1,
    unitPrice: "",
    locked: true,
  };
}

function createAdditionalItem(): PricingItemForm {
  return {
    id: createId(),
    type: "PRODUCT",
    description: "",
    quantity: 1,
    unitPrice: "",
    locked: false,
  };
}

function todayIso() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();

  return new Date(
    now.getTime() - timezoneOffset * 60_000,
  )
    .toISOString()
    .slice(0, 10);
}

function parseMoney(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return 0;
  }

  let normalized = cleanValue.replace(
    /[^\d,.-]/g,
    "",
  );

  if (
    normalized.includes(",") &&
    normalized.includes(".")
  ) {
    normalized = normalized
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatMoneyInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const amount = Number(digits) / 100;

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function itemTotal(item: PricingItemForm) {
  const quantity = Math.max(
    1,
    Number(item.quantity || 1),
  );

  return quantity * parseMoney(item.unitPrice);
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "CL";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0] ?? ""}${
    parts[1][0] ?? ""
  }`.toUpperCase();
}

export default function WorkOrderPricingModal({
  order,
  open,
  onOpenChange,
  onSuccess,
}: WorkOrderPricingModalProps) {
  const [mounted, setMounted] =
    React.useState(false);

  const [pending, setPending] =
    React.useState(false);

  const [
    scheduledDate,
    setScheduledDate,
  ] = React.useState(todayIso());

  const [notes, setNotes] =
    React.useState("");

  const [items, setItems] = React.useState<
    PricingItemForm[]
  >(() => [createLaborItem()]);

  const { style } =
    useAppModalPosition(open);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open || !order) {
      return;
    }

    setScheduledDate(
      order.scheduledDate?.slice(0, 10) ||
        todayIso(),
    );

    setNotes("");
    setItems([createLaborItem()]);
  }, [open, order]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !pending
      ) {
        onOpenChange(false);
      }
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onOpenChange, pending]);

  const totalAmount = React.useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + itemTotal(item),
        0,
      ),
    [items],
  );

  const additionalItemsCount =
    Math.max(0, items.length - 1);

  function addItem() {
    setItems((current) => [
      ...current,
      createAdditionalItem(),
    ]);
  }

  function updateItem(
    id: string,
    changes: Partial<PricingItemForm>,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item,
      ),
    );
  }

  function removeItem(id: string) {
    setItems((current) =>
      current.filter(
        (item) =>
          item.id !== id ||
          item.locked,
      ),
    );
  }

  function handleClose() {
    if (!pending) {
      onOpenChange(false);
    }
  }

  function validateItems() {
    if (items.length === 0) {
      toast.error(
        "Adicione pelo menos um item ao orçamento.",
      );

      return false;
    }

    const laborItem = items.find(
      (item) => item.type === "LABOR",
    );

    if (!laborItem) {
      toast.error(
        "A mão de obra é obrigatória.",
      );

      return false;
    }

    for (const item of items) {
      const itemName =
        item.description.trim() ||
        ITEM_TYPE_LABELS[item.type];

      if (!item.description.trim()) {
        toast.error(
          `Informe a descrição de "${ITEM_TYPE_LABELS[item.type]}".`,
        );

        return false;
      }

      const quantity = Number(
        item.quantity,
      );

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        toast.error(
          `Informe uma quantidade válida para "${itemName}".`,
        );

        return false;
      }

      const unitPrice = parseMoney(
        item.unitPrice,
      );

      if (unitPrice <= 0) {
        toast.error(
          `O valor de "${itemName}" deve ser maior que zero.`,
        );

        return false;
      }
    }

    return true;
  }

  async function handleSubmit() {
    if (!order) {
      toast.error(
        "Ordem de serviço não encontrada.",
      );

      return;
    }

    if (!scheduledDate) {
      toast.error(
        "Informe a data prevista.",
      );

      return;
    }

    if (!validateItems()) {
      return;
    }

    if (totalAmount <= 0) {
      toast.error(
        "O valor total do orçamento deve ser maior que zero.",
      );

      return;
    }

    setPending(true);

    try {
      await priceWorkOrder({
        serviceOrderId: order.id,
        scheduledDate,
        notes,
        items: items.map((item) => ({
          type: item.type,
          description:
            item.description.trim(),
          quantity: Math.max(
            1,
            Number(item.quantity || 1),
          ),
          unitPrice: parseMoney(
            item.unitPrice,
          ),
        })),
      });

      toast.success(
        "Orçamento enviado ao cliente.",
      );

      onSuccess(order.id);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível precificar a ordem.",
      );
    } finally {
      setPending(false);
    }
  }

  if (
    !mounted ||
    !open ||
    !order
  ) {
    return null;
  }

  const modal = (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-[1px]"
        onClick={handleClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-modal-title"
        style={style}
        className="fixed z-[81] flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <Calculator className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2
                id="pricing-modal-title"
                className="text-lg font-bold text-slate-950"
              >
                Precificar ordem de serviço
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Revise a solicitação,
                informe os itens e envie
                o orçamento ao cliente.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 shrink-0 rounded-xl p-0 text-slate-500"
            onClick={handleClose}
            disabled={pending}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 px-5 py-5 sm:px-6">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-white">
              <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-sky-600 text-xl font-bold text-white shadow-sm">
                    {getInitials(
                      order.customerName,
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-xl font-bold leading-tight text-slate-950 sm:text-2xl">
                      {order.customerName}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                      <span className="truncate">
                        {order.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <StepFormSection
              step={1}
              icon={CircleDollarSign}
              title="Itens e valores"
              description="Informe o valor da mão de obra e adicione produtos, materiais ou serviços complementares."
            >
              <div className="hidden overflow-hidden rounded-xl border border-slate-200 lg:block">
                <table className="w-full table-fixed text-sm">
                  <colgroup>
                    <col className="w-[17%]" />
                    <col className="w-[31%]" />
                    <col className="w-[11%]" />
                    <col className="w-[17%]" />
                    <col className="w-[16%]" />
                    <col className="w-[8%]" />
                  </colgroup>

                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Tipo
                      </th>

                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Descrição
                      </th>

                      <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Qtd.
                      </th>

                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Valor unitário
                      </th>

                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Subtotal
                      </th>

                      <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Ação
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map(
                      (item, index) => (
                        <tr
                          key={item.id}
                          className={[
                            "border-t border-slate-200",
                            item.locked
                              ? "bg-sky-50/40"
                              : "bg-white",
                          ].join(" ")}
                        >
                          <td className="px-3 py-2">
                            <select
                              id={`pricing-item-type-${item.id}`}
                              value={item.type}
                              disabled={
                                item.locked ||
                                pending
                              }
                              onChange={(
                                event,
                              ) =>
                                updateItem(
                                  item.id,
                                  {
                                    type: event
                                      .target
                                      .value as WorkOrderPricingItemType,
                                  },
                                )
                              }
                              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:border-sky-100 disabled:bg-sky-50 disabled:font-medium disabled:text-sky-800"
                            >
                              <option value="LABOR">
                                Mão de obra
                              </option>

                              <option value="PRODUCT">
                                Produto
                              </option>

                              <option value="MATERIAL">
                                Material
                              </option>

                              <option value="SERVICE">
                                Serviço adicional
                              </option>

                              <option value="OTHER">
                                Outro
                              </option>
                            </select>
                          </td>

                          <td className="px-3 py-2">
                            <div className="relative">
                              <Input
                                id={`pricing-item-description-${item.id}`}
                                value={
                                  item.description
                                }
                                disabled={
                                  item.locked ||
                                  pending
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateItem(
                                    item.id,
                                    {
                                      description:
                                        event
                                          .target
                                          .value,
                                    },
                                  )
                                }
                                placeholder="Ex.: Areia para filtro"
                                className="h-9 rounded-lg text-xs disabled:bg-sky-50 disabled:font-medium disabled:text-sky-800"
                              />

                              {item.locked && (
                                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-sky-100 bg-white px-2 py-0.5 text-[9px] font-semibold text-sky-700">
                                  Obrigatório
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-2">
                            <Input
                              id={`pricing-item-quantity-${item.id}`}
                              type="number"
                              min={1}
                              step={1}
                              value={
                                item.quantity
                              }
                              disabled={
                                item.locked ||
                                pending
                              }
                              onChange={(
                                event,
                              ) =>
                                updateItem(
                                  item.id,
                                  {
                                    quantity:
                                      Math.max(
                                        1,
                                        Number(
                                          event
                                            .target
                                            .value ||
                                            1,
                                        ),
                                      ),
                                  },
                                )
                              }
                              className="h-9 rounded-lg px-2 text-center text-xs disabled:bg-sky-50 disabled:text-sky-800"
                            />
                          </td>

                          <td className="px-3 py-2">
                            <div className="relative">
                              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                                R$
                              </span>

                              <Input
                                id={`pricing-item-price-${item.id}`}
                                inputMode="numeric"
                                value={
                                  item.unitPrice
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateItem(
                                    item.id,
                                    {
                                      unitPrice:
                                        formatMoneyInput(
                                          event
                                            .target
                                            .value,
                                        ),
                                    },
                                  )
                                }
                                placeholder="0,00"
                                disabled={
                                  pending
                                }
                                className={[
                                  "h-9 rounded-lg pl-8 text-xs",
                                  item.unitPrice.trim() &&
                                  parseMoney(
                                    item.unitPrice,
                                  ) <= 0
                                    ? "border-red-300 focus-visible:ring-red-200"
                                    : "",
                                ]
                                  .filter(
                                    Boolean,
                                  )
                                  .join(" ")}
                              />
                            </div>
                          </td>

                          <td className="px-3 py-2 text-right">
                            <div className="text-sm font-semibold text-slate-900">
                              {formatCurrency(
                                itemTotal(
                                  item,
                                ),
                              )}
                            </div>

                            <div className="text-[9px] text-slate-400">
                              Item{" "}
                              {index + 1}
                            </div>
                          </td>

                          <td className="px-3 py-2 text-center">
                            {item.locked ? (
                              <div
                                className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-500"
                                title="A mão de obra é obrigatória"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-lg border-red-100 p-0 text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() =>
                                  removeItem(
                                    item.id,
                                  )
                                }
                                disabled={
                                  pending
                                }
                                aria-label="Excluir item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>

                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    disabled={pending}
                    className="h-9 rounded-lg border-sky-200 bg-white px-3 text-xs text-sky-700 hover:bg-sky-50 hover:text-sky-800"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />

                    Adicionar item
                  </Button>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">
                        Mão de obra +{" "}
                        {additionalItemsCount}{" "}
                        {additionalItemsCount ===
                        1
                          ? "adicional"
                          : "adicionais"}
                      </div>

                      <div className="text-xs font-semibold text-slate-700">
                        {items.length}{" "}
                        {items.length === 1
                          ? "item cadastrado"
                          : "itens cadastrados"}
                      </div>
                    </div>

                    <div className="h-8 w-px bg-slate-200" />

                    <div className="text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Total da OS
                      </div>

                      <div className="text-base font-bold text-sky-700">
                        {formatCurrency(
                          totalAmount,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 lg:hidden">
                {items.map(
                  (item, index) => (
                    <div
                      key={item.id}
                      className={[
                        "rounded-xl border p-3",
                        item.locked
                          ? "border-sky-200 bg-sky-50/50"
                          : "border-slate-200 bg-white",
                      ].join(" ")}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Item{" "}
                            {index + 1}
                          </div>

                          <div className="mt-0.5 flex items-center gap-2 text-xs font-semibold text-slate-900">
                            {
                              ITEM_TYPE_LABELS[
                                item.type
                              ]
                            }

                            {item.locked && (
                              <span className="rounded-full border border-sky-200 bg-white px-2 py-0.5 text-[9px] font-semibold text-sky-700">
                                Obrigatório
                              </span>
                            )}
                          </div>
                        </div>

                        {!item.locked && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 rounded-lg border-red-100 p-0 text-red-500"
                            onClick={() =>
                              removeItem(
                                item.id,
                              )
                            }
                            disabled={
                              pending
                            }
                            aria-label="Excluir item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                          htmlFor={`mobile-pricing-item-type-${item.id}`}
                          label="Tipo"
                        >
                          <select
                            id={`mobile-pricing-item-type-${item.id}`}
                            value={
                              item.type
                            }
                            disabled={
                              item.locked ||
                              pending
                            }
                            onChange={(
                              event,
                            ) =>
                              updateItem(
                                item.id,
                                {
                                  type: event
                                    .target
                                    .value as WorkOrderPricingItemType,
                                },
                              )
                            }
                            className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs disabled:bg-sky-50"
                          >
                            <option value="LABOR">
                              Mão de obra
                            </option>

                            <option value="PRODUCT">
                              Produto
                            </option>

                            <option value="MATERIAL">
                              Material
                            </option>

                            <option value="SERVICE">
                              Serviço adicional
                            </option>

                            <option value="OTHER">
                              Outro
                            </option>
                          </select>
                        </FormField>

                        <FormField
                          htmlFor={`mobile-pricing-item-description-${item.id}`}
                          label="Descrição"
                          required
                        >
                          <Input
                            id={`mobile-pricing-item-description-${item.id}`}
                            value={
                              item.description
                            }
                            disabled={
                              item.locked ||
                              pending
                            }
                            onChange={(
                              event,
                            ) =>
                              updateItem(
                                item.id,
                                {
                                  description:
                                    event
                                      .target
                                      .value,
                                },
                              )
                            }
                            placeholder="Ex.: Areia para filtro"
                            className="h-9 rounded-lg text-xs"
                          />
                        </FormField>

                        <FormField
                          htmlFor={`mobile-pricing-item-quantity-${item.id}`}
                          label="Quantidade"
                          required
                        >
                          <Input
                            id={`mobile-pricing-item-quantity-${item.id}`}
                            type="number"
                            min={1}
                            step={1}
                            value={
                              item.quantity
                            }
                            disabled={
                              item.locked ||
                              pending
                            }
                            onChange={(
                              event,
                            ) =>
                              updateItem(
                                item.id,
                                {
                                  quantity:
                                    Math.max(
                                      1,
                                      Number(
                                        event
                                          .target
                                          .value ||
                                          1,
                                      ),
                                    ),
                                },
                              )
                            }
                            className="h-9 rounded-lg text-xs"
                          />
                        </FormField>

                        <FormField
                          htmlFor={`mobile-pricing-item-price-${item.id}`}
                          label="Valor unitário"
                          required
                        >
                          <div className="relative">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                              R$
                            </span>

                            <Input
                              id={`mobile-pricing-item-price-${item.id}`}
                              inputMode="numeric"
                              value={
                                item.unitPrice
                              }
                              onChange={(
                                event,
                              ) =>
                                updateItem(
                                  item.id,
                                  {
                                    unitPrice:
                                      formatMoneyInput(
                                        event
                                          .target
                                          .value,
                                      ),
                                  },
                                )
                              }
                              placeholder="0,00"
                              disabled={
                                pending
                              }
                              className="h-9 rounded-lg pl-8 text-xs"
                            />
                          </div>
                        </FormField>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Subtotal
                        </span>

                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(
                            itemTotal(
                              item,
                            ),
                          )}
                        </span>
                      </div>
                    </div>
                  ),
                )}

                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    disabled={pending}
                    className="h-9 rounded-lg border-dashed border-sky-300 bg-white text-xs text-sky-700"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />

                    Adicionar item
                  </Button>

                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Total da OS
                    </div>

                    <div className="text-base font-bold text-sky-700">
                      {formatCurrency(
                        totalAmount,
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <FormInfoBox
                icon={CircleDollarSign}
                variant="warning"
                compact
                className="mt-4"
              >
                A mão de obra é obrigatória
                e todos os itens precisam
                possuir valor maior que zero.
              </FormInfoBox>
            </StepFormSection>

            <StepFormSection
              step={2}
              icon={CalendarDays}
              title="Agendamento e observações"
              description="Defina a data prevista e registre informações importantes para a execução do atendimento."
            >
              <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                <FormField
                  htmlFor="pricing-scheduled-date"
                  label="Data agendada"
                  required
                >
                  <Input
                    id="pricing-scheduled-date"
                    type="date"
                    min={todayIso()}
                    value={scheduledDate}
                    onChange={(event) =>
                      setScheduledDate(
                        event.target.value,
                      )
                    }
                    className="h-11 rounded-xl"
                    disabled={pending}
                  />
                </FormField>

                <FormField
                  htmlFor="pricing-notes"
                  label="Descrição e observações"
                  optional
                  description="Registre o problema relatado, peças necessárias, instruções e referências para o técnico."
                >
                  <Textarea
                    id="pricing-notes"
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value,
                      )
                    }
                    placeholder="Ex.: Bomba apresentando ruído. Verificar rolamento, registrar diagnóstico e enviar orçamento."
                    rows={6}
                    className="min-h-[148px] resize-y rounded-xl"
                    disabled={pending}
                  />
                </FormField>
              </div>
            </StepFormSection>
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl px-4"
              onClick={handleClose}
              disabled={pending}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              className="btn-brand h-10 rounded-xl px-5 text-white"
              onClick={() =>
                void handleSubmit()
              }
              disabled={
                pending ||
                totalAmount <= 0
              }
            >
              <Send className="mr-2 h-4 w-4" />

              {pending
                ? "Enviando..."
                : "Enviar orçamento"}
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );

  return createPortal(
    modal,
    document.body,
  );
}