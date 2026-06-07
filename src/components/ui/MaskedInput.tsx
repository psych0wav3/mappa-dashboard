"use client";

import * as React from "react";
import InputMask from "react-input-mask";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MaskedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "children"
> & {
  mask: string;
  maskPlaceholder?: string | null;
};

const ReactInputMask = InputMask as any;

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      mask,
      maskPlaceholder = null,
      className,
      value,
      onChange,
      onBlur,
      onFocus,
      disabled,
      readOnly,
      placeholder,
      name,
      id,
      autoComplete,
      ...props
    },
    ref,
  ) => {
    return (
      <ReactInputMask
        mask={mask}
        maskPlaceholder={maskPlaceholder}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        readOnly={readOnly}
      >
        {(inputMaskProps: any) => (
          <Input
            {...inputMaskProps}
            {...props}
            ref={ref}
            id={id}
            name={name}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(className)}
          />
        )}
      </ReactInputMask>
    );
  },
);

MaskedInput.displayName = "MaskedInput";