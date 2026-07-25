"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useTransition } from "react";
import {
  AlertTriangle,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type TechDefaults = Partial<{
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  role: "OWNER" | "TECH";
}>;

type TechnicianFormProps = {
  id?: string;
  defaultValues?: TechDefaults;
  trigger?: React.ReactNode;
  onDeactivate?: () => void;
  onReactivate?: () => void;
  onDelete?: () => Promise<void> | void;
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
const DEFAULT_TOP_BAR_HEIGHT = 64;

function getFullName(defaultValues?: TechDefaults) {
  const explicitName = defaultValues?.name?.trim();

  if (explicitName) {
    return explicitName;
  }

  return [defaultValues?.firstName, defaultValues?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "T";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 1)
      .toLocaleUpperCase("pt-BR");
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase(
    "pt-BR",
  );
}

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
    rect.left <= 2 &&
    rect.top <= 2 &&
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

  const startsAtTop =
    rect.top >= -2 &&
    rect.top <= 2;

  const hasExpectedHeight =
    rect.height >= 48 &&
    rect.height <= 100;

  const isWide =
    rect.width >= window.innerWidth * 0.45;

  return startsAtTop && hasExpectedHeight && isWide;
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
      return Math.max(
        0,
        sidebar.getBoundingClientRect().right,
      );
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
    .map((element) =>
      element.getBoundingClientRect(),
    )
    .sort(
      (first, second) =>
        second.width - first.width,
    );

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

    const candidates = elements
      .filter(isPossibleTopBar)
      .map((element) =>
        element.getBoundingClientRect(),
      )
      .sort(
        (first, second) =>
          second.width - first.width,
      );

    if (candidates.length > 0) {
      return Math.max(0, candidates[0].bottom);
    }
  }

  const elementsAtTop = document.elementsFromPoint(
    Math.round(window.innerWidth / 2),
    20,
  );

  const candidates = elementsAtTop
    .filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement,
    )
    .filter(isPossibleTopBar)
    .map((element) =>
      element.getBoundingClientRect(),
    )
    .sort(
      (first, second) =>
        second.width - first.width,
    );

  if (candidates.length > 0) {
    return Math.max(0, candidates[0].bottom);
  }

  return DEFAULT_TOP_BAR_HEIGHT;
}

function calculateModalPosition(): ModalPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const isMobile =
    viewportWidth < MOBILE_BREAKPOINT;

  const horizontalMargin = isMobile
    ? MOBILE_HORIZONTAL_MARGIN
    : DESKTOP_HORIZONTAL_MARGIN;

  const verticalMargin = isMobile
    ? MOBILE_VERTICAL_MARGIN
    : DESKTOP_VERTICAL_MARGIN;

  const sidebarRight = isMobile
    ? 0
    : getSidebarRightEdge();

  const topBarBottom = isMobile
    ? 0
    : getTopBarBottomEdge();

  const contentLeft =
    sidebarRight + horizontalMargin;

  const contentRight =
    viewportWidth - horizontalMargin;

  const availableWidth = Math.max(
    280,
    contentRight - contentLeft,
  );

  const width = Math.min(
    MODAL_MAX_WIDTH,
    availableWidth,
  );

  const remainingHorizontalSpace = Math.max(
    0,
    availableWidth - width,
  );

  const requestedTop =
    topBarBottom + verticalMargin;

  const bottom = verticalMargin;
  const minimumModalHeight = 320;

  const availableHeight =
    viewportHeight - requestedTop - bottom;

  const top =
    availableHeight >= minimumModalHeight
      ? requestedTop
      : Math.max(
          verticalMargin,
          viewportHeight -
            bottom -
            minimumModalHeight,
        );

  return {
    top,
    bottom,
    left:
      contentLeft +
      remainingHorizontalSpace / 2,
    width,
  };
}

function InformationCard({
  icon,
  label,
  value,
  valueClassName = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-sky-700 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-slate-400">
            {label}
          </p>

          <p
            className={[
              "mt-1 break-words text-sm font-semibold leading-5 text-slate-800",
              valueClassName,
            ].join(" ")}
            title={value}
          >
            {value || "Não informado"}
          </p>
        </div>
      </div>
    </div>
  );
}

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

  const [pending, startTransition] =
    useTransition();

  const [
    modalPosition,
    setModalPosition,
  ] = React.useState<ModalPosition | null>(
    null,
  );

  const scrollContainerRef =
    React.useRef<HTMLElement | null>(null);

  const isEditing = Boolean(id);

  const isActive =
    defaultValues?.active !== false;

  const name =
    getFullName(defaultValues) ||
    "Técnico sem nome";

  const email =
    defaultValues?.email?.trim() ||
    "E-mail não informado";

  const phone =
    defaultValues?.phone?.trim() ||
    "Telefone não informado";

  const role =
    defaultValues?.role === "OWNER"
      ? "Administrador"
      : "Técnico";

  const updateModalPosition =
    React.useCallback(() => {
      setModalPosition(
        calculateModalPosition(),
      );
    }, []);

  React.useLayoutEffect(() => {
    if (!open) {
      setModalPosition(null);
      return;
    }

    let animationFrameId = 0;

    let intervalId: number | null = null;

    function schedulePositionUpdate() {
      window.cancelAnimationFrame(
        animationFrameId,
      );

      animationFrameId =
        window.requestAnimationFrame(() => {
          updateModalPosition();
        });
    }

    schedulePositionUpdate();

    intervalId = window.setInterval(
      schedulePositionUpdate,
      50,
    );

    const stopTransitionTracking =
      window.setTimeout(() => {
        if (intervalId !== null) {
          window.clearInterval(intervalId);
          intervalId = null;
        }

        schedulePositionUpdate();
      }, 700);

    window.addEventListener(
      "resize",
      schedulePositionUpdate,
    );

    const mutationObserver =
      new MutationObserver(
        schedulePositionUpdate,
      );

    mutationObserver.observe(
      document.body,
      {
        attributes: true,
        subtree: true,
        attributeFilter: [
          "class",
          "style",
          "data-state",
          "data-collapsed",
        ],
      },
    );

    return () => {
      window.cancelAnimationFrame(
        animationFrameId,
      );

      window.clearTimeout(
        stopTransitionTracking,
      );

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
  }, [open, modalPosition]);

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (!nextOpen && pending) {
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

    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este técnico definitivamente? Essa ação não poderá ser desfeita.",
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      try {
        await onDelete();
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erro ao excluir técnico.",
        );
      }
    });
  }

  const contentStyle:
    | React.CSSProperties
    | undefined = modalPosition
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
        {typeof trigger === "string" ? (
          <Button className="btn-brand rounded-xl text-white">
            {trigger}
          </Button>
        ) : (
          trigger as React.ReactElement
        )}
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
              if (pending) {
                event.preventDefault();
              }
            }}
            onPointerDownOutside={(event) => {
              if (pending) {
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
              {isEditing
                ? "Detalhes do técnico"
                : "Novo técnico"}
            </DialogPrimitive.Title>

            <DialogPrimitive.Close
              disabled={pending}
              aria-label="Fechar detalhes do técnico"
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

            <header className="shrink-0 border-b border-slate-200 bg-white">
              <div className="flex items-start gap-4 px-5 py-5 pr-16 sm:px-8 sm:py-6 sm:pr-20">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                  <UserRound className="h-6 w-6" />
                </div>

                <div className="min-w-0 text-left">
                  <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                    {isEditing
                      ? "Detalhes do técnico"
                      : "Novo técnico"}
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Consulte os dados de contato,
                    acesso e situação do
                    profissional.
                  </p>
                </div>
              </div>
            </header>

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
                <section className="overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-white">
                  <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-sky-600 text-xl font-bold text-white shadow-sm">
                        {getInitials(name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-xl font-bold leading-tight text-slate-950 sm:text-2xl">
                          {name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Informações de contato
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Dados utilizados para
                        comunicação e acesso ao
                        aplicativo.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <InformationCard
                        icon={
                          <Mail className="h-4 w-4" />
                        }
                        label="E-mail de acesso"
                        value={email}
                      />

                      <InformationCard
                        icon={
                          <Phone className="h-4 w-4" />
                        }
                        label="Telefone"
                        value={phone}
                      />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Acesso e permissões
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Função do profissional e
                        situação atual da conta.
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <InformationCard
                        icon={
                          <Wrench className="h-4 w-4" />
                        }
                        label="Cargo"
                        value={role}
                      />

                      <InformationCard
                        icon={
                          isActive ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )
                        }
                        label="Status da conta"
                        value={
                          isActive
                            ? "Ativa"
                            : "Suspensa"
                        }
                        valueClassName={
                          isActive
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }
                      />
                    </div>
                  </section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Permissões do aplicativo
                      </h3>

                      <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                        {role === "Administrador"
                          ? "Este usuário possui acesso administrativo à empresa e aos recursos de gerenciamento disponíveis para sua função."
                          : "Este profissional pode acessar o aplicativo, receber rotas, consultar atendimentos e executar ordens de serviço atribuídas à sua conta."}
                      </p>
                    </div>
                  </div>
                </section>

                {!isActive && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                    <div>
                      <p className="font-semibold">
                        Técnico temporariamente
                        inativo
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-amber-700">
                        Este profissional não deverá
                        receber novos atendimentos ou
                        rotas até que sua conta seja
                        reativada.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </main>

            <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-8">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {isActive ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-xl border-amber-300 px-4 text-amber-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 sm:w-auto"
                      onClick={handleDeactivate}
                      disabled={
                        pending || !onDeactivate
                      }
                    >
                      <UserX className="mr-2 h-4 w-4" />

                      Inativar técnico
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-emerald-300 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
                        onClick={handleReactivate}
                        disabled={
                          pending || !onReactivate
                        }
                      >
                        <UserCheck className="mr-2 h-4 w-4" />

                        Reativar técnico
                      </Button>

                      {onDelete && (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50 hover:text-red-800"
                          onClick={handleDelete}
                          disabled={pending}
                        >
                          {pending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}

                          {pending
                            ? "Excluindo..."
                            : "Excluir definitivamente"}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <DialogPrimitive.Close asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl px-6"
                    disabled={pending}
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