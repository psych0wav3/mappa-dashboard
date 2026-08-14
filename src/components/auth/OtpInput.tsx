"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
  "aria-label": ariaLabel = "Código de verificação",
}: OtpInputProps) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(() => {
    const normalized = onlyDigits(value).slice(0, length);
    return Array.from({ length }, (_, index) => normalized[index] ?? "");
  }, [value, length]);

  const focusIndex = React.useCallback((index: number) => {
    const input = inputsRef.current[index];
    if (!input) return;
    input.focus();
    input.select();
  }, []);

  const updateValue = React.useCallback(
    (nextDigits: string[]) => {
      onChange(nextDigits.join("").slice(0, length));
    },
    [length, onChange],
  );

  const handleChange = (index: number, raw: string) => {
    const cleaned = onlyDigits(raw);
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      updateValue(next);
      return;
    }

    if (cleaned.length > 1) {
      const next = [...digits];
      const chars = cleaned.slice(0, length - index).split("");
      chars.forEach((char, offset) => {
        next[index + offset] = char;
      });
      updateValue(next);
      focusIndex(Math.min(index + chars.length, length - 1));
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    updateValue(next);

    if (index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        updateValue(next);
        return;
      }

      if (index > 0) {
        event.preventDefault();
        focusIndex(index - 1);
        const next = [...digits];
        next[index - 1] = "";
        updateValue(next);
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    }

    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = onlyDigits(event.clipboardData.getData("text")).slice(
      0,
      length,
    );
    if (!pasted) return;

    const next = Array.from({ length }, (_, index) => pasted[index] ?? "");
    updateValue(next);
    focusIndex(Math.min(pasted.length, length - 1));
  };

  return (
    <div
      className="flex items-center justify-between gap-2"
      role="group"
      aria-label={ariaLabel}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.currentTarget.select()}
          className={cn(
            "h-12 w-10 rounded-xl border border-neutral-300 bg-white text-center text-lg font-semibold text-neutral-900 shadow-sm outline-none transition",
            "focus:border-sky-500 focus:ring-2 focus:ring-sky-200",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
          aria-label={`Dígito ${index + 1}`}
        />
      ))}
    </div>
  );
}
