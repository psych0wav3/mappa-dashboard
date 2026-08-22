"use client";

import * as React from "react";

import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="relative hidden md:block">
        <div className="absolute inset-0 btn-brand" />

        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

        <div className="relative flex h-full w-full flex-col p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <span className="font-bold">
                A
              </span>
            </div>

            <div className="text-xl font-semibold tracking-tight">
              Aqua Mappa
            </div>
          </div>

          <div className="flex flex-1 items-center">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight">
                Gerencie rotas,
                <br />

                visitas e relatórios
              </h2>

              <p className="max-w-md text-white/80">
                Dashboard para criar
                agendas, acompanhar
                técnicos e centralizar
                fotos, checklists e
                medições.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-sm border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>
              Entrar
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form
              className="space-y-4"
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
                    className="pr-10"
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
                className="w-full"
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

              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  Problemas para entrar?
                </p>

                <Link
                  href="/forgot-password"
                  className="text-xs underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}