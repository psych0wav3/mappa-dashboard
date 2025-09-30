"use client";

import * as React from "react";
import {
  type FieldValues,
  FormProvider,
  useFormContext,
  Controller,
} from "react-hook-form";

export function Form({ children, ...props }: React.ComponentProps<typeof FormProvider>) {
  return <FormProvider {...props}>{children}</FormProvider>;
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  render,
}: {
  name: string;
  render: (opts: {
    field: any;
    fieldState: { error?: { message?: string } };
  }) => React.ReactNode;
}) {
  const methods = useFormContext<TFieldValues>();
  return (
    <Controller
      control={methods.control}
      name={name as any}
      render={({ field, fieldState }) => <>{render({ field, fieldState })}</>}
    />
  );
}

export function FormItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"space-y-1.5 " + className}>{children}</div>;
}

export function FormLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-700">
      {children}
    </label>
  );
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-xs text-red-600">{children}</p>;
}
