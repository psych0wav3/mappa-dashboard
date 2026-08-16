"use client";

import * as React from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = React.useState(false);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);

  const styles = toneStyles[tone];

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onCancel, open]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button type="button" aria-label="Fechar confirmação" className="absolute inset-0 cursor-default bg-slate-950/40 backdrop-blur-[1px]" disabled={loading} onClick={onCancel} />

      <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${styles.iconWrapper}`}>
              {tone === "primary" ? <Info className={`h-5 w-5 ${styles.icon}`} /> : <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id="confirm-dialog-title" className="text-base font-bold text-slate-900">
                {title}
              </h2>

              {description ? <div className="mt-2 text-sm leading-6 text-slate-500">{description}</div> : null}
            </div>

            <button type="button" aria-label="Fechar" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:pointer-events-none disabled:opacity-50" disabled={loading} onClick={onCancel}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
          <Button ref={cancelButtonRef} type="button" variant="outline" className="h-10 rounded-xl px-4" disabled={loading} onClick={onCancel}>
            {cancelLabel}
          </Button>

          <Button type="button" className={`h-10 rounded-xl px-4 ${styles.confirmButton}`} disabled={loading} onClick={onConfirm}>
            {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Aguarde..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}