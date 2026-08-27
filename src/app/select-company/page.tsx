"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/input";
import {
  getClientRole,
  isSuperAdminRole,
  SESSION_KEYS,
  setSessionCookie,
} from "@/lib/mappa/session";

import MyAccountDialog from "@/components/account/MyAccountDialog";
import EditCompanyDialog from "./EditCompanyDialog";
import NewCompanyDialog from "./NewCompanyDialog";
import {
  CompanyItem,
  CompanyStatus,
  listCompanies,
  SelectCompanyApiError,
  updateCompanyStatus,
} from "./select-company.api";

function normalizeStatus(status: string | null): CompanyStatus {
  return status?.toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

function statusLabel(status: string | null) {
  return normalizeStatus(status) === "ACTIVE" ? "Ativa" : "Inativa";
}

export default function SelectCompanyPage() {
  const router = useRouter();

  const [companies, setCompanies] = React.useState<CompanyItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [selectingId, setSelectingId] = React.useState<string | null>(null);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [newCompanyOpen, setNewCompanyOpen] = React.useState(false);
  const [editingCompany, setEditingCompany] = React.useState<CompanyItem | null>(
    null,
  );
  const [statusCompany, setStatusCompany] = React.useState<CompanyItem | null>(
    null,
  );
  const [statusPending, setStatusPending] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      const token = localStorage.getItem(SESSION_KEYS.token);
      const role = getClientRole();

      if (!token) {
        router.replace("/login");
        return;
      }

      if (!isSuperAdminRole(role)) {
        router.replace("/dashboard");
        return;
      }

      try {
        const items = await listCompanies();
        setCompanies(items);
      } catch (error) {
        if (error instanceof SelectCompanyApiError && error.status === 401) {
          handleSignOut();
          return;
        }

        toast.error("Falha ao carregar empresas", {
          description:
            error instanceof Error
              ? error.message
              : "Tente novamente em alguns instantes.",
        });
      } finally {
        setLoading(false);
      }
    }

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCompanies = React.useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");

    if (!term) {
      return companies;
    }

    return companies.filter((company) =>
      [company.tradeName, company.name, company.document, company.email]
        .filter(Boolean)
        .some((value) =>
          String(value).toLocaleLowerCase("pt-BR").includes(term),
        ),
    );
  }, [companies, search]);

  function upsertCompany(company: CompanyItem) {
    setCompanies((current) => {
      const exists = current.some((item) => item.id === company.id);

      const next = exists
        ? current.map((item) =>
            item.id === company.id
              ? {
                  ...item,
                  ...company,
                }
              : item,
          )
        : [...current, company];

      return next.sort((first, second) =>
        (first.tradeName || first.name).localeCompare(
          second.tradeName || second.name,
          "pt-BR",
        ),
      );
    });
  }

  function selectCompany(company: CompanyItem) {
    if (selectingId) {
      return;
    }

    if (normalizeStatus(company.status) === "INACTIVE") {
      toast.error("Esta empresa está inativa.", {
        description: "Reative a empresa antes de acessar o painel.",
      });
      return;
    }

    setSelectingId(company.id);

    localStorage.setItem(SESSION_KEYS.companyId, company.id);
    localStorage.setItem(
      SESSION_KEYS.companyName,
      company.tradeName || company.name,
    );

    setSessionCookie(SESSION_KEYS.companyId, company.id);
    setSessionCookie(
      SESSION_KEYS.companyName,
      company.tradeName || company.name,
    );

    window.location.replace("/dashboard");
  }

  function handleCompanyCreated(company: CompanyItem) {
    upsertCompany(company);
  }

  function handleCompanyUpdated(company: CompanyItem) {
    upsertCompany(company);

    const currentCompanyId = localStorage.getItem(SESSION_KEYS.companyId);

    if (currentCompanyId === company.id) {
      const companyName = company.tradeName || company.name;
      localStorage.setItem(SESSION_KEYS.companyName, companyName);
      setSessionCookie(SESSION_KEYS.companyName, companyName);
    }
  }

  async function handleStatusChange() {
    if (!statusCompany || statusPending) {
      return;
    }

    const currentStatus = normalizeStatus(statusCompany.status);
    const nextStatus: CompanyStatus =
      currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setStatusPending(true);

    try {
      const updated = await updateCompanyStatus(statusCompany.id, nextStatus);
      upsertCompany(updated);

      toast.success(
        nextStatus === "ACTIVE"
          ? "Empresa reativada com sucesso."
          : "Empresa inativada com sucesso.",
      );

      setStatusCompany(null);
    } catch (error) {
      toast.error("Não foi possível alterar o status da empresa.", {
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente em alguns instantes.",
      });
    } finally {
      setStatusPending(false);
    }
  }

  function handleSignOut() {
    Object.values(SESSION_KEYS).forEach((key) => localStorage.removeItem(key));

    Object.values(SESSION_KEYS).forEach((key) => {
      document.cookie = `${key}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    });

    router.replace("/login");
    router.refresh();
  }

  const changingStatusTo = statusCompany
    ? normalizeStatus(statusCompany.status) === "ACTIVE"
      ? "INACTIVE"
      : "ACTIVE"
    : null;

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0077C8] text-lg font-bold text-white">
              A
            </div>

            <div>
              <p className="text-base font-semibold text-neutral-900">
                Aqua Mappa
              </p>
              <p className="text-xs text-neutral-500">Super Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAccountOpen(true)}
              className="gap-2 rounded-xl"
            >
              <UserRound size={16} />
              Minha conta
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              className="gap-2 rounded-xl"
            >
              <LogOut size={16} />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-7 max-w-2xl">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-[#0077C8]">
            <Building2 size={22} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Selecione uma empresa
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Escolha a empresa que você deseja administrar. Você também pode
            editar os dados cadastrais e controlar o status de cada empresa.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-neutral-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-neutral-900">
                Empresas disponíveis
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                {loading
                  ? "Carregando empresas..."
                  : `${companies.length} ${
                      companies.length === 1
                        ? "empresa encontrada"
                        : "empresas encontradas"
                    }`}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <Button
                type="button"
                onClick={() => setNewCompanyOpen(true)}
                className="btn-brand shrink-0 gap-2 rounded-xl px-5 text-white"
              >
                <Plus size={16} />
                Nova empresa
              </Button>

              <div className="relative w-full sm:w-[320px]">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar empresa..."
                  className="pl-9"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 size={18} className="animate-spin" />
                  Carregando empresas...
                </div>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 text-center">
                <Building2 size={28} className="mb-3 text-neutral-300" />
                <p className="font-medium text-neutral-700">
                  Nenhuma empresa encontrada
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {search
                    ? "Tente buscar por outro nome."
                    : "Cadastre a primeira empresa para começar."}
                </p>

                {!search ? (
                  <Button
                    type="button"
                    onClick={() => setNewCompanyOpen(true)}
                    className="btn-brand mt-4 gap-2 rounded-xl px-5 text-white"
                  >
                    <Plus size={16} />
                    Nova empresa
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="grid max-h-[560px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredCompanies.map((company) => {
                  const selecting = selectingId === company.id;
                  const active = normalizeStatus(company.status) === "ACTIVE";

                  return (
                    <div
                      key={company.id}
                      className={`overflow-hidden rounded-xl border bg-white transition ${
                        active
                          ? "border-neutral-200 hover:border-sky-300 hover:shadow-sm"
                          : "border-neutral-200 bg-neutral-50/80"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => selectCompany(company)}
                        disabled={Boolean(selectingId) || !active}
                        className="group flex min-h-[104px] w-full items-center gap-4 p-4 text-left disabled:cursor-default"
                      >
                        <div
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                            active
                              ? "bg-sky-50 text-[#0077C8]"
                              : "bg-neutral-100 text-neutral-400"
                          }`}
                        >
                          <Building2 size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p
                                className={`truncate font-semibold ${
                                  active
                                    ? "text-neutral-900"
                                    : "text-neutral-500"
                                }`}
                              >
                                {company.tradeName || company.name}
                              </p>

                              {company.tradeName &&
                              company.tradeName !== company.name ? (
                                <p className="mt-1 truncate text-xs text-neutral-500">
                                  {company.name}
                                </p>
                              ) : null}
                            </div>

                            {selecting ? (
                              <Loader2
                                size={18}
                                className="shrink-0 animate-spin text-[#0077C8]"
                              />
                            ) : active ? (
                              <ArrowRight
                                size={18}
                                className="shrink-0 text-neutral-300 transition group-hover:text-[#0077C8]"
                              />
                            ) : (
                              <PowerOff
                                size={17}
                                className="shrink-0 text-neutral-300"
                              />
                            )}
                          </div>

                          <span
                            className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {statusLabel(company.status)}
                          </span>
                        </div>
                      </button>

                      <div className="flex items-center justify-between gap-2 border-t border-neutral-100 px-4 py-3">
                        <span className="text-xs text-neutral-400">
                          {active
                            ? "Clique acima para abrir a empresa"
                            : "Reative para acessar o painel"}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingCompany(company)}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-[#0077C8]"
                            aria-label={`Editar ${company.tradeName || company.name}`}
                            title="Editar empresa"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setStatusCompany(company)}
                            className={`grid h-9 w-9 place-items-center rounded-lg border bg-white transition ${
                              active
                                ? "border-neutral-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50"
                                : "border-neutral-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50"
                            }`}
                            aria-label={
                              active
                                ? `Inativar ${company.tradeName || company.name}`
                                : `Reativar ${company.tradeName || company.name}`
                            }
                            title={active ? "Inativar empresa" : "Reativar empresa"}
                          >
                            {active ? <PowerOff size={16} /> : <Power size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      <MyAccountDialog
        open={accountOpen}
        onOpenChange={setAccountOpen}
      />

      <NewCompanyDialog
        open={newCompanyOpen}
        onOpenChange={setNewCompanyOpen}
        onCompanyCreated={handleCompanyCreated}
      />

      <EditCompanyDialog
        open={Boolean(editingCompany)}
        company={editingCompany}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCompany(null);
          }
        }}
        onCompanyUpdated={handleCompanyUpdated}
      />

      <ConfirmDialog
        open={Boolean(statusCompany)}
        title={
          changingStatusTo === "ACTIVE"
            ? "Reativar empresa?"
            : "Inativar empresa?"
        }
        description={
          statusCompany ? (
            <>
              {changingStatusTo === "ACTIVE"
                ? "A empresa voltará a ficar disponível para acesso."
                : "Os usuários vinculados à empresa não deverão conseguir acessar o sistema enquanto ela estiver inativa."}
              <br />
              <strong className="text-neutral-700">
                {statusCompany.tradeName || statusCompany.name}
              </strong>
            </>
          ) : undefined
        }
        confirmLabel={
          changingStatusTo === "ACTIVE" ? "Reativar" : "Inativar"
        }
        tone={changingStatusTo === "ACTIVE" ? "primary" : "warning"}
        loading={statusPending}
        onConfirm={handleStatusChange}
        onCancel={() => {
          if (!statusPending) {
            setStatusCompany(null);
          }
        }}
      />
    </main>
  );
}