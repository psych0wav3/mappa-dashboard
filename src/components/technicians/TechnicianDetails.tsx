"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";

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

import { Button } from "@/components/ui/button";

import type {
  TechnicianDefaults,
} from "./technician.types";

import {
  getTechnicianInitials,
  getTechnicianName,
} from "./technician.utils";

type TechnicianDetailsProps = {
  technician?: TechnicianDefaults;
  isEditing: boolean;
  pending: boolean;
  onDeactivate?: () => void;
  onReactivate?: () => void;
  onDelete?: () => void;
};

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

          <p className={`mt-1 break-words text-sm font-semibold leading-5 text-slate-800 ${valueClassName}`} title={value}>
            {value || "Não informado"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TechnicianDetails({
  technician,
  isEditing,
  pending,
  onDeactivate,
  onReactivate,
  onDelete,
}: TechnicianDetailsProps) {
  const isActive =
    technician?.active !==
    false;

  const name =
    getTechnicianName(
      technician,
    ) ||
    "Técnico sem nome";

  const email =
    technician?.email?.trim() ||
    "E-mail não informado";

  const phone =
    technician?.phone?.trim() ||
    "Telefone não informado";

  const role =
    technician?.role ===
    "OWNER"
      ? "Administrador"
      : "Técnico";

  return (
    <>
      <DialogPrimitive.Close disabled={pending} aria-label="Fechar detalhes do técnico" className="absolute right-5 top-5 z-30 grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 sm:right-7 sm:top-7">
        <X className="h-5 w-5" />
      </DialogPrimitive.Close>

      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-start gap-4 px-5 py-5 pr-16 sm:px-8 sm:py-6 sm:pr-20">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700">
            <UserRound className="h-6 w-6" />
          </div>

          <div className="min-w-0 text-left">
            <DialogPrimitive.Title className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              {isEditing ? "Detalhes do técnico" : "Novo técnico"}
            </DialogPrimitive.Title>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Consulte os dados de contato, acesso e situação do profissional.
            </p>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain" data-technician-modal-scroll>
        <div className="space-y-6 px-4 py-5 pb-8 sm:px-8 sm:py-7 sm:pb-10">
          <section className="overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-white">
            <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-sky-600 text-xl font-bold text-white shadow-sm">
                  {getTechnicianInitials(name)}
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
                  Dados utilizados para comunicação e acesso ao aplicativo.
                </p>
              </div>

              <div className="grid gap-3">
                <InformationCard icon={<Mail className="h-4 w-4" />} label="E-mail de acesso" value={email} />
                <InformationCard icon={<Phone className="h-4 w-4" />} label="Telefone" value={phone} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Acesso e permissões
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Função do profissional e situação atual da conta.
                </p>
              </div>

              <div className="grid gap-3">
                <InformationCard icon={<Wrench className="h-4 w-4" />} label="Cargo" value={role} />

                <InformationCard
                  icon={isActive ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                  label="Status da conta"
                  value={isActive ? "Ativa" : "Suspensa"}
                  valueClassName={isActive ? "text-emerald-700" : "text-amber-700"}
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

          {!isActive ? (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

              <div>
                <p className="font-semibold">
                  Técnico temporariamente inativo
                </p>

                <p className="mt-0.5 text-xs leading-5 text-amber-700">
                  Este profissional não deverá receber novos atendimentos ou rotas até que sua conta seja reativada.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-8">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isActive ? (
              <Button type="button" variant="outline" className="w-full rounded-xl border-amber-300 px-4 text-amber-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-800 sm:w-auto" onClick={onDeactivate} disabled={pending || !onDeactivate}>
                <UserX className="mr-2 h-4 w-4" />
                Inativar técnico
              </Button>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" className="rounded-xl border-emerald-300 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800" onClick={onReactivate} disabled={pending || !onReactivate}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Reativar técnico
                </Button>

                {onDelete ? (
                  <Button type="button" variant="outline" className="rounded-xl border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50 hover:text-red-800" onClick={onDelete} disabled={pending}>
                    {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    {pending ? "Excluindo..." : "Excluir definitivamente"}
                  </Button>
                ) : null}
              </div>
            )}
          </div>

          <DialogPrimitive.Close asChild>
            <Button type="button" variant="outline" className="rounded-xl px-6" disabled={pending}>
              Fechar
            </Button>
          </DialogPrimitive.Close>
        </div>
      </footer>
    </>
  );
}