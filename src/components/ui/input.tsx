import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full h-10 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-black/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
