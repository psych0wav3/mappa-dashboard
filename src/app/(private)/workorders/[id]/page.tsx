// src/app/(private)/workorders/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getWorkOrderById, cancelWorkOrder, sendWorkOrderForApproval } from "../actions";
import Link from "next/link";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        {children}
      </div>
    </div>
  );
}

export default async function WorkOrderViewPage({ params }: { params: { id: string } }) {
  const wo = await getWorkOrderById(params.id);
  if (!wo) return notFound();

  const clientName = `${wo.client?.firstName ?? ""} ${wo.client?.lastName ?? ""}`.trim();
  const techName = wo.technician
    ? `${wo.technician.firstName ?? ""} ${wo.technician.lastName ?? ""}`.trim()
    : "—";
  const date = wo.scheduledDate ? wo.scheduledDate.toISOString().slice(0, 10) : "—";
  const start = wo.startTime ?? "—";
  const end = wo.endTime ?? "—";
  const amount =
    wo.amountCents != null
      ? (wo.amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "—";

  // --- AÇÕES SERVER ---

  // Cancelar e VOLTAR para /workorders
  async function cancel() {
    "use server";
    await cancelWorkOrder(wo.id);
    redirect("/workorders");
  }

  // Enviar para aprovação (stub): mantém na página por enquanto
  async function sendApproval() {
    "use server";
    await sendWorkOrderForApproval(wo.id);
    // Se quiser também voltar, troque por: redirect("/workorders");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Título */}
      <div className="mb-4 mt-4 rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-800 shadow-sm">
        <h1 className="text-lg font-semibold">Ordem de Serviço {wo.code}</h1>
        <div className="mt-1 text-sm text-slate-600">
          Status: <span className="font-medium">{wo.status}</span>
        </div>
      </div>

      {/* Card de detalhes */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cliente">{clientName || "—"}</Field>
          <Field label="Técnico responsável">{techName}</Field>
          <Field label="Título">{wo.title}</Field>
          <Field label="Valor">{amount}</Field>
          <Field label="Agendada para">{date}</Field>
          <Field label="Hora (início)">{start}</Field>
          <Field label="Hora (fim)">{end}</Field>
        </div>

        <Field label="Descrição">{wo.description ?? "—"}</Field>

        {/* Ações */}
        <div className="mt-6 flex items-center justify-between">
          <form action={cancel}>
            <button className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancelar OS
            </button>
          </form>

          <div className="flex items-center gap-2">
            <form action={sendApproval}>
              <button className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Enviar para aprovação
              </button>
            </form>

            <Link href={`/workorders/${wo.id}/edit`}>
              <button className="rounded-md bg-[color:var(--ac-blue-600,#0ea5e9)] px-3 py-2 text-sm font-medium text-white hover:bg-[color:var(--ac-blue-700,#0284c7)]">
                Editar
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
