"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const { hash } = window.location;

    if (hash && hash.includes("type=recovery")) {
      router.replace(`/reset-password${hash}`);
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      console.log("LOGIN URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`);
console.log("LOGIN PAYLOAD:", {
  email: email.trim(),
  password: senha,
});
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: senha,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(errorText || "E-mail ou senha inválidos.");
      }

      const data = await response.json();

      const accessToken = data.accessToken ?? data.AccessToken;

      const companyId =
        data.roles?.[0]?.companyId ??
        data.roles?.[0]?.CompanyId ??
        data.user?.roles?.[0]?.companyId ??
        data.user?.roles?.[0]?.CompanyId;

      if (!accessToken) {
        throw new Error("Token não retornado pela API.");
      }

      if (!companyId) {
        console.log("DATA LOGIN:", data);
        throw new Error("Empresa não encontrada para este usuário.");
      }

      localStorage.setItem("mappa_access_token", accessToken);
      localStorage.setItem("mappa_company_id", companyId);
      localStorage.setItem("mappa_user", JSON.stringify(data.user ?? data.User));
      localStorage.setItem("mappa_roles", JSON.stringify(data.roles ?? data.Roles));

      document.cookie = `mappa_access_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `mappa_company_id=${companyId}; path=/; max-age=86400; SameSite=Lax`;

      toast.success("Bem-vindo!", {
        description: "Login realizado com sucesso.",
      });

      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Falha no login", {
        description:
          error instanceof Error ? error.message : "Não foi possível entrar.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="relative hidden md:block">
        <div className="absolute inset-0 btn-brand" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

        <div className="relative h-full w-full flex flex-col p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
              <span className="font-bold">P</span>
            </div>

            <div className="text-xl font-semibold tracking-tight">
              Aqua Mappa.
            </div>
          </div>

          <div className="flex-1 flex items-center">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight">
                Gerencie rotas, <br /> visitas e relatórios
              </h2>

              <p className="max-w-md text-white/80">
                Dashboard para criar agendas, acompanhar técnicos e centralizar
                fotos, checklist e medições.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-sm border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-800"
                    aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
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

                <Link href="/forgot-password" className="text-xs underline">
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