"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, Info, LoaderCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type ConfirmDialogTone = "primary" | "warning" | "danger";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

const toneStyles: Record<
  ConfirmDialogTone,
  {
    iconWrapper: string;
    icon: string;
    confirmButton: string;
  }
> = {
  primary: {
    iconWrapper: "bg-sky-50",
    icon: "text-sky-600",
    confirmButton: "btn-brand text-white",
  },
  warning: {
    iconWrapper: "bg-amber-50",
    icon: "text-amber-600",
    confirmButton: "bg-amber-500 text-white hover:bg-amber-600",
  },
  danger: {
    iconWrapper: "bg-red-50",
    icon: "text-red-500",
    confirmButton: "bg-red-500 text-white hover:bg-red-600",
  },
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const styles = toneStyles[tone];

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !loading) {
      onCancel();
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[200] bg-slate-950/45 backdrop-blur-[1px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />

        <DialogPrimitive.Content
          aria-describedby={description ? "confirm-dialog-description" : undefined}
          onEscapeKeyDown={(event) => {
            if (loading) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            if (loading) {
              event.preventDefault();
            }
          }}
          className="fixed left-1/2 top-1/2 z-[210] w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${styles.iconWrapper}`}>
                {tone === "primary" ? <Info className={`h-5 w-5 ${styles.icon}`} /> : <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <DialogPrimitive.Title className="text-base font-bold text-slate-900">{title}</DialogPrimitive.Title>

                {description ? (
                  <DialogPrimitive.Description id="confirm-dialog-description" asChild>
                    <div className="mt-2 text-sm leading-6 text-slate-500">{description}</div>
                  </DialogPrimitive.Description>
                ) : null}
              </div>

              <button type="button" aria-label="Fechar" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-50" disabled={loading} onClick={onCancel}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
            <Button type="button" variant="outline" className="h-10 rounded-xl px-4" disabled={loading} onClick={onCancel}>
              {cancelLabel}
            </Button>

            <Button type="button" className={`h-10 rounded-xl px-4 ${styles.confirmButton}`} disabled={loading} onClick={onConfirm}>
              {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Aguarde..." : confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}