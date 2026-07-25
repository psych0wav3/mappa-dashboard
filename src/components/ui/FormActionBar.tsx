"use client";

import * as React from "react";

import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type FormActionBarProps = {
  primaryLabel: string;
  loadingLabel?: string;

  pending?: boolean;
  disabled?: boolean;

  showBack?: boolean;
  showCancel?: boolean;

  backLabel?: string;
  cancelLabel?: string;

  primaryIcon?: React.ReactNode;

  onBack?: () => void;
  onCancel?: () => void;

  submitType?: "button" | "submit";
  onPrimaryAction?: () => void;

  className?: string;
};

export default function FormActionBar({
  primaryLabel,
  loadingLabel = "Salvando...",

  pending = false,
  disabled = false,

  showBack = true,
  showCancel = true,

  backLabel = "Voltar",
  cancelLabel = "Cancelar",

  primaryIcon,

  onBack,
  onCancel,

  submitType = "submit",
  onPrimaryAction,

  className = "",
}: FormActionBarProps) {
  return (
    <div
      className={[
        "sticky bottom-4 z-40 mt-5",
        className,
      ].join(" ")}
    >
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.16)] backdrop-blur">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {showBack && (
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-xl px-4 sm:w-auto"
                onClick={onBack}
                disabled={pending}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />

                {backLabel}
              </Button>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            {showCancel && (
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-xl px-5 sm:w-auto"
                onClick={onCancel}
                disabled={pending}
              >
                {cancelLabel}
              </Button>
            )}

            <Button
              type={submitType}
              className="btn-brand h-10 w-full rounded-xl px-6 text-white sm:w-auto"
              disabled={
                pending ||
                disabled
              }
              onClick={
                submitType === "button"
                  ? onPrimaryAction
                  : undefined
              }
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  {loadingLabel}
                </>
              ) : (
                <>
                  {primaryIcon ?? (
                    <Save className="mr-2 h-4 w-4" />
                  )}

                  {primaryLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}