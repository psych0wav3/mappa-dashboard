"use client";

import * as React from "react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", indeterminate, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
      if (innerRef.current && indeterminate != null) {
        innerRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <input
        ref={(node) => {
          innerRef.current = node!;
          if (typeof ref === "function") ref(node!);
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }}
        type="checkbox"
        className={
          "h-4 w-4 rounded border border-neutral-300 text-neutral-900 " +
          "focus:outline-none focus:ring-2 focus:ring-neutral-300 " +
          "disabled:cursor-not-allowed disabled:opacity-50 " +
          className
        }
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";
