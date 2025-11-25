// src/app/(site)/register/RegisterPageClient.tsx
"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

import { toast } from "sonner";
import { startCheckout } from "@/lib/checkout-client";
import { createClientBrowser } from "@/lib/supabase/client"; // 👈 volta Supabase

// ------------------------ SCHEMA ------------------------

const registerSchema = z.object({
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve conter no mínimo 6 caracteres"),
  cpf: z.string().min(11, "CPF é obrigatório"),
  phone: z.string().min(8, "Telefone é obrigatório"),
  companyName: z.string().optional(),
  poolCount: z
    .union([
      z.string().length(0),
      z
        .string()
        .regex(/^\d+$/, "Informe apenas números")
        .transform((v) => Number(v)),
    ])
    .optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
};

type PlanUI = {
  name: string;
  priceLine1: string;
  priceLine2?: string;
  priceLine3?: string;
  sub: string;
  features: string[];
};

const PLAN_DETAILS: Record<string, PlanUI> = {
  starter: {
    name: "STARTER",
    priceLine1: "R$ 89,90 / mês",
    priceLine2: "até 10 piscinas",
    sub: "Para pequenas empresas ou autônomos que estão começando.",
    features: [
      "Rotas e visitas ilimitadas",
      "Leituras químicas + histórico",
      "Checklist configurável",
    ],
  },
  pro: {
    name: "PRO",
    priceLine1: "R$ 79,90/mês",
    priceLine2: "+ R$ 7,90 por piscina adicional",
    priceLine3: "11 a 30 piscinas",
    sub: "Para empresas já estruturadas, com 2 a 3 técnicos.",
    features: [
      "Rotas e visitas ilimitadas",
      "Leituras químicas + histórico",
      "Checklist configurável",
    ],
  },
  business: {
    name: "BUSINESS",
    priceLine1: "R$ 206,90/mês",
    priceLine2: "+ R$ 6,90 por piscina adicional",
    priceLine3: "31 a 50 piscinas",
    sub: "Para empresas médias, com 3 a 5 técnicos em campo.",
    features: [
      "Rotas e visitas ilimitadas",
      "Leituras químicas + histórico",
      "Checklist configurável",
    ],
  },
  enterprise: {
    name: "ENTERPRISE",
    priceLine1: "R$ 244,90/mês",
    priceLine2: "+ R$ 4,90 por piscina adicional",
    priceLine3: "Acima de 50 piscinas",
    sub: "Para grandes empresas e condomínios.",
    features: [
      "Tudo do Business",
      "Customizações avançadas",
      "Suporte premium",
      "Contrato anual opcional",
    ],
  },
};

// ------------------------ PAGE ------------------------

export default function RegisterPageClient() {
  const search = useSearchParams();

  const planKey = (search.get("plan") ?? "starter").toLowerCase();
  const planLabel = PLAN_LABELS[planKey] ?? "Starter";
  const planDetails = PLAN_DETAILS[planKey] ?? PLAN_DETAILS["starter"];

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      cpf: "",
      phone: "",
      companyName: "",
      poolCount: undefined,
    },
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async ({ value }) => {
      const { fullName, email, password, cpf, phone, companyName, poolCount } =
        value;

      try {
        const supabase = createClientBrowser();

        // 1) cria usuário no Supabase com metadados
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              fullName,
              cpf,
              phone,
              companyName: companyName || null,
              poolCount:
                typeof poolCount === "number" ? poolCount : null,
              plan: planKey,
            },
          },
        });

        if (signUpError) {
          console.error("Supabase signUp error:", signUpError);
          throw new Error(signUpError.message || "Falha ao criar conta");
        }

        // 2) inicia o checkout do plano
        await startCheckout(planKey, email.trim());

        toast.success("Redirecionando para pagamento…", {
          description: "Finalize o pagamento para ativar seu plano.",
        });
      } catch (error: any) {
        console.error("Erro no fluxo de cadastro + checkout:", error);
        const message =
          error?.message ?? "Erro ao criar conta ou iniciar o pagamento";

        toast.error("Não foi possível concluir o cadastro", {
          description: message,
        });
      }
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row">
      {/* Coluna esquerda – resumo do plano */}
      <aside className="w-full lg:w-5/12">
        <div className="h-full rounded-3xl bg-[radial-gradient(circle_at_top,_#0ea5e9,_#0369a1)] p-[2px] shadow-xl">
          <div className="h-full rounded-[1.35rem] bg-white/95 p-6">
            <header className="text-center">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">
                {planDetails.name}
              </p>
              <p className="mt-3 text-2xl font-extrabold text-slate-900">
                {planDetails.priceLine1}
              </p>
              {planDetails.priceLine2 && (
                <p className="text-sm font-semibold text-sky-700">
                  {planDetails.priceLine2}
                </p>
              )}
              {planDetails.priceLine3 && (
                <p className="text-sm font-semibold text-sky-700">
                  {planDetails.priceLine3}
                </p>
              )}
              <p className="mt-3 text-sm text-slate-600">
                {planDetails.sub}
              </p>
            </header>

            <hr className="my-5 border-slate-200" />

            <ul className="space-y-3 text-sm text-slate-700">
              {planDetails.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-sky-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs text-slate-500">
              O administrador poderá cadastrar clientes até o limite do plano
              escolhido. Você poderá fazer upgrade depois, se precisar.
            </p>
          </div>
        </div>
      </aside>

      {/* Coluna direita – formulário de cadastro */}
      <section className="w-full lg:w-7/12">
        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                Cadastro do administrador
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Crie sua conta para o plano{" "}
                <span className="text-sky-700">{planLabel}</span>
              </h1>
              <p className="text-sm text-slate-600">
                Esses dados serão usados para acessar o painel e configurar sua
                empresa dentro do Aqua Mappa.
              </p>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              {/* Nome completo */}
              <form.Field
                name="fullName"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Nome completo</Label>
                    <Input
                      id={field.name}
                      placeholder="Ex.: João Silva"
                      autoComplete="name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-destructive">
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Email */}
              <form.Field
                name="email"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>E-mail</Label>
                    <Input
                      id={field.name}
                      type="email"
                      autoComplete="email"
                      placeholder="voce@empresa.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-destructive">
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Senha */}
              <form.Field
                name="password"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Senha</Label>
                    <Input
                      id={field.name}
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-destructive">
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* CPF e Telefone */}
              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field
                  name="cpf"
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label htmlFor={field.name}>CPF</Label>
                      <Input
                        id={field.name}
                        placeholder="Somente números"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.target.value.trim())
                        }
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors[0] && (
                        <p className="text-xs text-destructive">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                />

                <form.Field
                  name="phone"
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label htmlFor={field.name}>Telefone</Label>
                      <Input
                        id={field.name}
                        placeholder="(11) 99999-9999"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors[0] && (
                        <p className="text-xs text-destructive">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Empresa opcional */}
              <form.Field
                name="companyName"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>
                      Nome da empresa{" "}
                      <span className="text-xs text-slate-400">
                        (opcional)
                      </span>
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="Ex.: Aqua Check Piscinas"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              />

              {/* Quantidade de piscinas opcional */}
              <form.Field
                name="poolCount"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>
                      Quantidade aproximada de piscinas atendidas{" "}
                      <span className="text-xs text-slate-400">
                        (opcional)
                      </span>
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="Ex.: 20"
                      inputMode="numeric"
                      value={String(field.state.value ?? "")}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  </div>
                )}
              />

              {/* Botão submit */}
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    className="w-full"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta…
                      </>
                    ) : (
                      "Continuar para pagamento"
                    )}
                  </Button>
                )}
              />

              <p className="mt-2 text-center text-xs text-slate-500">
                Ao continuar, você concorda com os termos de uso e política de
                privacidade do Aqua Mappa.
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
