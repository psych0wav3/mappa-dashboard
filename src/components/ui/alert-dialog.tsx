// src/components/ui/alert-dialog.tsx
"use client";

import * as React from "react";
import * as RadixAlertDialog from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

/**
 * AlertDialog primitives (inspirado no shadcn/ui)
 * Uso:
 *  <AlertDialog>
 *    <AlertDialogTrigger asChild>...</AlertDialogTrigger>
 *    <AlertDialogContent>
 *      <AlertDialogHeader>
 *        <AlertDialogTitle>Confirmar</AlertDialogTitle>
 *        <AlertDialogDescription>Essa ação é irreversível.</AlertDialogDescription>
 *      </AlertDialogHeader>
 *      <AlertDialogFooter>
 *        <AlertDialogCancel>Cancelar</AlertDialogCancel>
 *        <AlertDialogAction onClick={...}>Confirmar</AlertDialogAction>
 *      </AlertDialogFooter>
 *    </AlertDialogContent>
 *  </AlertDialog>
 */

export const AlertDialog = RadixAlertDialog.Root;
export const AlertDialogTrigger = RadixAlertDialog.Trigger;

export const AlertDialogPortal = RadixAlertDialog.Portal;

export const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof RadixAlertDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof RadixAlertDialog.Overlay>
>(({ className, ...props }, ref) => (
  <RadixAlertDialog.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = RadixAlertDialog.Overlay.displayName;

export const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof RadixAlertDialog.Content>,
  React.ComponentPropsWithoutRef<typeof RadixAlertDialog.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <RadixAlertDialog.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = RadixAlertDialog.Content.displayName;

export const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 space-y-1", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

export const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

export const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof RadixAlertDialog.Title>,
  React.ComponentPropsWithoutRef<typeof RadixAlertDialog.Title>
>(({ className, ...props }, ref) => (
  <RadixAlertDialog.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = RadixAlertDialog.Title.displayName;

export const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof RadixAlertDialog.Description>,
  React.ComponentPropsWithoutRef<typeof RadixAlertDialog.Description>
>(({ className, ...props }, ref) => (
  <RadixAlertDialog.Description
    ref={ref}
    className={cn("text-sm text-neutral-600", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = RadixAlertDialog.Description.displayName;

// Botões de ação/cancelar com estilos compatíveis ao seu <Button> (primary/outline)
const baseBtn =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none h-10 px-4";

export const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof RadixAlertDialog.Action>,
  React.ComponentPropsWithoutRef<typeof RadixAlertDialog.Action>
>(({ className, ...props }, ref) => (
  <RadixAlertDialog.Action
    ref={ref}
    className={cn(baseBtn, "bg-black text-white hover:opacity-90", className)}
    {...props}
  />
));
AlertDialogAction.displayName = RadixAlertDialog.Action.displayName;

export const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof RadixAlertDialog.Cancel>,
  React.ComponentPropsWithoutRef<typeof RadixAlertDialog.Cancel>
>(({ className, ...props }, ref) => (
  <RadixAlertDialog.Cancel
    ref={ref}
    className={cn(
      baseBtn,
      "border border-neutral-300 hover:bg-neutral-50 bg-white",
      className
    )}
    {...props}
  />
));
AlertDialogCancel.displayName = RadixAlertDialog.Cancel.displayName;
