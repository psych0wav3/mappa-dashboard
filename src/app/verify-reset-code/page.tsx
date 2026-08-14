"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { OtpInput } from "@/components/auth/OtpInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  forgotPassword,
  verifyResetCode,
} from "@/lib/auth-password-reset";

function VerifyResetCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();
  const expiresInMinutes = searchParams.get("expiresInMinutes");

  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);

  if (!email) {
    return (
      <Card className="border-0 shadow-2xl">
        <CardHeader>
          <CardTitle>Código de verificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-500">
            Não encontramos o e-mail desta recuperação. Solicite um novo
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

    if (!/^\d{6}$/.test(code)) {
      toast.error("Informe o código de 6 dígitos.");
      return;
    }

    setLoading(true);
    try {
      await verifyResetCode(email, code);

      const params = new URLSearchParams({
        email,
        code,
      });

      router.push(`/reset-password?${params.toString()}`);
    } catch (error) {
      toast.error("Código inválido", {
        description:
          error instanceof Error
            ? error.message
            : "Código inválido ou expirado.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resending) return;

    setResending(true);
    try {
      const result = await forgotPassword(email);
      toast.success("Código reenviado", {
        description:
          result.message ||
          "Se o e-mail estiver cadastrado, enviaremos um código.",
      });
    } catch (error) {
      toast.error("Não foi possível reenviar", {
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente em instantes.",
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader>
        <CardTitle>Digite o código</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <p className="text-sm text-neutral-500">
            Enviamos um código de 6 dígitos para{" "}
            <span className="font-medium text-neutral-700">{email}</span>
            {expiresInMinutes
              ? `. Ele expira em ${expiresInMinutes} minutos.`
              : "."}
          </p>

          <div className="space-y-2">
            <Label>Código</Label>
            <OtpInput
              value={code}
              onChange={setCode}
              length={6}
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full text-center text-sm font-medium text-sky-700 underline-offset-2 hover:underline disabled:opacity-60"
          >
            {resending ? "Reenviando..." : "Reenviar código"}
          </button>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando…
              </>
            ) : (
              "Continuar"
            )}
          </Button>

          <div className="text-center">
            <Link
              href={`/forgot-password?email=${encodeURIComponent(email)}`}
              className="text-xs underline"
            >
              Usar outro e-mail
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function VerifyResetCodePage() {
  return (
    <AuthShell title="Código de verificação">
      <React.Suspense fallback={null}>
        <VerifyResetCodeForm />
      </React.Suspense>
    </AuthShell>
  );
}
