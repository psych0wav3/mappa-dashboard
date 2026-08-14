"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import { forgotPassword } from "@/lib/auth-password-reset";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState(
    searchParams.get("email") ?? "",
  );
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      toast.error("Informe um e-mail válido.");
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword(normalizedEmail);

      toast.success("Código enviado", {
        description:
          result.message ||
          "Se o e-mail estiver cadastrado, enviaremos um código.",
      });

      const params = new URLSearchParams({
        email: normalizedEmail,
        expiresInMinutes: String(result.expiresInMinutes ?? 15),
      });

      router.push(`/verify-reset-code?${params.toString()}`);
    } catch (error) {
      toast.error("Não foi possível enviar o código", {
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
        <CardTitle>Recuperar acesso</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <p className="text-sm text-neutral-500">
            Informe o e-mail da sua conta. Enviaremos um código de 6
            dígitos para redefinir a senha.
          </p>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@empresa.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando…
              </>
            ) : (
              "Enviar código"
            )}
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-xs underline">
              Voltar para o login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Esqueci minha senha">
      <React.Suspense fallback={null}>
        <ForgotPasswordForm />
      </React.Suspense>
    </AuthShell>
  );
}
