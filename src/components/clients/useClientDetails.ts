"use client";

import * as React from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/mappa/errors";

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
  onDeactivate?: () => Promise<boolean>;
  onReactivate?: () => Promise<boolean>;
  onDeleted?: () => void;
  onClose: () => void;
};

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
  const [updatingStatus, setUpdatingStatus] = React.useState(false);
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
    updateClient(details);
    return details;
  }, [clientId, updateClient]);

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

        updateClient(details);
      } catch (error) {
        if (!mounted) {
          return;
        }

        toast.error(
          getErrorMessage(
            error,
            "Não foi possível carregar os dados do cliente.",
          ),
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
          getErrorMessage(
            error,
            "Não foi possível adicionar o endereço.",
          );

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

  const handleDeactivate = React.useCallback(async () => {
    if (!onDeactivate) {
      return;
    }

    setUpdatingStatus(true);

    try {
      const updated = await onDeactivate();

      if (updated) {
        setClient((current) => ({
          ...current,
          active: false,
          status: "INACTIVE",
        }));
        onClose();
      }
    } finally {
      setUpdatingStatus(false);
    }
  }, [
    onClose,
    onDeactivate,
  ]);

  const handleReactivate = React.useCallback(async () => {
    if (!onReactivate) {
      return;
    }

    setUpdatingStatus(true);

    try {
      const updated = await onReactivate();

      if (updated) {
        setClient((current) => ({
          ...current,
          active: true,
          status: "ACTIVE",
        }));
        onClose();
      }
    } finally {
      setUpdatingStatus(false);
    }
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
        getErrorMessage(
          error,
          "Não foi possível excluir o cliente.",
        ),
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
      updatingStatus ||
      deleting,
    handleAddAddress,
    handleDeactivate,
    handleReactivate,
    handleDelete,
  };
}