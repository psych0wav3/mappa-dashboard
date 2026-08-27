"use client";

import {
  Check,
  CircleDollarSign,
  Plus,
  Trash2,
} from "lucide-react";

import FormField from "@/components/form-layout/FormField";
import FormInfoBox from "@/components/form-layout/FormInfoBox";
import StepFormSection from "@/components/form-layout/StepFormSection";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type {
  WorkOrderPricingItemType,
} from "./actions";

import {
  formatCurrency,
  formatMoneyInput,
  ITEM_TYPE_LABELS,
  itemTotal,
  parseMoney,
  type PricingItemForm,
} from "./work-order-pricing.helpers";

type WorkOrderPricingItemsSectionProps = {
  items: PricingItemForm[];
  pending: boolean;
  totalAmount: number;

  onAddItem: () => void;

  onUpdateItem: (
    id: string,
    changes: Partial<PricingItemForm>,
  ) => void;

  onRemoveItem: (
    id: string,
  ) => void;
};

const ITEM_TYPE_OPTIONS: Array<{
  value: WorkOrderPricingItemType;
  label: string;
}> = [
  {
    value: "LABOR",
    label: "Mão de obra",
  },
  {
    value: "PRODUCT",
    label: "Produto",
  },
  {
    value: "MATERIAL",
    label: "Material",
  },
  {
    value: "SERVICE",
    label: "Serviço adicional",
  },
  {
    value: "OTHER",
    label: "Outro",
  },
];

export default function WorkOrderPricingItemsSection({
  items,
  pending,
  totalAmount,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: WorkOrderPricingItemsSectionProps) {
  const additionalItemsCount =
    items.filter(
      (item) =>
        !item.locked,
    ).length;

  return (
    <StepFormSection
      step={1}
      icon={CircleDollarSign}
      title="Itens e valores"
      description="Informe o valor da mão de obra e adicione produtos, materiais ou serviços complementares."
    >
      <DesktopItems
        items={items}
        pending={pending}
        totalAmount={
          totalAmount
        }
        additionalItemsCount={
          additionalItemsCount
        }
        onAddItem={
          onAddItem
        }
        onUpdateItem={
          onUpdateItem
        }
        onRemoveItem={
          onRemoveItem
        }
      />

      <MobileItems
        items={items}
        pending={pending}
        totalAmount={
          totalAmount
        }
        onAddItem={
          onAddItem
        }
        onUpdateItem={
          onUpdateItem
        }
        onRemoveItem={
          onRemoveItem
        }
      />

      <FormInfoBox
        icon={CircleDollarSign}
        variant="warning"
        compact
        className="mt-4"
      >
        A mão de obra é
        obrigatória e todos os
        itens precisam possuir
        valor maior que zero.
      </FormInfoBox>
    </StepFormSection>
  );
}

type ItemsProps = {
  items: PricingItemForm[];
  pending: boolean;

  onAddItem: () => void;

  onUpdateItem: (
    id: string,
    changes: Partial<PricingItemForm>,
  ) => void;

  onRemoveItem: (
    id: string,
  ) => void;
};

type DesktopItemsProps =
  ItemsProps & {
    totalAmount: number;

    additionalItemsCount: number;
  };

function DesktopItems({
  items,
  pending,
  totalAmount,
  additionalItemsCount,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: DesktopItemsProps) {
  return (
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
            (
              item,
              index,
            ) => (
              <tr
                key={item.id}
                className={[
                  "border-t border-slate-200",

                  item.locked
                    ? "bg-sky-50/40"
                    : "bg-white",
                ].join(
                  " ",
                )}
              >
                <td className="px-3 py-2">
                  <ItemTypeSelect
                    id={`pricing-item-type-${item.id}`}
                    item={
                      item
                    }
                    pending={
                      pending
                    }
                    onChange={(
                      type,
                    ) =>
                      onUpdateItem(
                        item.id,
                        {
                          type,
                        },
                      )
                    }
                  />
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
                        onUpdateItem(
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
                  <QuantityInput
                    id={`pricing-item-quantity-${item.id}`}
                    value={
                      item.quantity
                    }
                    disabled={
                      item.locked ||
                      pending
                    }
                    onChange={(
                      quantity,
                    ) =>
                      onUpdateItem(
                        item.id,
                        {
                          quantity,
                        },
                      )
                    }
                  />
                </td>

                <td className="px-3 py-2">
                  <PriceInput
                    id={`pricing-item-price-${item.id}`}
                    value={
                      item.unitPrice
                    }
                    pending={
                      pending
                    }
                    showError
                    onChange={(
                      unitPrice,
                    ) =>
                      onUpdateItem(
                        item.id,
                        {
                          unitPrice,
                        },
                      )
                    }
                  />
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
                  <ItemAction
                    item={
                      item
                    }
                    pending={
                      pending
                    }
                    onRemove={() =>
                      onRemoveItem(
                        item.id,
                      )
                    }
                  />
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
          onClick={
            onAddItem
          }
          disabled={
            pending
          }
          className="h-9 rounded-lg border-sky-200 bg-white px-3 text-xs text-sky-700 hover:bg-sky-50 hover:text-sky-800"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />

          Adicionar item
        </Button>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] text-slate-500">
              Mão de obra +{" "}
              {
                additionalItemsCount
              }{" "}
              {additionalItemsCount ===
              1
                ? "adicional"
                : "adicionais"}
            </div>

            <div className="text-xs font-semibold text-slate-700">
              {items.length}{" "}
              {items.length ===
              1
                ? "item cadastrado"
                : "itens cadastrados"}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <TotalAmount
            value={
              totalAmount
            }
          />
        </div>
      </div>
    </div>
  );
}

type MobileItemsProps =
  ItemsProps & {
    totalAmount: number;
  };

function MobileItems({
  items,
  pending,
  totalAmount,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: MobileItemsProps) {
  return (
    <div className="space-y-3 lg:hidden">
      {items.map(
        (
          item,
          index,
        ) => (
          <div
            key={item.id}
            className={[
              "rounded-xl border p-3",

              item.locked
                ? "border-sky-200 bg-sky-50/50"
                : "border-slate-200 bg-white",
            ].join(
              " ",
            )}
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
                    onRemoveItem(
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
                <ItemTypeSelect
                  id={`mobile-pricing-item-type-${item.id}`}
                  item={
                    item
                  }
                  pending={
                    pending
                  }
                  mobile
                  onChange={(
                    type,
                  ) =>
                    onUpdateItem(
                      item.id,
                      {
                        type,
                      },
                    )
                  }
                />
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
                    onUpdateItem(
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
                <QuantityInput
                  id={`mobile-pricing-item-quantity-${item.id}`}
                  value={
                    item.quantity
                  }
                  disabled={
                    item.locked ||
                    pending
                  }
                  mobile
                  onChange={(
                    quantity,
                  ) =>
                    onUpdateItem(
                      item.id,
                      {
                        quantity,
                      },
                    )
                  }
                />
              </FormField>

              <FormField
                htmlFor={`mobile-pricing-item-price-${item.id}`}
                label="Valor unitário"
                required
              >
                <PriceInput
                  id={`mobile-pricing-item-price-${item.id}`}
                  value={
                    item.unitPrice
                  }
                  pending={
                    pending
                  }
                  onChange={(
                    unitPrice,
                  ) =>
                    onUpdateItem(
                      item.id,
                      {
                        unitPrice,
                      },
                    )
                  }
                />
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
          onClick={
            onAddItem
          }
          disabled={
            pending
          }
          className="h-9 rounded-lg border-dashed border-sky-300 bg-white text-xs text-sky-700"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />

          Adicionar item
        </Button>

        <TotalAmount
          value={
            totalAmount
          }
        />
      </div>
    </div>
  );
}

type ItemTypeSelectProps = {
  id: string;
  item: PricingItemForm;
  pending: boolean;
  mobile?: boolean;

  onChange: (
    type: WorkOrderPricingItemType,
  ) => void;
};

function ItemTypeSelect({
  id,
  item,
  pending,
  mobile = false,
  onChange,
}: ItemTypeSelectProps) {
  return (
    <select
      id={id}
      value={item.type}
      disabled={
        item.locked ||
        pending
      }
      onChange={(
        event,
      ) =>
        onChange(
          event.target
            .value as WorkOrderPricingItemType,
        )
      }
      className={
        mobile
          ? "h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs disabled:bg-sky-50"
          : "h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:border-sky-100 disabled:bg-sky-50 disabled:font-medium disabled:text-sky-800"
      }
    >
      {ITEM_TYPE_OPTIONS.map(
        (option) => (
          <option
            key={
              option.value
            }
            value={
              option.value
            }
          >
            {
              option.label
            }
          </option>
        ),
      )}
    </select>
  );
}

type QuantityInputProps = {
  id: string;
  value: number;
  disabled: boolean;
  mobile?: boolean;

  onChange: (
    quantity: number,
  ) => void;
};

function QuantityInput({
  id,
  value,
  disabled,
  mobile = false,
  onChange,
}: QuantityInputProps) {
  return (
    <Input
      id={id}
      type="number"
      min={1}
      step={1}
      value={value}
      disabled={
        disabled
      }
      onChange={(
        event,
      ) =>
        onChange(
          Math.max(
            1,
            Number(
              event.target
                .value ||
                1,
            ),
          ),
        )
      }
      className={
        mobile
          ? "h-9 rounded-lg text-xs"
          : "h-9 rounded-lg px-2 text-center text-xs disabled:bg-sky-50 disabled:text-sky-800"
      }
    />
  );
}

type PriceInputProps = {
  id: string;
  value: string;
  pending: boolean;
  showError?: boolean;

  onChange: (
    value: string,
  ) => void;
};

function PriceInput({
  id,
  value,
  pending,
  showError = false,
  onChange,
}: PriceInputProps) {
  const invalid =
    Boolean(
      value.trim(),
    ) &&
    parseMoney(
      value,
    ) <= 0;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
        R$
      </span>

      <Input
        id={id}
        inputMode="numeric"
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            formatMoneyInput(
              event.target
                .value,
            ),
          )
        }
        placeholder="0,00"
        disabled={
          pending
        }
        className={[
          "h-9 rounded-lg pl-8 text-xs",

          showError &&
          invalid
            ? "border-red-300 focus-visible:ring-red-200"
            : "",
        ]
          .filter(
            Boolean,
          )
          .join(" ")}
      />
    </div>
  );
}

function ItemAction({
  item,
  pending,
  onRemove,
}: {
  item: PricingItemForm;
  pending: boolean;
  onRemove: () => void;
}) {
  if (item.locked) {
    return (
      <div
        className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-500"
        title="A mão de obra é obrigatória"
      >
        <Check className="h-3.5 w-3.5" />
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 w-8 rounded-lg border-red-100 p-0 text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
      onClick={
        onRemove
      }
      disabled={
        pending
      }
      aria-label="Excluir item"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

function TotalAmount({
  value,
}: {
  value: number;
}) {
  return (
    <div className="text-right">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Total da OS
      </div>

      <div className="text-base font-bold text-sky-700">
        {formatCurrency(
          value,
        )}
      </div>
    </div>
  );
}