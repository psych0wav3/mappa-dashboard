// src/app/login/page.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClientBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get("redirectTo") || "/dashboard";

  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // 👇 Se o link de recuperação cair no /login, enviamos para /reset-password mantendo o hash
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const { hash } = window.location; // ex.: #access_token=...&type=recovery
    if (hash && hash.includes("type=recovery")) {
      router.replace(`/reset-password${hash}`);
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const supabase = createClientBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    setLoading(false);

    if (error) {
      toast.error("Falha no login", { description: error.message });
      return;
    }

    toast.success("Bem-vindo!", { description: "Login realizado com sucesso." });
    router.replace(redirectTo);
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Lado esquerdo (hero) */}
      <div className="relative hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="relative h-full w-full flex flex-col justify-between p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
              <span className="font-bold">P</span>
            </div>
            <div className="text-xl font-semibold tracking-tight">PiscinApp</div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Gerencie rotas, <br /> visitas e relatórios
            </h2>
            <p className="max-w-md text-white/80">
              Dashboard para criar agendas, acompanhar técnicos e centralizar fotos, checklist e medições.
            </p>
          </div>

          <div className="relative aspect-[3/2] w-4/5 max-w-lg self-end">
            <Image
              src="/hero-pool.jpg"
              alt="Piscina"
              fill
              className="object-cover rounded-2xl ring-1 ring-white/20 shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>

      {/* Lado direito (form) */}
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
                <p className="text-xs text-neutral-500">Problemas para entrar?</p>
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
