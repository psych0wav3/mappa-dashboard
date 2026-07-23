"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  addClientAddress,
  deleteClient,
  getClientById,
  type AddClientAddressInput,
  type Client,
} from "@/app/(private)/clients/actions";

import { Button } from "@/components/ui/button";

import ClientAddressesSection from "./ClientAddressesSection";
import ClientContactSection from "./ClientContactSection";
import ClientDetailsHeader from "./ClientDetailsHeader";
import ClientIdentityCard from "./ClientIdentityCard";
import ClientRegistrationSection from "./ClientRegistrationSection";

import { getClientAddresses } from "./client-form.utils";

type ClientFormProps = {
  clientId: string;
  summary: Client;
  trigger: React.ReactNode;
  onUpdated?: (client: Client) => void;
  onDeleted?: () => void;
};

type ModalPosition = {
  top: number;
  bottom: number;
  left: number;
  width: number;
};

const MODAL_MAX_WIDTH = 1120;

const DESKTOP_HORIZONTAL_MARGIN = 24;
const DESKTOP_VERTICAL_MARGIN = 24;

const MOBILE_HORIZONTAL_MARGIN = 12;
const MOBILE_VERTICAL_MARGIN = 12;

const MOBILE_BREAKPOINT = 768;

/**
 * Altura usada caso a barra superior não seja localizada automaticamente.
 */
const DEFAULT_TOP_BAR_HEIGHT = 64;

function isVisibleElement(element: HTMLElement) {
  const styles = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  return (
    styles.display !== "none" &&
    styles.visibility !== "hidden" &&
    Number(styles.opacity) !== 0 &&
    rect.width > 0 &&
    rect.height > 0
  );
}

function isPossibleSidebar(element: HTMLElement) {
  if (!isVisibleElement(element)) {
    return false;
  }

  const rect = element.getBoundingClientRect();

  return (
    rect.left <= 1 &&
    rect.top <= 1 &&
    rect.width >= 56 &&
    rect.width <= 360 &&
    rect.height >= window.innerHeight * 0.7
  );
}

function isPossibleTopBar(element: HTMLElement) {
  if (!isVisibleElement(element)) {
    return false;
  }

  const rect = element.getBoundingClientRect();

  const startsAtTop = rect.top >= -2 && rect.top <= 2;
  const reasonableHeight = rect.height >= 48 && rect.height <= 100;
  const wideEnough = rect.width >= window.innerWidth * 0.45;

  return startsAtTop && reasonableHeight && wideEnough;
}

function getSidebarRightEdge() {
  if (window.innerWidth < MOBILE_BREAKPOINT) {
    return 0;
  }

  const selectors = [
    "[data-app-sidebar]",
    '[data-sidebar="sidebar"]',
    '[data-sidebar="root"]',
    "aside",
  ];

  for (const selector of selectors) {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    );

    const sidebar = elements.find(isPossibleSidebar);

    if (sidebar) {
      return Math.max(0, sidebar.getBoundingClientRect().right);
    }
  }

  const elementsAtLeft = document.elementsFromPoint(
    10,
    Math.round(window.innerHeight / 2),
  );

  const candidates = elementsAtLeft
    .filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement,
    )
    .filter(isPossibleSidebar)
    .map((element) => element.getBoundingClientRect())
    .sort((first, second) => second.width - first.width);

  if (candidates.length > 0) {
    return Math.max(0, candidates[0].right);
  }

  return 0;
}

function getTopBarBottomEdge() {
  const selectors = [
    "[data-app-header]",
    "[data-topbar]",
    "[data-header]",
    "header",
  ];

  for (const selector of selectors) {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    );

    const topBarCandidates = elements
      .filter(isPossibleTopBar)
      .map((element) => element.getBoundingClientRect())
      .sort((first, second) => second.width - first.width);

    if (topBarCandidates.length > 0) {
      return Math.max(0, topBarCandidates[0].bottom);
    }
  }

  /*
   * Segunda tentativa: procura elementos visíveis no meio da região superior.
   */
  const topElements = document.elementsFromPoint(
    Math.round(window.innerWidth / 2),
    20,
  );

  const topBarCandidates = topElements
    .filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement,
    )
    .filter(isPossibleTopBar)
    .map((element) => element.getBoundingClientRect())
    .sort((first, second) => second.width - first.width);

  if (topBarCandidates.length > 0) {
    return Math.max(0, topBarCandidates[0].bottom);
  }

  /*
   * Fallback correspondente à altura atual da barra do Aqua Mappa.
   */
  return DEFAULT_TOP_BAR_HEIGHT;
}

function calculateModalPosition(): ModalPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const isMobile = viewportWidth < MOBILE_BREAKPOINT;

  const horizontalMargin = isMobile
    ? MOBILE_HORIZONTAL_MARGIN
    : DESKTOP_HORIZONTAL_MARGIN;

  const verticalMargin = isMobile
    ? MOBILE_VERTICAL_MARGIN
    : DESKTOP_VERTICAL_MARGIN;

  const sidebarRight = isMobile ? 0 : getSidebarRightEdge();

  const topBarBottom = isMobile ? 0 : getTopBarBottomEdge();

  const contentLeft = sidebarRight + horizontalMargin;
  const contentRight = viewportWidth - horizontalMargin;

  const availableWidth = Math.max(280, contentRight - contentLeft);

  const width = Math.min(MODAL_MAX_WIDTH, availableWidth);

  const remainingHorizontalSpace = Math.max(
    0,
    availableWidth - width,
  );

  const top = topBarBottom + verticalMargin;
  const bottom = verticalMargin;

  /*
   * Proteção para telas com pouca altura.
   */
  const minimumModalHeight = 320;

  const availableHeight = viewportHeight - top - bottom;

  const safeTop =
    availableHeight >= minimumModalHeight
      ? top
      : Math.max(verticalMargin, viewportHeight - bottom - minimumModalHeight);

  return {
    top: safeTop,
    bottom,
    left: contentLeft + remainingHorizontalSpace / 2,
    width,
  };
}

export default function ClientForm({
  clientId,
  summary,
  trigger,
  onUpdated,
  onDeleted,
}: ClientFormProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [savingAddress, setSavingAddress] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const [client, setClient] = React.useState<Client>(summary);

  const [modalPosition, setModalPosition] =
    React.useState<ModalPosition | null>(null);

  const scrollContainerRef = React.useRef<HTMLElement | null>(null);
  const onUpdatedRef = React.useRef(onUpdated);

  React.useEffect(() => {
    onUpdatedRef.current = onUpdated;
  }, [onUpdated]);

  React.useEffect(() => {
    setClient(summary);
  }, [summary]);

  const updateClient = React.useCallback((updatedClient: Client) => {
    setClient(updatedClient);
    onUpdatedRef.current?.(updatedClient);
  }, []);

  const updateModalPosition = React.useCallback(() => {
    setModalPosition(calculateModalPosition());
  }, []);

  React.useLayoutEffect(() => {
    if (!open) {
      setModalPosition(null);
      return;
    }

    let animationFrameId = 0;
    let intervalId: ReturnType<typeof window.setInterval> | null = null;

    function schedulePositionUpdate() {
      window.cancelAnimationFrame(animationFrameId);

      animationFrameId = window.requestAnimationFrame(() => {
        updateModalPosition();
      });
    }

    schedulePositionUpdate();

    /*
     * Acompanha a animação da sidebar enquanto ela abre ou recolhe.
     */
    intervalId = window.setInterval(schedulePositionUpdate, 50);

    const stopTransitionTracking = window.setTimeout(() => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }

      schedulePositionUpdate();
    }, 700);

    window.addEventListener("resize", schedulePositionUpdate);

    const mutationObserver = new MutationObserver(
      schedulePositionUpdate,
    );

    mutationObserver.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: [
        "class",
        "style",
        "data-state",
        "data-collapsed",
      ],
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(stopTransitionTracking);

      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }

      mutationObserver.disconnect();

      window.removeEventListener(
        "resize",
        schedulePositionUpdate,
      );
    };
  }, [open, updateModalPosition]);

  React.useEffect(() => {
    if (!open || !modalPosition) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      scrollContainerRef.current?.scrollTo({
        top: 0,
        behavior: "auto",
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [open, modalPosition]);

  const loadClientDetails = React.useCallback(async () => {
    const details = await getClientById(clientId);

    updateClient(details);

    return details;
  }, [clientId, updateClient]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const details = await getClientById(clientId);

        if (!mounted) {
          return;
        }

        updateClient(details);
      } catch (error) {
        if (!mounted) {
          return;
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados do cliente.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [clientId, open, updateClient]);

  async function handleAddAddress(
    address: AddClientAddressInput,
  ) {
    try {
      setSavingAddress(true);

      await addClientAddress(clientId, address);
      await loadClientDetails();

      toast.success("Endereço adicionado com sucesso.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o endereço.";

      toast.error(message);

      throw error;
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este cliente? Essa ação não poderá ser desfeita.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await deleteClient(clientId);

      toast.success("Cliente excluído com sucesso.");

      setOpen(false);
      onDeleted?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o cliente.",
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && (savingAddress || deleting)) {
      return;
    }

    setOpen(nextOpen);
  }

  const addresses = getClientAddresses(client);
  const busy = savingAddress || deleting;

  const contentStyle: React.CSSProperties | undefined =
    modalPosition
      ? {
          top: modalPosition.top,
          bottom: modalPosition.bottom,
          left: modalPosition.left,
          width: modalPosition.width,
        }
      : undefined;

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

        {modalPosition && (
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

                <ClientIdentityCard client={client} />

                <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                  <ClientRegistrationSection client={client} />

                  <ClientContactSection client={client} />
                </div>

                <ClientAddressesSection
                  addresses={addresses}
                  pending={savingAddress}
                  onAddAddress={handleAddAddress}
                />
              </div>
            </main>

            <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-8">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="
                    rounded-xl
                    border-red-300
                    text-red-700
                    hover:border-red-400
                    hover:bg-red-50
                    hover:text-red-800
                  "
                  onClick={handleDelete}
                  disabled={
                    deleting ||
                    savingAddress ||
                    loading
                  }
                >
                  {deleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}

                  {deleting
                    ? "Excluindo..."
                    : "Excluir cliente"}
                </Button>

                <DialogPrimitive.Close asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl px-6"
                    disabled={busy}
                  >
                    Fechar
                  </Button>
                </DialogPrimitive.Close>
              </div>
            </footer>
          </DialogPrimitive.Content>
        )}
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}