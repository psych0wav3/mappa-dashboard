"use client";

import * as React from "react";

type DialogCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = React.createContext<DialogCtx | null>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const [internal, setInternal] = React.useState(false);
  const controlled = open !== undefined;

  const value: DialogCtx = {
    open: controlled ? !!open : internal,
    setOpen: (v) => {
      if (controlled) onOpenChange?.(v);
      else setInternal(v);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function DialogTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactElement;
}) {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    throw new Error("DialogTrigger must be used within <Dialog>");
  }

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<any>;

    // 👇 aqui fazemos cast para "any" pra não brigar com o TS sobre onClick
    return React.cloneElement(
      child,
      {
        ...child.props,
        onClick: (e: any) => {
          child.props.onClick?.(e);
          ctx.setOpen(true);
        },
      } as any,
    );
  }

  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(true)}
      className="inline-flex rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
    >
      {children}
    </button>
  );
}

export function DialogContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    throw new Error("DialogContent must be used within <Dialog>");
  }

  if (!ctx.open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        className={
          "relative z-10 w-full max-w-lg rounded-xl border bg-white p-4 shadow-xl " +
          className
        }
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-3">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}
