// src/components/technicians/TechnicianViewModal.tsx
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

export default function TechnicianViewModal({ technician }: { technician: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 text-white"
          aria-label="Ver técnico"
          title="Visualizar"
        >
          <Eye size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ficha do Técnico</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Nome:</strong> {technician.firstName} {technician.lastName}
            </div>
            <div>
              <strong>Email:</strong> {technician.email}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Telefone:</strong> {technician.phone ?? "—"}
            </div>
            <div>
              <strong>CPF:</strong> {technician.cpf ?? "—"}
            </div>
          </div>

          <div>
            <strong>Status:</strong>{" "}
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                technician.active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {technician.active ? "Ativo" : "Inativo"}
            </span>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Endereço</h4>
            <p>
              {technician.street ?? "—"}, {technician.number ?? "s/n"}{" "}
              {technician.district && `- ${technician.district}`}
            </p>
            <p>
              {technician.city ?? ""} - {technician.uf ?? ""}
            </p>
            <p>{technician.cep ?? ""}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
