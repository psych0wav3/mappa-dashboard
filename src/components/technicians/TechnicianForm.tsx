"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import TechnicianDetails from "./TechnicianDetails";

import type {
  TechnicianDefaults,
} from "./technician.types";

import {
  getTechnicianName,
} from "./technician.utils";

import useTechnicianModalPosition from "./useTechnicianModalPosition";

type TechnicianFormProps = {
  id?: string;
  defaultValues?: TechnicianDefaults;
  trigger?: React.ReactNode;
  onDeactivate?: () => void;
  onReactivate?: () => void;
  onDelete?: () =>
    | Promise<boolean | void>
    | boolean
    | void;
};

export default function TechnicianForm({
  id,
  defaultValues,
  trigger = "Novo técnico",
  onDeactivate,
  onReactivate,
  onDelete,
}: TechnicianFormProps) {
  const [open, setOpen] =
    React.useState(false);

  const [
    deleteConfirmOpen,
    setDeleteConfirmOpen,
  ] = React.useState(false);

  const [
    pending,
    startTransition,
  ] = useTransition();

  const modalPosition =
    useTechnicianModalPosition(
      open,
    );

  const isEditing =
    Boolean(id);

  const name =
    getTechnicianName(
      defaultValues,
    ) ||
    "Técnico sem nome";

  React.useEffect(() => {
    if (
      !open ||
      !modalPosition
    ) {
      return;
    }

    const frame =
      window.requestAnimationFrame(
        () => {
          const scrollContainer =
            document.querySelector<HTMLElement>(
              "[data-technician-modal-scroll]",
            );

          scrollContainer?.scrollTo({
            top: 0,
            behavior: "auto",
          });
        },
      );

    return () =>
      window.cancelAnimationFrame(
        frame,
      );
  }, [
    open,
    modalPosition,
  ]);

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (
      !nextOpen &&
      (
        pending ||
        deleteConfirmOpen
      )
    ) {
      return;
    }

    setOpen(nextOpen);
  }

  function handleDeactivate() {
    if (!onDeactivate) {
      return;
    }

    onDeactivate();
    setOpen(false);
  }

  function handleReactivate() {
    if (!onReactivate) {
      return;
    }

    onReactivate();
    setOpen(false);
  }

  function handleDelete() {
    if (!onDelete) {
      return;
    }

    setDeleteConfirmOpen(
      true,
    );
  }

  function confirmDelete() {
    if (!onDelete) {
      return;
    }

    startTransition(
      async () => {
        try {
          const deleted =
            await onDelete();

          if (
            deleted === false
          ) {
            setDeleteConfirmOpen(
              false,
            );

            return;
          }

          setDeleteConfirmOpen(
            false,
          );

          setOpen(false);
        } catch (error) {
          setDeleteConfirmOpen(
            false,
          );

          toast.error(
            error instanceof Error
              ? error.message
              : "Erro ao excluir técnico.",
          );
        }
      },
    );
  }

  const contentStyle:
    | React.CSSProperties
    | undefined =
    modalPosition
      ? {
          top:
            modalPosition.top,
          bottom:
            modalPosition.bottom,
          left:
            modalPosition.left,
          width:
            modalPosition.width,
        }
      : undefined;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Trigger asChild>
        {typeof trigger === "string" ? (
          <Button className="btn-brand rounded-xl text-white">
            {trigger}
          </Button>
        ) : (
          trigger as React.ReactElement
        )}
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[1px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />

        {modalPosition ? (
          <DialogPrimitive.Content
            style={contentStyle}
            aria-describedby={undefined}
            onEscapeKeyDown={(event) => {
              if (pending || deleteConfirmOpen) {
                event.preventDefault();
              }
            }}
            onPointerDownOutside={(event) => {
              if (pending || deleteConfirmOpen) {
                event.preventDefault();
              }
            }}
            className="fixed z-[60] flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl outline-none transition-[left,width,top,bottom] duration-200 ease-out data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          >
            <TechnicianDetails technician={defaultValues} isEditing={isEditing} pending={pending} onDeactivate={handleDeactivate} onReactivate={handleReactivate} onDelete={onDelete ? handleDelete : undefined} />
          </DialogPrimitive.Content>
        ) : null}
      </DialogPrimitive.Portal>

      <ConfirmDialog
        open={deleteConfirmOpen}
        tone="danger"
        title="Excluir técnico definitivamente?"
        description={
          <>
            <p>
              <strong className="font-semibold text-slate-700">{name}</strong> será removido definitivamente da empresa.
            </p>

            <p className="mt-2">
              Esta ação não poderá ser desfeita. A exclusão só será concluída se o técnico não possuir ordens de serviço vinculadas.
            </p>
          </>
        }
        confirmLabel="Excluir técnico"
        cancelLabel="Cancelar"
        loading={pending}
        onCancel={() => {
          if (!pending) {
            setDeleteConfirmOpen(false);
          }
        }}
        onConfirm={confirmDelete}
      />
    </DialogPrimitive.Root>
  );
}