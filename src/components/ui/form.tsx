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

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Form: fornece o contexto do react-hook-form.
 */
export function Form<TFieldValues extends FieldValues>({
  children,
  ...methods
}: {
  children: React.ReactNode;
} & UseFormReturn<TFieldValues>) {
  return <FormProvider {...methods}>{children}</FormProvider>;
}

/**
 * Contexto usado para compartilhar o nome do campo atual.
 */
type FormFieldContextValue = {
  name: string;
};

const FormFieldContext =
  React.createContext<FormFieldContextValue | null>(null);

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const formContext = useFormContext();

  if (!fieldContext) {
    throw new Error(
      "useFormField deve ser usado dentro de FormField.",
    );
  }

  const fieldName = fieldContext.name;

  const fieldState = formContext.getFieldState(
    fieldName,
    formContext.formState,
  );

  return {
    id: fieldName,
    name: fieldName,
    formItemId: `${fieldName}-form-item`,
    formDescriptionId: `${fieldName}-form-item-description`,
    formMessageId: `${fieldName}-form-item-message`,
    ...fieldState,
  };
}

/**
 * Wrapper genérico do Controller do react-hook-form.
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function FormItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("space-y-2", className)}
      {...props}
    />
  );
}

export function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

export function FormControl(
  props: React.ComponentProps<typeof Slot>,
) {
  return <Slot {...props} />;
}

export function FormDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-[0.8rem] text-neutral-500",
        className,
      )}
      {...props}
    />
  );
}

export function FormMessage({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error, formMessageId } = useFormField();

  const body = error
    ? String(error.message ?? children ?? "")
    : children;

  if (!body) {
    return null;
  }

  return (
    <p
      id={formMessageId}
      className={cn(
        "text-[0.8rem] font-medium text-red-600",
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
}