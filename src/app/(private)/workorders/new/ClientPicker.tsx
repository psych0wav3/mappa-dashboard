"use client";

import * as React from "react";
import ClientSearchCombobox, {
  type ClientLite,
} from "@/components/routes/ClientSearchCombobox";

export default function ClientPicker({ clients }: { clients: ClientLite[] }) {
  const [clientId, setClientId] = React.useState<string>("");

  return (
    <div>
      <ClientSearchCombobox
        clients={clients}
        value={clientId}
        onChange={setClientId}
        label="Cliente / Local"
        placeholder="Buscar cliente ou endereço…"
      />
      {/* Enviado no submit do form */}
      <input type="hidden" name="clientId" value={clientId} />
    </div>
  );
}
