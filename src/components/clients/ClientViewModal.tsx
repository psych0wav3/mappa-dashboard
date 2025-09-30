// src/components/clients/ClientViewModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function ClientViewModal({ client }: { client: any }) {
  const preventClose = (e: Event) => e.preventDefault();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 text-white"
          aria-label="Ver cliente"
          title="Visualizar"
        >
          <Eye size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl" onInteractOutside={preventClose} onEscapeKeyDown={preventClose}>
        <DialogHeader>
          <DialogTitle>Ficha do Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Nome:</strong> {client.firstName} {client.lastName}</div>
            <div><strong>Email:</strong> {client.email}</div>
            <div><strong>Telefone:</strong> {client.phone ?? "—"}</div>
            <div><strong>CPF:</strong> {client.cpf ?? "—"}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><strong>Rua:</strong> {client.street ?? "—"}</div>
            <div><strong>Número:</strong> {client.number ?? "—"}</div>
            <div><strong>Bairro:</strong> {client.district ?? "—"}</div>
            <div><strong>Cidade/UF:</strong> {client.city ?? "—"} {client.uf ? `- ${client.uf}` : ""}</div>
            <div><strong>CEP:</strong> {client.cep ?? "—"}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><strong>Tamanho da piscina:</strong> {client.poolSize ?? "—"}</div>
            <div><strong>Periodicidade (dias):</strong> {client.cleaningFrequency ?? "—"}</div>
            <div><strong>Janela de horário:</strong> {client.cleaningWindow ?? "—"}</div>
            <div><strong>Dia de pagamento:</strong> {client.payDay ?? "—"}</div>
          </div>

          <div>
            <strong>Informações úteis:</strong>
            <p className="mt-1 whitespace-pre-wrap">{client.notes ?? "—"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
