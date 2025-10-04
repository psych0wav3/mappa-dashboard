"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  type UseFormReturn,
} from "react-hook-form";

// util simples para className
function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Form: provê o contexto do react-hook-form de forma genérica.
 * Aceita qualquer UseFormReturn<TFieldValues>.
 */
export function Form<TFieldValues extends FieldValues>({
  children,
  ...methods
}: { children: React.ReactNode } & UseFormReturn<TFieldValues>) {
  return <FormProvider {...(methods as UseFormReturn<FieldValues>)}>{children}</FormProvider>;
}

/**
 * Contexto para que FormItem/Message saibam o "name" atual.
 */
interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
}

const FormFieldContext = React.createContext<FormFieldContextValue>({
  name: "" as any,
});

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const formContext = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField deve ser usado dentro de FormField.");
  }

  const fieldState = formContext.getFieldState(fieldContext.name, formContext.formState);

  return {
    id: fieldContext.name as string,
    name: fieldContext.name,
    formItemId: `${fieldContext.name}-form-item`,
    formDescriptionId: `${fieldContext.name}-form-item-description`,
    formMessageId: `${fieldContext.name}-form-item-message`,
    ...fieldState,
  };
}

/**
 * FormField: wrapper genérico do Controller do RHF, mantendo tipagem.
 * IMPORTANTE: aceita a prop `control`.
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

/** ====== Componentes de UI (padrão shadcn, com Radix) ====== */

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={cn("text-sm font-medium", className)} {...props} />;
}

export function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  return <Slot {...props} />;
}

export function FormDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[0.8rem] text-neutral-500", className)} {...props} />;
}

export function FormMessage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? children ?? "") : (children as React.ReactNode);

  if (!body) return null;

  return (
    <p id={formMessageId} className={cn("text-[0.8rem] font-medium text-red-600", className)} {...props}>
      {body}
    </p>
  );
}
