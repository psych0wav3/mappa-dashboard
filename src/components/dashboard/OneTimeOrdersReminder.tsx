"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, TriangleAlert } from "lucide-react";

import type { DashboardOneTimeOrderReminder } from "@/app/(private)/dashboard/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type OneTimeOrdersReminderProps = {
  data: DashboardOneTimeOrderReminder;
};

function orderLabel(value: number) {
  return value === 1 ? "1 OS avulsa" : `${value} OS avulsas`;
}

export default function OneTimeOrdersReminder({
  data,
}: OneTimeOrdersReminderProps) {
  const [alertOpen, setAlertOpen] = React.useState(false);

  const storageKey = React.useMemo(
    () => `aquamappa:dashboard-one-time-orders:${data.todayIso}`,
    [data.todayIso],
  );

  React.useEffect(() => {
    if (data.todayCount === 0 || data.todayOrderIds.length === 0) {
      setAlertOpen(false);
      return;
    }

    try {
      const stored = window.localStorage.getItem(storageKey);
      const acknowledgedIds = stored
        ? (JSON.parse(stored) as string[])
        : [];
      const acknowledgedSet = new Set(
        Array.isArray(acknowledgedIds) ? acknowledgedIds : [],
      );
      const hasNewOrder = data.todayOrderIds.some(
        (id) => !acknowledgedSet.has(id),
      );

      setAlertOpen(hasNewOrder);
    } catch {
      setAlertOpen(true);
    }
  }, [data.todayCount, data.todayOrderIds, storageKey]);

  function acknowledgeTodayOrders() {
    try {
      const stored = window.localStorage.getItem(storageKey);
      const acknowledgedIds = stored
        ? (JSON.parse(stored) as string[])
        : [];
      const nextIds = Array.from(
        new Set([
          ...(Array.isArray(acknowledgedIds) ? acknowledgedIds : []),
          ...data.todayOrderIds,
        ]),
      );

      window.localStorage.setItem(storageKey, JSON.stringify(nextIds));
    } catch {
      // Se o navegador bloquear o storage, o aviso ainda pode ser fechado nesta sessão da tela.
    }

    setAlertOpen(false);
  }

  if (data.totalUpcomingCount === 0) {
    return null;
  }

  return (
    <>
      <section className="min-w-0 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-4 shadow-sm sm:px-6">
        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <TriangleAlert className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h2 className="break-words text-sm font-semibold text-slate-900">
                  OS avulsas para organizar
                </h2>

                {data.todayCount > 0 ? (
                  <span className="rounded-full border border-amber-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                    Atenção hoje
                  </span>
                ) : null}
              </div>

              <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                {data.todayCount > 0
                  ? `${orderLabel(data.todayCount)} precisam ser incluídas nas rotas de hoje.`
                  : "Há OS avulsas programadas para os próximos dias aguardando organização de rota."}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center">
            <div className="grid w-full min-w-0 grid-cols-3 overflow-hidden rounded-xl border border-amber-200 bg-white/80 md:w-auto">
              <div className="min-w-0 px-2 py-2 text-center sm:px-3 md:min-w-[92px]">
                <p className="truncate text-[9px] font-medium uppercase tracking-wide text-slate-400 sm:text-[10px]">
                  Hoje
                </p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">
                  {data.todayCount}
                </p>
              </div>

              <div className="min-w-0 border-x border-amber-100 px-2 py-2 text-center sm:px-3 md:min-w-[92px]">
                <p className="truncate text-[9px] font-medium uppercase tracking-wide text-slate-400 sm:text-[10px]">
                  Amanhã
                </p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">
                  {data.tomorrowCount}
                </p>
              </div>

              <div className="min-w-0 px-2 py-2 text-center sm:px-3 md:min-w-[110px]">
                <p className="truncate text-[9px] font-medium uppercase tracking-wide text-slate-400 sm:text-[10px]">
                  Próx. dias
                </p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">
                  {data.laterCount}
                </p>
              </div>
            </div>

            <Link
              href="/routes/dashboard"
              className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-amber-600 md:w-auto"
            >
              Ver no controle das rotas
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      <AlertDialog
        open={alertOpen}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setAlertOpen(true);
          }
        }}
      >
        <AlertDialogContent
          onEscapeKeyDown={(event) => event.preventDefault()}
          className="w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-amber-200 p-0 shadow-2xl"
        >
          <div className="border-b border-amber-100 bg-amber-50 px-4 py-5 sm:px-6">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <TriangleAlert className="h-5 w-5" />
            </div>

            <AlertDialogHeader className="mb-0">
              <AlertDialogTitle className="text-base font-bold leading-6 text-slate-900 sm:text-lg">
                Há OS avulsas para organizar hoje
              </AlertDialogTitle>

              <AlertDialogDescription className="mt-2 text-sm leading-6 text-slate-600">
                Você possui{" "}
                <strong className="font-semibold text-slate-900">
                  {orderLabel(data.todayCount)}
                </strong>{" "}
                aguardando inclusão nas rotas de hoje.
                {data.futureCount > 0
                  ? ` Também existem ${orderLabel(data.futureCount)} programadas para os próximos 7 dias.`
                  : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />

              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">
                  Evite deixar atendimentos fora da rota
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Depois de confirmar este aviso, o lembrete continuará visível
                  no Painel de controle até as OS serem organizadas.
                </p>
              </div>
            </div>

            <AlertDialogFooter className="mt-5 flex-col gap-2 sm:flex-row">
              <AlertDialogAction
                onClick={acknowledgeTodayOrders}
                className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 sm:w-auto"
              >
                Entendi
              </AlertDialogAction>

              <Link
                href="/routes/dashboard"
                onClick={acknowledgeTodayOrders}
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 sm:w-auto"
              >
                Organizar agora
              </Link>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
