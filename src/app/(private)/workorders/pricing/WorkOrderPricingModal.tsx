"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import {
  Calculator,
  Send,
  X,
} from "lucide-react";

import { toast } from "sonner";

import type {
  WorkOrderListItem,
} from "../actions";

import { Button } from "@/components/ui/button";
import useAppModalPosition from "@/components/ui/useAppModalPosition";

import {
  getErrorMessage,
} from "@/lib/mappa/errors";

import {
  priceWorkOrder,
} from "./actions";

import WorkOrderPricingCustomerSummary from "./WorkOrderPricingCustomerSummary";
import WorkOrderPricingItemsSection from "./WorkOrderPricingItemsSection";
import WorkOrderPricingScheduleSection from "./WorkOrderPricingScheduleSection";

import {
  createAdditionalItem,
  createLaborItem,
  ITEM_TYPE_LABELS,
  itemTotal,
  parseMoney,
  todayIso,
  type PricingItemForm,
} from "./work-order-pricing.helpers";

type WorkOrderPricingModalProps = {
  order: WorkOrderListItem | null;
  open: boolean;

  onOpenChange: (
    open: boolean,
  ) => void;

  onSuccess: (
    serviceOrderId: string,
  ) => void;
};

export default function WorkOrderPricingModal({
  order,
  open,
  onOpenChange,
  onSuccess,
}: WorkOrderPricingModalProps) {
  const [
    mounted,
    setMounted,
  ] = React.useState(false);

  const [
    pending,
    setPending,
  ] = React.useState(false);

  const [
    scheduledDate,
    setScheduledDate,
  ] = React.useState(
    todayIso(),
  );

  const [
    notes,
    setNotes,
  ] = React.useState("");

  const [
    items,
    setItems,
  ] = React.useState<
    PricingItemForm[]
  >(() => [
    createLaborItem(),
  ]);

  const {
    style,
  } = useAppModalPosition(
    open,
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (
      !open ||
      !order
    ) {
      return;
    }

    setScheduledDate(
      order.scheduledDate?.slice(
        0,
        10,
      ) || todayIso(),
    );

    setNotes("");

    setItems([
      createLaborItem(),
    ]);
  }, [
    open,
    order,
  ]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
          "Escape" &&
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
  }, [
    open,
    onOpenChange,
    pending,
  ]);

  const totalAmount =
    React.useMemo(
      () =>
        items.reduce(
          (
            total,
            item,
          ) =>
            total +
            itemTotal(
              item,
            ),
          0,
        ),
      [items],
    );

  function addItem() {
    setItems(
      (current) => [
        ...current,
        createAdditionalItem(),
      ],
    );
  }

  function updateItem(
    id: string,
    changes: Partial<PricingItemForm>,
  ) {
    setItems(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  ...changes,
                }
              : item,
        ),
    );
  }

  function removeItem(
    id: string,
  ) {
    setItems(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id ||
            item.locked,
        ),
    );
  }

  function handleClose() {
    if (pending) {
      return;
    }

    onOpenChange(false);
  }

  function validateItems() {
    if (
      items.length === 0
    ) {
      toast.error(
        "Adicione pelo menos um item ao orçamento.",
      );

      return false;
    }

    const laborItem =
      items.find(
        (item) =>
          item.type ===
          "LABOR",
      );

    if (!laborItem) {
      toast.error(
        "A mão de obra é obrigatória.",
      );

      return false;
    }

    for (
      const item of items
    ) {
      const itemName =
        item.description.trim() ||
        ITEM_TYPE_LABELS[
          item.type
        ];

      if (
        !item.description.trim()
      ) {
        toast.error(
          `Informe a descrição de "${ITEM_TYPE_LABELS[item.type]}".`,
        );

        return false;
      }

      const quantity =
        Number(
          item.quantity,
        );

      if (
        !Number.isFinite(
          quantity,
        ) ||
        quantity <= 0
      ) {
        toast.error(
          `Informe uma quantidade válida para "${itemName}".`,
        );

        return false;
      }

      const unitPrice =
        parseMoney(
          item.unitPrice,
        );

      if (
        unitPrice <= 0
      ) {
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

    if (
      !scheduledDate
    ) {
      toast.error(
        "Informe a data prevista.",
      );

      return;
    }

    if (
      !validateItems()
    ) {
      return;
    }

    if (
      totalAmount <= 0
    ) {
      toast.error(
        "O valor total do orçamento deve ser maior que zero.",
      );

      return;
    }

    setPending(true);

    try {
      await priceWorkOrder({
        serviceOrderId:
          order.id,

        scheduledDate,

        notes,

        items:
          items.map(
            (item) => ({
              type:
                item.type,

              description:
                item.description.trim(),

              quantity:
                Math.max(
                  1,
                  Number(
                    item.quantity ||
                      1,
                  ),
                ),

              unitPrice:
                parseMoney(
                  item.unitPrice,
                ),
            }),
          ),
      });

      toast.success(
        "Orçamento enviado ao cliente.",
      );

      onSuccess(
        order.id,
      );

      onOpenChange(
        false,
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Não foi possível precificar a ordem.",
        ),
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
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-[1px]"
        onClick={
          handleClose
        }
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-modal-title"
        style={style}
        className="fixed z-[91] flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl"
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
                Precificar ordem
                de serviço
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Revise a
                solicitação,
                informe os itens
                e envie o
                orçamento ao
                cliente.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 shrink-0 rounded-xl p-0 text-slate-500"
            onClick={
              handleClose
            }
            disabled={
              pending
            }
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 px-5 py-5 sm:px-6">
          <div className="space-y-5">
            <WorkOrderPricingCustomerSummary
              order={order}
            />

            <WorkOrderPricingItemsSection
              items={items}
              pending={
                pending
              }
              totalAmount={
                totalAmount
              }
              onAddItem={
                addItem
              }
              onUpdateItem={
                updateItem
              }
              onRemoveItem={
                removeItem
              }
            />

            <WorkOrderPricingScheduleSection
              scheduledDate={
                scheduledDate
              }
              notes={
                notes
              }
              pending={
                pending
              }
              onScheduledDateChange={
                setScheduledDate
              }
              onNotesChange={
                setNotes
              }
            />
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl px-4"
              onClick={
                handleClose
              }
              disabled={
                pending
              }
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