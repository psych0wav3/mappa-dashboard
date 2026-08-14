"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-password-reset";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();
  const code = (searchParams.get("code") ?? "").trim();

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  if (!email || !/^\d{6}$/.test(code)) {
    return (
      <Card className="border-0 shadow-2xl">
        <CardHeader>
          <CardTitle>Nova senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-500">
            Esta recuperação expirou ou está incompleta. Solicite um novo
            código.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-black px-4 text-sm text-white transition hover:opacity-90"
          >
            Voltar
          </Link>
        </CardContent>
      </Card>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email, code, newPassword);

      toast.success("Senha alterada", {
        description:
          result.message ||
          "Senha alterada com sucesso. Você já pode fazer login.",
      });

      router.replace("/login");
    } catch (error) {
      toast.error("Não foi possível redefinir a senha", {
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente em instantes.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader>
        <CardTitle>Defina uma nova senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <p className="text-sm text-neutral-500">
            Escolha uma senha com no mínimo 6 caracteres para acessar sua
            conta.
          </p>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass((current) => !current)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-800"
                aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirme a nova senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((current) => !current)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-800"
                aria-label={
                  showConfirm ? "Ocultar senha" : "Mostrar senha"
                }
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando…
              </>
            ) : (
              "Salvar nova senha"
            )}
          </Button>

          <div className="text-center">
            <Link
              href={`/verify-reset-code?email=${encodeURIComponent(email)}`}
              className="text-xs underline"
            >
              Voltar ao código
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Nova senha">
      <React.Suspense fallback={null}>
        <ResetPasswordForm />
      </React.Suspense>
    </AuthShell>
  );
}
