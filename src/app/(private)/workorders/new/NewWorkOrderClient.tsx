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

type Props =
  | {
      mode?: "new";
      clients: ClientLite[];
      technicians: TechLite[];
      initial?: undefined;
    }
  | {
      mode: "edit";
      clients: ClientLite[];
      technicians: TechLite[];
      initial: {
        id: string;
        code: string;
        clientId: string;
        technicianId: string | null;
        title: string;
        description: string | null;
        amountCents: number | null;
        scheduledDate: string | null; // YYYY-MM-DD
        startTime: string | null;
        endTime: string | null;
      };
    };

export default function NewWorkOrderClient(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";

  const [clientId, setClientId] = React.useState<string>(
    isEdit ? props.initial.clientId : ""
  );
  const [techId, setTechId] = React.useState<string>(
    isEdit ? props.initial.technicianId ?? "" : ""
  );
  const [title, setTitle] = React.useState<string>(
    isEdit ? props.initial.title : ""
  );
  const [description, setDescription] = React.useState<string>(
    isEdit && props.initial.description ? props.initial.description : ""
  );

  // ---------- Valor (com máscara BRL) ----------
  const initialCents =
    isEdit && props.initial.amountCents != null ? props.initial.amountCents : null;

  const [amountCents, setAmountCents] = React.useState<number | null>(
    initialCents
  );

  const [amountStr, setAmountStr] = React.useState<string>(
    initialCents != null
      ? (initialCents / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : ""
  );

  function formatCentsToBRL(cents: number) {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, ""); // só números
    if (!digits) {
      setAmountCents(null);
      setAmountStr("");
      return;
    }
    const cents = Number(digits);
    setAmountCents(cents);
    setAmountStr(formatCentsToBRL(cents));
  }

  function handleAmountPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const digits = pasted.replace(/\D/g, "");
    if (!digits) {
      setAmountCents(null);
      setAmountStr("");
      return;
    }
    const cents = Number(digits);
    setAmountCents(cents);
    setAmountStr(formatCentsToBRL(cents));
  }
  // --------------------------------------------

  const [date, setDate] = React.useState<string>(
    isEdit && props.initial.scheduledDate ? props.initial.scheduledDate : ""
  );
  const [startTime, setStartTime] = React.useState<string>(
    isEdit && props.initial.startTime ? props.initial.startTime : ""
  );
  const [endTime, setEndTime] = React.useState<string>(
    isEdit && props.initial.endTime ? props.initial.endTime : ""
  );

  const [submitting, setSubmitting] = React.useState(false);

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
        clientId: clientId || null,
        technicianId: techId || null,
        title: title.trim(),
        description: description || null,
        amountCents: amountCents, // já em centavos (ou null)
        date: date || null, // YYYY-MM-DD
        startTime: startTime || null,
        endTime: endTime || null,
      };

      const mod = await import("../actions");

      if (isEdit) {
        const res = await (mod as any).updateWorkOrder(props.initial.id, payload);
        if (!res?.id) throw new Error("Falha ao atualizar OS.");
        router.push("/workorders");
        router.refresh?.();
      } else {
        const res = await (mod as any).createWorkOrder(payload);
        if (!res?.id) throw new Error("Falha ao criar OS.");
        router.push("/workorders");
        router.refresh?.();
      }
    } catch (err) {
      console.error(err);
      alert(isEdit ? "Erro ao salvar alterações." : "Erro ao criar OS.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = !!title.trim() && !!clientId && !submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cliente */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Cliente / Local
        </label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
        >
          <option value="">— Buscar cliente —</option>
          {props.clients.map((c) => (
            <option key={c.id} value={c.id}>
              {formatClient(c)}
            </option>
          ))}
        </select>
      </div>

      {/* Técnico */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Técnico responsável
        </label>
        <select
          value={techId}
          onChange={(e) => setTechId(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
        >
          <option value="">— selecionar técnico —</option>
          {props.technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Título */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Título
        </label>
        <input
          type="text"
          placeholder="Ex.: Troca de areia do filtro"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
      </div>

      {/* Descrição */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Descrição
        </label>
        <textarea
          placeholder="Detalhe o serviço a ser executado..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
      </div>

      {/* Valor (com máscara R$) */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          Valor (opcional)
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="R$ 0,00"
          value={amountStr}
          onChange={handleAmountChange}
          onPaste={handleAmountPaste}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
        />
      </div>

      {/* Agenda */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Agendar para
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Hora (início)
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Hora (fim)
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
          />
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
            onClick={() => router.push("/workorders")}
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
            {submitting ? (isEdit ? "Salvando..." : "Criando...") : isEdit ? "Salvar" : "Criar OS"}
          </button>
        </div>
      </div>
    </form>
  );
}
