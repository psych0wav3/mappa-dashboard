"use client";

import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type InlineErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export default function InlineErrorState({
  title = "Não foi possível carregar",
  message,
  onRetry,
  retryLabel = "Tentar novamente",
}: InlineErrorStateProps) {
  return (
    <div className="grid min-h-[280px] place-items-center px-4 py-8">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle className="h-5 w-5" />
        </div>

        <h3 className="mt-3 text-sm font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {message}
        </p>

        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            className="mt-5 h-9 gap-2 rounded-xl px-4 text-xs"
            onClick={onRetry}
          >
            <RefreshCw className="h-3.5 w-3.5" />

            {retryLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}