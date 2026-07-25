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

type InputMaskRenderProps =
  React.InputHTMLAttributes<HTMLInputElement>;

type InputMaskComponentProps = {
  mask: string;
  maskPlaceholder?: string | null;
  value?: string | number | readonly string[];
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  children: (
    inputMaskProps: InputMaskRenderProps,
  ) => React.ReactNode;
};

const ReactInputMask =
  InputMask as unknown as React.ComponentType<InputMaskComponentProps>;

export const MaskedInput = React.forwardRef<
  HTMLInputElement,
  MaskedInputProps
>(
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
        {(inputMaskProps) => (
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