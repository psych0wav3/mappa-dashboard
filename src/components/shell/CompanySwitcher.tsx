"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  getClientRole,
  isSuperAdminRole,
  SESSION_KEYS,
  setSessionCookie,
} from "@/lib/mappa/session";

type CompanyItem = {
  id: string;
  name: string;
  tradeName?: string | null;
  status?: string;
};

type ListCompaniesResponse = {
  items?: CompanyItem[];
  Items?: CompanyItem[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5264";

export default function CompanySwitcher() {
  const router = useRouter();
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [companies, setCompanies] = React.useState<
    CompanyItem[]
  >([]);
  const [selectedId, setSelectedId] = React.useState("");

  React.useEffect(() => {
    const role = getClientRole();
    const isSuper = isSuperAdminRole(role);
    setVisible(isSuper);

    if (!isSuper) {
      return;
    }

    const current =
      localStorage.getItem(SESSION_KEYS.companyId) ||
      "";
    setSelectedId(current);

    async function loadCompanies() {
      const token = localStorage.getItem(
        SESSION_KEYS.token,
      );

      if (!token) {
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/api/companies`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Não foi possível carregar as empresas.",
          );
        }

        const data =
          (await response.json()) as ListCompaniesResponse;

        const items = data.items ?? data.Items ?? [];
        setCompanies(items);

        if (
          current &&
          !items.some((item) => item.id === current)
        ) {
          setSelectedId("");
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Falha ao listar empresas.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCompanies();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const companyId = event.target.value;
    setSelectedId(companyId);

    if (!companyId) {
      localStorage.removeItem(SESSION_KEYS.companyId);
      localStorage.removeItem(SESSION_KEYS.companyName);
      document.cookie =
        `${SESSION_KEYS.companyId}=; Path=/; Max-Age=0; SameSite=Lax`;
      router.refresh();
      return;
    }

    const company = companies.find(
      (item) => item.id === companyId,
    );

    localStorage.setItem(SESSION_KEYS.companyId, companyId);
    setSessionCookie(SESSION_KEYS.companyId, companyId);

    if (company?.name) {
      localStorage.setItem(
        SESSION_KEYS.companyName,
        company.name,
      );
      setSessionCookie(
        SESSION_KEYS.companyName,
        company.name,
      );
    }

    toast.success("Empresa selecionada", {
      description:
        company?.name ||
        "Operações serão feitas nesta empresa.",
    });

    router.refresh();
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <Building2
        size={16}
        className="shrink-0 text-neutral-500"
        aria-hidden
      />
      <label className="sr-only" htmlFor="company-switcher">
        Empresa
      </label>
      <select
        id="company-switcher"
        value={selectedId}
        onChange={handleChange}
        disabled={loading}
        className="h-9 w-full max-w-md truncate rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-neutral-400"
      >
        <option value="">
          {loading
            ? "Carregando empresas..."
            : "Selecione a empresa"}
        </option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.tradeName || company.name}
          </option>
        ))}
      </select>
      {loading ? (
        <Loader2
          size={16}
          className="shrink-0 animate-spin text-neutral-400"
        />
      ) : null}
    </div>
  );
}
