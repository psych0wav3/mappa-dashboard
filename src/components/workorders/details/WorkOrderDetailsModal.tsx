"use client";

import * as React from "react";

import {
  createPortal,
} from "react-dom";

import {
  AlertCircle,
  Loader2,
  MessageSquareText,
} from "lucide-react";

import {
  getWorkOrderById,
  type WorkOrderListItem,
} from "@/app/(private)/workorders/actions";

import {
  Button,
} from "@/components/ui/button";

import useAppModalPosition from "@/components/ui/useAppModalPosition";

import {
  normalizeWorkOrderStatus,
} from "../work-order-table.helpers";

import WorkOrderDetailsHeader from "./WorkOrderDetailsHeader";
import WorkOrderDetailsItems from "./WorkOrderDetailsItems";
import WorkOrderDetailsOverview from "./WorkOrderDetailsOverview";
import WorkOrderDetailsPricingForm from "./WorkOrderDetailsPricingForm";

import {
  parseWorkOrderDescription,
} from "./work-order-details.helpers";

type WorkOrderDetailsModalProps = {
  open: boolean;

  orderId:
    | string
    | null;

  initialOrder?:
    | WorkOrderListItem
    | null;

  onOpenChange: (
    open: boolean,
  ) => void;

  onOrderUpdated?: (
    order: WorkOrderListItem,
  ) => void;
};

export default function WorkOrderDetailsModal({
  open,
  orderId,
  initialOrder = null,
  onOpenChange,
  onOrderUpdated,
}: WorkOrderDetailsModalProps) {
  const [
    mounted,
    setMounted,
  ] =
    React.useState(false);

  const [
    order,
    setOrder,
  ] =
    React.useState<
      WorkOrderListItem | null
    >(initialOrder);

  const [
    loading,
    setLoading,
  ] =
    React.useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    React.useState<
      string | null
    >(null);

  const {
    style,
  } =
    useAppModalPosition(
      open,
    );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (
      !open ||
      !orderId
    ) {
      return;
    }

    let active = true;

    setOrder(
      initialOrder?.id ===
        orderId
        ? initialOrder
        : null,
    );

    setLoading(true);
    setErrorMessage(null);

    void getWorkOrderById(
      orderId,
    )
      .then((details) => {
        if (!active) {
          return;
        }

        setOrder(details);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os detalhes da ordem.",
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    initialOrder,
    open,
    orderId,
  ]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
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
    onOpenChange,
    open,
  ]);

  const parsedDescription =
    React.useMemo(
      () =>
        parseWorkOrderDescription(
          order?.description,
        ),
      [
        order?.description,
      ],
    );

  const isPendingPricing =
    Boolean(order) &&
    normalizeWorkOrderStatus(
      order?.status,
    ) ===
      "PENDINGCOMPANYPRICING";

  function handleUpdated(
    updated: WorkOrderListItem,
  ) {
    setOrder(updated);
    onOrderUpdated?.(updated);
  }

  function handleGoToPricing() {
    const target =
      document.getElementById(
        "work-order-pricing-form",
      );

    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (
    !mounted ||
    !open
  ) {
    return null;
  }

  const modal = (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-[1px]"
        onClick={() =>
          onOpenChange(false)
        }
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes da ordem de serviço"
        style={style}
        className="fixed z-[81] flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl"
      >
        <WorkOrderDetailsHeader
          onClose={() =>
            onOpenChange(false)
          }
        />

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-4 sm:px-5">
          {loading &&
          !order ? (
            <div className="grid min-h-[280px] place-items-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-sky-600" />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  Carregando detalhes...
                </p>
              </div>
            </div>
          ) : errorMessage &&
            !order ? (
            <div className="grid min-h-[280px] place-items-center">
              <div className="max-w-md text-center">
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                </div>

                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  Não foi possível abrir a ordem
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {errorMessage}
                </p>
              </div>
            </div>
          ) : order ? (
            <div className="space-y-4">
              <WorkOrderDetailsOverview
                order={order}
                parsedDescription={
                  parsedDescription
                }
              />

              {parsedDescription.notes && (
                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
                      <MessageSquareText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Descrição e observações
                      </h3>

                      <p className="mt-2 max-h-[100px] overflow-y-auto whitespace-pre-wrap pr-2 text-xs leading-5 text-slate-600">
                        {parsedDescription.notes}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              <WorkOrderDetailsItems
                items={
                  parsedDescription.items
                }
                order={order}
              />

              {isPendingPricing && (
                <WorkOrderDetailsPricingForm
                  order={order}
                  onUpdated={
                    handleUpdated
                  }
                />
              )}
            </div>
          ) : null}
        </div>

        <footer className="flex min-h-[58px] shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3">
          <div>
            {isPendingPricing && (
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-xl border-amber-300 bg-amber-50 px-4 text-xs text-amber-800 hover:bg-amber-100"
                onClick={
                  handleGoToPricing
                }
              >
                Precificar ordem
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-xl px-5 text-xs"
            onClick={() =>
              onOpenChange(false)
            }
          >
            Fechar
          </Button>
        </footer>
      </div>
    </div>
  );

  return createPortal(
    modal,
    document.body,
  );
}