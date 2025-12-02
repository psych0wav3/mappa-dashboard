"use client";

import InputMask from "react-input-mask";
import { Input } from "./input";
import * as React from "react";

type MaskedInputProps = React.ComponentProps<typeof Input> & {
  mask: string;
};

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, ...props }, ref) => {
    return (
      <InputMask mask={mask} {...props}>
        <Input ref={ref} />
      </InputMask>
    );
  }
);

MaskedInput.displayName = "MaskedInput";
