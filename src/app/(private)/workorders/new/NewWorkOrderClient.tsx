"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type ClientLite = {
  id: string;
  firstName?: string;
  lastName?: string;
  street?: string | null;
  number?: string | null;
  city?: string | null;
  uf?: string | null;
  lat?: number | null;
  lng?: number | null;
};

type TechLite = { id: string; name: string; email?: string | null };

type InitialWO = {
  id: string;
  clientId: string;
  technicianId: string | null;
  title: string;
  description: string | null;
  amountCents: number | null;
  scheduledDate: string | null; // YYYY-MM-DD
  startTime: string | null;     // HH:mm
  endTime: string | null;       // HH:mm
};

type Props = {
  mode: "create" | "edit";
  clients: ClientLite[];
  technicians: TechLite[];
  initial?: InitialWO;
};

export default function NewWorkOrderClient({ mode, clients, technicians, initial }: Props) {
  const router = useRouter();

  // Helpers de máscara de moeda
  const formatCurrency = (cents: number) =>
    `R$ ${ (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }`;

  const [clientId, setClientId] = React.useState<string>(initial?.clientId ?? "");
  const [techId, setTechId] = React.useState<string>(initial?.technicianId ?? "");
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [date, setDate] = React.useState<string>(initial?.scheduledDate ?? "");
  const [startTime, setStartTime] = React.useState<string>(initial?.startTime ?? "");
  const [endTime, setEndTime] = React.useState<string>(initial?.endTime ?? "");

  // amountMasked: "R$ 1.234,56"
  const [amountMasked, setAmountMasked] = React.useState<string>(() => {
    if (initial?.amountCents != null) return formatCurrency(initial.amountCents);
    return "";
  });

  const [submitting, setSubmitting] = React.useState(false);

  function onAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, ""); // only numbers
    if (!digits) {
      setAmountMasked("");
      return;
    }
    const cents = parseInt(digits, 10);
    setAmountMasked(formatCurrency(cents));
  }

  function parseAmountToCents(masked: string): number | null {
    const digits = masked.replace(/\D/g, ""); // "123456"
    return digits ? parseInt(digits, 10) : null;
  }

  function formatClient(c: ClientLite) {
    const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Cliente";
    const addr1 = [c.street, c.number].filter(Boolean).join(", ");
    const addr2 = [c.city, c.uf].filter(Boolean).join(" - ");
    const addr = [addr1, addr2].filter(Boolean).join(" • ");
    return `${name}${addr ? ` — ${addr}` : ""}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);

      const payload = {
        clientId: clientId,
        technicianId: techId || null,
        title: title.trim(),
        description: (description ?? "").trim() || null,
        amountCents: parseAmountToCents(amountMasked),
        date: date || null,
        startTime: startTime || null,
        endTime: endTime || null,
      };

      if (mode === "create") {
        const mod = await import("../actions");
        await (mod as any).createWorkOrder(payload);
      } else {
        if (!initial?.id) throw new Error("ID da OS não encontrado para edição.");
        const mod = await import("../actions");
        await (mod as any).updateWorkOrder(initial.id, payload);
      }

      router.push("/workorders");
      router.refresh?.();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar OS.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = !!title.trim() && !!clientId && !submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cliente */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Cliente / Local</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-sky-400"
        >
          <option value="">— Buscar cliente —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{formatClient(c)}</option>
          ))}
        </select>
      </div>

      {/* Técnico */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Técnico responsável</label>
        <select
          value={techId}
          onChange={(e) => setTechId(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-sky-400"
        >
          <option value="">— selecionar técnico —</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Título */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Título</label>
        <input
          type="text"
          placeholder="Ex.: Troca de areia do filtro"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-sky-400"
        />
      </div>

      {/* Descrição */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Descrição</label>
        <textarea
          placeholder="Detalhe o serviço a ser executado..."
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-sky-400"
        />
      </div>

      {/* Valor (com máscara R$ XXX,xx) */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Valor (opcional)</label>
        <input
          inputMode="numeric"
          placeholder="R$ 0,00"
          value={amountMasked}
          onChange={onAmountChange}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-sky-400"
        />
      </div>

      {/* Agenda */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Agendar para</label>
          <input
            type="date"
            value={date ?? ""}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-sky-400"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Hora (início)</label>
          <input
            type="time"
            value={startTime ?? ""}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-sky-400"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Hora (fim)</label>
          <input
            type="time"
            value={endTime ?? ""}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-sky-400"
          />
        </div>
      </div>

      {/* Rodapé de ações */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Voltar
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/workorders")}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white ${
              canSubmit
                ? "bg-[color:var(--ac-blue-600,#0ea5e9)] hover:bg-[color:var(--ac-blue-700,#0284c7)]"
                : "bg-sky-200 cursor-not-allowed"
            }`}
          >
            {submitting ? (mode === "edit" ? "Salvando..." : "Criando...") : (mode === "edit" ? "Salvar" : "Criar OS")}
          </button>
        </div>
      </div>
    </form>
  );
}
