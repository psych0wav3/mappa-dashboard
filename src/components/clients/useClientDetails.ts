"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  addClientAddress,
  deleteClient,
  getClientById,
  type AddClientAddressInput,
  type Client,
} from "@/app/(private)/clients/actions";

type UseClientDetailsParams = {
  open: boolean;
  clientId: string;
  summary: Client;
  onUpdated?: (client: Client) => void;
  onDeactivate?: () => void;
  onReactivate?: () => void;
  onDeleted?: () => void;
  onClose: () => void;
};

function applyClientStatus(client: Client, active: boolean): Client {
  return {
    ...client,
    active,
    status: active ? "ACTIVE" : "INACTIVE",
  };
}

export default function useClientDetails({
  open,
  clientId,
  summary,
  onUpdated,
  onDeactivate,
  onReactivate,
  onDeleted,
  onClose,
}: UseClientDetailsParams) {
  const [client, setClient] = React.useState<Client>(summary);
  const [loading, setLoading] = React.useState(false);
  const [savingAddress, setSavingAddress] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const onUpdatedRef = React.useRef(onUpdated);

  React.useEffect(() => {
    onUpdatedRef.current = onUpdated;
  }, [onUpdated]);

  React.useEffect(() => {
    setClient(summary);
  }, [summary]);

  const updateClient = React.useCallback((updatedClient: Client) => {
    setClient(updatedClient);
    onUpdatedRef.current?.(updatedClient);
  }, []);

  const loadClientDetails = React.useCallback(async () => {
    const details = await getClientById(clientId);

    const normalizedDetails = applyClientStatus(
      details,
      summary.active,
    );

    updateClient(normalizedDetails);

    return normalizedDetails;
  }, [clientId, summary.active, updateClient]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const details = await getClientById(clientId);

        if (!mounted) {
          return;
        }

        const normalizedDetails = applyClientStatus(
          details,
          summary.active,
        );

        updateClient(normalizedDetails);
      } catch (error) {
        if (!mounted) {
          return;
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados do cliente.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [
    clientId,
    open,
    summary.active,
    updateClient,
  ]);

  const handleAddAddress = React.useCallback(
    async (address: AddClientAddressInput) => {
      try {
        setSavingAddress(true);

        await addClientAddress(
          clientId,
          address,
        );

        await loadClientDetails();

        toast.success(
          "Endereço adicionado com sucesso.",
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível adicionar o endereço.";

        toast.error(message);

        throw error;
      } finally {
        setSavingAddress(false);
      }
    },
    [
      clientId,
      loadClientDetails,
    ],
  );

  const handleDeactivate = React.useCallback(() => {
    if (!onDeactivate) {
      return;
    }

    onDeactivate();

    setClient((current) =>
      applyClientStatus(
        current,
        false,
      ),
    );

    onClose();
  }, [
    onClose,
    onDeactivate,
  ]);

  const handleReactivate = React.useCallback(() => {
    if (!onReactivate) {
      return;
    }

    onReactivate();

    setClient((current) =>
      applyClientStatus(
        current,
        true,
      ),
    );

    onClose();
  }, [
    onClose,
    onReactivate,
  ]);

  const handleDelete = React.useCallback(async () => {
    if (client.active) {
      toast.error(
        "Inative o cliente antes de excluí-lo.",
      );

      return false;
    }

    try {
      setDeleting(true);

      await deleteClient(
        clientId,
      );

      toast.success(
        "Cliente excluído definitivamente.",
      );

      onDeleted?.();
      onClose();

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o cliente.",
      );

      return false;
    } finally {
      setDeleting(false);
    }
  }, [
    client.active,
    clientId,
    onClose,
    onDeleted,
  ]);

  return {
    client,
    loading,
    savingAddress,
    deleting,
    busy:
      savingAddress ||
      deleting,
    handleAddAddress,
    handleDeactivate,
    handleReactivate,
    handleDelete,
  };
}