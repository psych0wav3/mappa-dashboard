"use client";

import * as React from "react";

type DialogContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

type DialogProps = {
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
  children: React.ReactNode;
};

type ClickableElementProps = {
  onClick?: React.MouseEventHandler<HTMLElement>;
};

type DialogTriggerProps = {
  asChild?: boolean;
  children: React.ReactElement<ClickableElementProps>;
};

type DialogContentProps = {
  children: React.ReactNode;
  className?: string;
};

type DialogChildrenProps = {
  children: React.ReactNode;
};

const DialogContext =
  React.createContext<DialogContextValue | null>(null);

function useDialogContext(componentName: string) {
  const context = React.useContext(DialogContext);

  if (!context) {
    throw new Error(
      `${componentName} deve ser usado dentro de <Dialog>.`,
    );
  }

  return context;
}

export function Dialog({
  open,
  onOpenChange,
  children,
}: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (isControlled) {
        onOpenChange?.(value);
        return;
      }

      setInternalOpen(value);
    },
    [isControlled, onOpenChange],
  );

  const contextValue = React.useMemo<DialogContextValue>(
    () => ({
      open: currentOpen,
      setOpen,
    }),
    [currentOpen, setOpen],
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({
  asChild = false,
  children,
}: DialogTriggerProps) {
  const dialog = useDialogContext("DialogTrigger");

  function handleClick(
    event: React.MouseEvent<HTMLElement>,
  ) {
    children.props.onClick?.(event);

    if (!event.defaultPrevented) {
      dialog.setOpen(true);
    }
  }

  if (asChild) {
    const child = React.Children.only(children);

    return React.cloneElement(child, {
      onClick: handleClick,
    });
  }

  return (
    <button
      type="button"
      onClick={() => dialog.setOpen(true)}
      className="inline-flex rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
    >
      {children}
    </button>
  );
}

export function DialogContent({
  children,
  className = "",
}: DialogContentProps) {
  const dialog = useDialogContext("DialogContent");

  if (!dialog.open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <button
        type="button"
        aria-label="Fechar modal"
        className="absolute inset-0 cursor-default bg-black/40"
        onClick={() => dialog.setOpen(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={[
          "relative z-10 w-full max-w-lg rounded-xl border bg-white p-4 shadow-xl",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  children,
}: DialogChildrenProps) {
  return <div className="mb-3">{children}</div>;
}

export function DialogTitle({
  children,
}: DialogChildrenProps) {
  return (
    <h3 className="text-lg font-semibold">
      {children}
    </h3>
  );
}