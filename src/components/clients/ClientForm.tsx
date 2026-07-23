"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

import type { Client } from "@/app/(private)/clients/actions";

import ClientAddressesSection from "./ClientAddressesSection";
import ClientContactSection from "./ClientContactSection";
import ClientDetailsFooter from "./ClientDetailsFooter";
import ClientDetailsHeader from "./ClientDetailsHeader";
import ClientIdentityCard from "./ClientIdentityCard";
import ClientRegistrationSection from "./ClientRegistrationSection";

import {
  getClientAddresses,
} from "./client-form.utils";

import useClientDetails from "./useClientDetails";
import useClientModalPosition from "./useClientModalPosition";

type ClientFormProps = {
  clientId: string;
  summary: Client;
  trigger: React.ReactNode;
  onUpdated?: (client: Client) => void;
  onDeactivate?: () => void;
  onReactivate?: () => void;
  onDeleted?: () => void;
};

export default function ClientForm({
  clientId,
  summary,
  trigger,
  onUpdated,
  onDeactivate,
  onReactivate,
  onDeleted,
}: ClientFormProps) {
  const [open, setOpen] =
    React.useState(false);

  const scrollContainerRef =
    React.useRef<HTMLElement | null>(null);

  const closeModal =
    React.useCallback(() => {
      setOpen(false);
    }, []);

  const {
    client,
    loading,
    savingAddress,
    deleting,
    busy,
    handleAddAddress,
    handleDeactivate,
    handleReactivate,
    handleDelete,
  } = useClientDetails({
    open,
    clientId,
    summary,
    onUpdated,
    onDeactivate,
    onReactivate,
    onDeleted,
    onClose: closeModal,
  });

  const {
    position,
    style: contentStyle,
  } = useClientModalPosition(open);

  React.useEffect(() => {
    if (!open || !position) {
      return;
    }

    const animationFrameId =
      window.requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          top: 0,
          behavior: "auto",
        });
      });

    return () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );
    };
  }, [open, position]);

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (!nextOpen && busy) {
      return;
    }

    setOpen(nextOpen);
  }

  const addresses =
    getClientAddresses(client);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogPrimitive.Trigger asChild>
        {trigger as React.ReactElement}
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="
            fixed
            inset-0
            z-50
            bg-slate-950/40
            backdrop-blur-[1px]
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=open]:animate-in
            data-[state=open]:fade-in-0
          "
        />

        {position && (
          <DialogPrimitive.Content
            style={contentStyle}
            aria-describedby={undefined}
            onEscapeKeyDown={(event) => {
              if (busy) {
                event.preventDefault();
              }
            }}
            onPointerDownOutside={(event) => {
              if (busy) {
                event.preventDefault();
              }
            }}
            className="
              fixed
              z-[60]
              flex
              min-h-0
              flex-col
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              shadow-2xl
              outline-none
              transition-[left,width,top,bottom]
              duration-200
              ease-out
              data-[state=closed]:animate-out
              data-[state=closed]:fade-out-0
              data-[state=closed]:zoom-out-95
              data-[state=open]:animate-in
              data-[state=open]:fade-in-0
              data-[state=open]:zoom-in-95
            "
          >
            <DialogPrimitive.Title className="sr-only">
              Detalhes do cliente
            </DialogPrimitive.Title>

            <DialogPrimitive.Close
              disabled={busy}
              aria-label="Fechar detalhes do cliente"
              className="
                absolute
                right-5
                top-5
                z-30
                grid
                h-9
                w-9
                place-items-center
                rounded-lg
                text-slate-500
                transition
                hover:bg-slate-100
                hover:text-slate-900
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-sky-500
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:right-7
                sm:top-7
              "
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>

            <ClientDetailsHeader />

            <main
              ref={scrollContainerRef}
              className="
                min-h-0
                flex-1
                overflow-x-hidden
                overflow-y-auto
                overscroll-contain
              "
            >
              <div className="space-y-6 px-4 py-5 pb-8 sm:px-8 sm:py-7 sm:pb-10">
                {loading && (
                  <div className="flex min-h-12 items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Carregando dados completos do cliente...
                  </div>
                )}

                <ClientIdentityCard
                  client={client}
                />

                <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                  <ClientRegistrationSection
                    client={client}
                  />

                  <ClientContactSection
                    client={client}
                  />
                </div>

                <ClientAddressesSection
                  addresses={addresses}
                  pending={savingAddress}
                  onAddAddress={
                    handleAddAddress
                  }
                />

                {!client.active && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                    <div>
                      <p className="font-semibold">
                        Cliente temporariamente inativo
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-amber-700">
                        Este cliente não deverá receber novas ordens de serviço,
                        rotas ou planos até que seu cadastro seja reativado.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </main>

            <ClientDetailsFooter
              client={client}
              loading={loading}
              savingAddress={savingAddress}
              deleting={deleting}
              canDeactivate={
                Boolean(onDeactivate)
              }
              canReactivate={
                Boolean(onReactivate)
              }
              onDeactivate={
                handleDeactivate
              }
              onReactivate={
                handleReactivate
              }
              onDelete={
                handleDelete
              }
            />
          </DialogPrimitive.Content>
        )}
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}