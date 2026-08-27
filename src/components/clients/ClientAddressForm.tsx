"use client";

import * as React from "react";
import {
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/mappa/errors";

import type {
  AddClientAddressInput,
} from "@/app/(private)/clients/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/MaskedInput";

import {
  emptyAddress,
  fetchViaCep,
  onlyDigits,
  type AddressFormState,
} from "./client-form.utils";

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>
  );
}

export default function ClientAddressForm({
  pending,
  onSubmit,
  onCancel,
}: {
  pending: boolean;
  onSubmit: (
    address: AddClientAddressInput,
  ) => Promise<void>;
  onCancel: () => void;
}) {
  const [address, setAddress] =
    React.useState<AddressFormState>(
      emptyAddress,
    );

  const [consultingZipCode, setConsultingZipCode] =
    React.useState(false);

  function updateField<
    Key extends keyof AddressFormState,
  >(
    field: Key,
    value: AddressFormState[Key],
  ) {
    setAddress((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleZipCodeBlur() {
    const digits = onlyDigits(
      address.zipCode,
    );

    if (!digits) {
      return;
    }

    try {
      setConsultingZipCode(true);

      const result =
        await fetchViaCep(digits);

      setAddress((current) => ({
        ...current,
        ...result,
      }));

      toast.success(
        "Endereço preenchido pelo CEP.",
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Não foi possível consultar o CEP.",
        ),
      );
    } finally {
      setConsultingZipCode(false);
    }
  }

  async function handleSubmit() {
    if (!address.street.trim()) {
      toast.error(
        "Informe o endereço.",
      );
      return;
    }

    if (!address.city.trim()) {
      toast.error(
        "Informe a cidade.",
      );
      return;
    }

    if (
      address.state.trim().length !== 2
    ) {
      toast.error(
        "Informe a UF com duas letras.",
      );
      return;
    }

    await onSubmit({
      zipCode: address.zipCode,
      street: address.street,
      number: address.number,
      complement:
        address.complement,
      neighborhood:
        address.neighborhood,
      city: address.city,
      state: address.state,
      isMain: false,
      latitude: null,
      longitude: null,
    });

    setAddress(emptyAddress);
  }

  return (
    <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/40 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="font-semibold text-slate-900">
            Novo local de atendimento
          </h4>

          <p className="mt-1 text-xs text-slate-500">
            Cadastre outra piscina ou endereço atendido para este cliente.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={pending}
        >
          Cancelar
        </Button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-12">
        <div className="sm:col-span-4">
          <FieldLabel>
            CEP
          </FieldLabel>

          <div className="relative">
            <MaskedInput
              mask="99999-999"
              value={address.zipCode}
              onChange={(event) =>
                updateField(
                  "zipCode",
                  event.target.value,
                )
              }
              onBlur={
                handleZipCodeBlur
              }
              disabled={
                pending ||
                consultingZipCode
              }
            />

            {consultingZipCode && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-sky-600" />
            )}
          </div>
        </div>

        <div className="sm:col-span-6">
          <FieldLabel required>
            Cidade
          </FieldLabel>

          <Input
            value={address.city}
            onChange={(event) =>
              updateField(
                "city",
                event.target.value,
              )
            }
            disabled={pending}
          />
        </div>

        <div className="sm:col-span-2">
          <FieldLabel required>
            UF
          </FieldLabel>

          <Input
            maxLength={2}
            value={address.state}
            onChange={(event) =>
              updateField(
                "state",
                event.target.value.toUpperCase(),
              )
            }
            disabled={pending}
            className="text-center"
          />
        </div>

        <div className="sm:col-span-8">
          <FieldLabel required>
            Endereço
          </FieldLabel>

          <Input
            value={address.street}
            onChange={(event) =>
              updateField(
                "street",
                event.target.value,
              )
            }
            disabled={pending}
          />
        </div>

        <div className="sm:col-span-4">
          <FieldLabel>
            Número
          </FieldLabel>

          <Input
            value={address.number}
            onChange={(event) =>
              updateField(
                "number",
                event.target.value,
              )
            }
            disabled={pending}
          />
        </div>

        <div className="sm:col-span-6">
          <FieldLabel>
            Bairro
          </FieldLabel>

          <Input
            value={
              address.neighborhood
            }
            onChange={(event) =>
              updateField(
                "neighborhood",
                event.target.value,
              )
            }
            disabled={pending}
          />
        </div>

        <div className="sm:col-span-6">
          <FieldLabel>
            Complemento
          </FieldLabel>

          <Input
            value={
              address.complement
            }
            onChange={(event) =>
              updateField(
                "complement",
                event.target.value,
              )
            }
            disabled={pending}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          className="btn-brand rounded-xl text-white"
          onClick={handleSubmit}
          disabled={pending}
        >
          {pending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}

          Salvar endereço
        </Button>
      </div>
    </div>
  );
}