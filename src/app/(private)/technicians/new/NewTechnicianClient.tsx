"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createTechnician } from "@/app/(private)/technicians/actions";

type Role = "OWNER" | "TECH";

export default function NewTechnicianClient() {
  const router = useRouter();

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [cpf, setCpf] = React.useState("");
  const [role, setRole] = React.useState<Role>("TECH");

  const [submitting, setSubmitting] = React.useState(false);

  const canSubmit =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    email.trim().length > 0 &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      await createTechnician({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        cpf: cpf.trim() || undefined,
        role,
        active: true,
      } as any);

      // Volta para a listagem de técnicos
      router.push("/technicians");
      router.refresh?.();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar técnico.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Nome
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Sobrenome
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
        </div>
      </div>

      {/* Email */}
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

      {/* Telefone / CPF */}
      <div className="grid gap-3 sm:grid-cols-2">
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

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            CPF
          </label>
          <input
            type="text"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
        </div>
      </div>

      {/* Cargo */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Cargo
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
        >
          <option value="TECH">Técnico</option>
          <option value="OWNER">Administrador</option>
        </select>
      </div>

      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-700">
        <div>
          <span className="font-medium">Administrador:</span> acesso total ao sistema.
        </div>
        <div>
          <span className="font-medium">Técnico:</span> acesso aos clientes/visitas atribuídos.
        </div>
      </div>

      {/* Rodapé */}
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
