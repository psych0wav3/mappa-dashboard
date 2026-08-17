"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, Loader2, LogOut, Plus, Search, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClientRole, isSuperAdminRole, SESSION_KEYS, setSessionCookie } from "@/lib/mappa/session";

import MyAccountDialog from "@/components/account/MyAccountDialog";
import NewCompanyDialog from "./NewCompanyDialog";
import { CompanyItem, listCompanies, SelectCompanyApiError } from "./select-company.api";

export default function SelectCompanyPage() {
  const router = useRouter();

  const [companies, setCompanies] = React.useState<CompanyItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [selectingId, setSelectingId] = React.useState<string | null>(null);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [newCompanyOpen, setNewCompanyOpen] = React.useState(false);

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
          description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
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
        .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(term)),
    );
  }, [companies, search]);

  function selectCompany(company: CompanyItem) {
    if (selectingId) {
      return;
    }

    setSelectingId(company.id);

    localStorage.setItem(SESSION_KEYS.companyId, company.id);
    localStorage.setItem(SESSION_KEYS.companyName, company.tradeName || company.name);

    setSessionCookie(SESSION_KEYS.companyId, company.id);
    setSessionCookie(SESSION_KEYS.companyName, company.tradeName || company.name);

    window.location.replace("/dashboard");
  }

  function handleCompanyCreated(company: CompanyItem) {
    setCompanies((current) => {
      const exists = current.some((item) => item.id === company.id);

      if (exists) {
        return current.map((item) => item.id === company.id ? company : item);
      }

      return [...current, company].sort((first, second) =>
        (first.tradeName || first.name).localeCompare(second.tradeName || second.name, "pt-BR"),
      );
    });
  }

  function handleSignOut() {
    Object.values(SESSION_KEYS).forEach((key) => localStorage.removeItem(key));

    Object.values(SESSION_KEYS).forEach((key) => {
      document.cookie = `${key}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    });

    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0077C8] text-lg font-bold text-white">A</div>

            <div>
              <p className="text-base font-semibold text-neutral-900">Aqua Mappa</p>
              <p className="text-xs text-neutral-500">Super Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => setAccountOpen(true)} className="gap-2 rounded-xl">
              <UserRound size={16} />
              Minha conta
            </Button>

            <Button type="button" variant="outline" onClick={handleSignOut} className="gap-2 rounded-xl">
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

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Selecione uma empresa</h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Escolha a empresa que você deseja administrar. Depois da seleção, você será direcionado para o painel de controle daquela empresa.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-neutral-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-neutral-900">Empresas disponíveis</h2>
              <p className="mt-1 text-xs text-neutral-500">
                {loading ? "Carregando empresas..." : `${companies.length} ${companies.length === 1 ? "empresa encontrada" : "empresas encontradas"}`}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <Button type="button" onClick={() => setNewCompanyOpen(true)} className="btn-brand shrink-0 gap-2 rounded-xl px-5 text-white">
                <Plus size={16} />
                Nova empresa
              </Button>

              <div className="relative w-full sm:w-[320px]">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar empresa..." className="pl-9" disabled={loading} />
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
                <p className="font-medium text-neutral-700">Nenhuma empresa encontrada</p>
                <p className="mt-1 text-sm text-neutral-500">{search ? "Tente buscar por outro nome." : "Cadastre a primeira empresa para começar."}</p>

                {!search ? (
                  <Button type="button" onClick={() => setNewCompanyOpen(true)} className="btn-brand mt-4 gap-2 rounded-xl px-5 text-white">
                    <Plus size={16} />
                    Nova empresa
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="grid max-h-[520px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredCompanies.map((company) => {
                  const selecting = selectingId === company.id;

                  return (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => selectCompany(company)}
                      disabled={Boolean(selectingId)}
                      className="group flex min-h-[104px] items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 text-left transition hover:border-sky-300 hover:bg-sky-50/40 disabled:cursor-wait disabled:opacity-70"
                    >
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-[#0077C8] transition group-hover:bg-white">
                        <Building2 size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-neutral-900">{company.tradeName || company.name}</p>
                            {company.tradeName && company.tradeName !== company.name ? <p className="mt-1 truncate text-xs text-neutral-500">{company.name}</p> : null}
                          </div>

                          {selecting ? (
                            <Loader2 size={18} className="shrink-0 animate-spin text-[#0077C8]" />
                          ) : (
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-neutral-200 text-neutral-300 transition group-hover:border-[#0077C8] group-hover:text-[#0077C8]">
                              <Check size={14} />
                            </span>
                          )}
                        </div>

                        {company.status ? (
                          <span className="mt-2 inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500">
                            {company.status}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      <MyAccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
      <NewCompanyDialog open={newCompanyOpen} onOpenChange={setNewCompanyOpen} onCompanyCreated={handleCompanyCreated} />
    </main>
  );
}