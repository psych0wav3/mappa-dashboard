"use client";

import * as React from "react";

import Image from "next/image";
import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BROWSER_API_BASE } from "@/lib/browser-api";

const SESSION_STORAGE_KEYS = [
  "mappa_access_token",
  "mappa_company_id",
  "mappa_company_name",
  "mappa_user",
  "mappa_roles",
  "mappa_role",
] as const;

const SESSION_COOKIE_KEYS = [
  "mappa_access_token",
  "mappa_company_id",
  "mappa_company_name",
  "mappa_user",
  "mappa_roles",
  "mappa_role",
] as const;

function clearLocalSession() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  for (
    const key of
    SESSION_STORAGE_KEYS
  ) {
    localStorage.removeItem(
      key,
    );
  }

  for (
    const cookieName of
    SESSION_COOKIE_KEYS
  ) {
    document.cookie =
      `${cookieName}=; ` +
      "Path=/; " +
      "Max-Age=0; " +
      "Expires=Thu, 01 Jan 1970 00:00:00 GMT; " +
      "SameSite=Lax";
  }
}

export default function LoginPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const [email, setEmail] =
    React.useState("");

  const [senha, setSenha] =
    React.useState("");

  const [
    showPass,
    setShowPass,
  ] = React.useState(false);

  const [
    loading,
    setLoading,
  ] = React.useState(false);

  React.useEffect(() => {
    const reason =
      searchParams.get(
        "reason",
      );

    if (
      reason ===
        "session-expired" ||
      reason ===
        "session-required" ||
      reason ===
        "company-required"
    ) {
      clearLocalSession();

      /*
       * Limpa o parâmetro da URL
       * para evitar mensagem repetida
       * ao atualizar a página.
       */
      router.replace(
        "/login",
        {
          scroll: false,
        },
      );
    }
  }, [
    router,
    searchParams,
  ]);

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `${BROWSER_API_BASE}/api/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email:
                email.trim(),

              password:
                senha,
            }),
          },
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "E-mail ou senha inválidos.",
        );
      }

      const data =
        await response.json();

      const accessToken =
        data.accessToken ??
        data.AccessToken;

      const user =
        data.user ?? data.User;

      const roles =
        user?.roles ??
        user?.Roles ??
        data.roles ??
        data.Roles ??
        [];

      const primaryRole = roles[0];

      const roleRaw =
        primaryRole?.role ??
        primaryRole?.Role ??
        "";

      const role = String(roleRaw)
        .replace(
          /([a-z])([A-Z])/g,
          "$1_$2",
        )
        .toUpperCase();

      const isSuperAdmin =
        role === "SUPER_ADMIN" ||
        role === "SUPERADMIN";

      const companyId =
        primaryRole?.companyId ??
        primaryRole?.CompanyId ??
        null;

      const companyName =
        primaryRole?.companyName ??
        primaryRole?.CompanyName ??
        null;

      if (!accessToken) {
        throw new Error(
          "Token não retornado pela API.",
        );
      }

      if (!companyId && !isSuperAdmin) {
        throw new Error(
          "Empresa não encontrada para este usuário.",
        );
      }

      localStorage.setItem(
        "mappa_access_token",
        accessToken,
      );

      localStorage.setItem(
        "mappa_user",
        JSON.stringify(user),
      );

      localStorage.setItem(
        "mappa_roles",
        JSON.stringify(roles),
      );

      if (role) {
        localStorage.setItem(
          "mappa_role",
          role,
        );
      }

      document.cookie =
        `mappa_access_token=${accessToken}; ` +
        "Path=/; " +
        "Max-Age=86400; " +
        "SameSite=Lax";

      if (role) {
        document.cookie =
          `mappa_role=${encodeURIComponent(role)}; ` +
          "Path=/; " +
          "Max-Age=86400; " +
          "SameSite=Lax";
      }

      if (isSuperAdmin) {
        localStorage.removeItem(
          "mappa_company_id",
        );

        localStorage.removeItem(
          "mappa_company_name",
        );

        document.cookie =
          "mappa_company_id=; Path=/; Max-Age=0; SameSite=Lax";

        document.cookie =
          "mappa_company_name=; Path=/; Max-Age=0; SameSite=Lax";

        toast.success(
          "Bem-vindo!",
          {
            description:
              "Escolha a empresa que deseja administrar.",
          },
        );

        window.location.replace(
          "/select-company",
        );

        return;
      }

      if (companyId) {
        localStorage.setItem(
          "mappa_company_id",
          companyId,
        );

        document.cookie =
          `mappa_company_id=${companyId}; ` +
          "Path=/; " +
          "Max-Age=86400; " +
          "SameSite=Lax";
      }

      if (companyName) {
        localStorage.setItem(
          "mappa_company_name",
          companyName,
        );

        document.cookie =
          `mappa_company_name=${encodeURIComponent(companyName)}; ` +
          "Path=/; " +
          "Max-Age=86400; " +
          "SameSite=Lax";
      } else {
        localStorage.removeItem(
          "mappa_company_name",
        );

        document.cookie =
          "mappa_company_name=; Path=/; Max-Age=0; SameSite=Lax";
      }

      toast.success(
        "Bem-vindo!",
        {
          description:
            "Login realizado com sucesso.",
        },
      );

      window.location.replace(
        "/dashboard",
      );
    } catch (error) {
      toast.error(
        "Falha no login",
        {
          description:
            error instanceof Error
              ? error.message
              : "Não foi possível entrar.",
        },
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-white md:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[linear-gradient(150deg,#0A4B84_0%,#0077C8_58%,#00BBD3_100%)] p-12 text-white md:flex md:flex-col">
        <div className="pointer-events-none absolute -right-64 -top-64 h-[580px] w-[580px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-72 -left-72 h-[520px] w-[520px] rounded-full border border-white/10" />

        <div className="relative -ml-[42px] -mt-12 h-48 w-[512px]">
          <Image src="/logo-aqua-mappa_dark.png" alt="Aqua Mappa" fill priority className="object-contain" />
        </div>

        <div className="relative my-auto max-w-xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide ring-1 ring-white/10 backdrop-blur-sm">
            <ShieldCheck size={16} />
            Gestão operacional
          </span>

          <h1 className="text-[44px] font-bold leading-[1.12] tracking-[-0.04em]">
            Gestão completa da
            <br />
            sua operação em campo
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
            Organize agendas, acompanhe técnicos e centralize fotos,
            checklists e medições em um só lugar.
          </p>
        </div>

        <p className="relative text-xs text-white/55">Aqua Mappa · Dashboard</p>
      </section>

      <section className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-[390px] md:translate-y-[29px]">
          <div className="relative -ml-5 mb-7 h-24 w-64 md:hidden">
            <Image src="/logo-aqua-mappa.png" alt="Aqua Mappa" fill priority className="object-contain" />
          </div>

          <div className="mb-5 grid h-[46px] w-[46px] place-items-center rounded-[15px] bg-sky-50 text-[#0077C8]">
            <LockKeyhole size={22} />
          </div>

          <div className="mb-8">
            <h2 className="text-[27px] font-bold tracking-[-0.035em] text-neutral-900">Acessar dashboard</h2>
            <p className="mt-2 text-sm text-neutral-500">Entre com sua conta Aqua Mappa.</p>
          </div>

            <form
              className="space-y-5"
              onSubmit={
                handleSubmit
              }
            >
              <div className="space-y-2">
                <Label htmlFor="email">
                  E-mail
                </Label>

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(
                    event,
                  ) =>
                    setEmail(
                      event.target
                        .value,
                    )
                  }
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Senha
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={
                      showPass
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(
                      event,
                    ) =>
                      setSenha(
                        event.target
                          .value,
                      )
                    }
                    required
                    className="h-11 rounded-xl pr-10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPass(
                        (current) =>
                          !current,
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-800"
                    aria-label={
                      showPass
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                  >
                    {showPass ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="btn-brand h-11 w-full rounded-xl font-semibold text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                    Entrando…
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-neutral-500">
                  Problemas para entrar?
                </p>

                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#0077C8] hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <p className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-neutral-400">
                <ShieldCheck size={14} />
                Acesso seguro à plataforma Aqua Mappa.
              </p>
            </form>
        </div>
      </section>
    </main>
  );
}
