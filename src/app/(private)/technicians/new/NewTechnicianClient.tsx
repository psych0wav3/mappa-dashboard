"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createTechnician } from "@/app/(private)/technicians/actions";

export default function NewTechnicianClient() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("123456");
  const [phone, setPhone] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const canSubmit =
    name.trim().length >= 2 &&
    email.trim().length > 0 &&
    password.trim().length >= 6 &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);

      await createTechnician({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim() || undefined,
      });

      router.push("/technicians?created=1");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Erro ao criar técnico.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Nome completo
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Senha inicial
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Telefone
          </label>
          <input
            type="text"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Voltar
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/technicians")}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`rounded-md px-3 py-2 text-sm font-medium text-white ${
              canSubmit
                ? "bg-[color:var(--ac-blue-600,#0ea5e9)] hover:bg-[color:var(--ac-blue-700,#0284c7)]"
                : "cursor-not-allowed bg-sky-200"
            }`}
          >
            {submitting ? "Criando..." : "Criar técnico"}
          </button>
        </div>
      </div>
    </form>
  );
}