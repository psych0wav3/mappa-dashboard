"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Save,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  createAdminWorkOrder,
  type WorkOrderCustomerOption,
} from "../actions";

type ServiceType =
  | "POOL_CLEANING"
  | "EQUIPMENT_REPAIR"
  | "SAND_REPLACEMENT"
  | "PRODUCT_SALE"
  | "TECHNICAL_VISIT"
  | "OTHER";

const SERVICE_TYPES: Array<{
  value: ServiceType;
  label: string;
  description: string;
  defaultTitle: string;
}> = [
  {
    value: "POOL_CLEANING",
    label: "Limpeza avulsa",
    description:
      "Limpeza pontual de piscina fora de um plano recorrente.",
    defaultTitle: "Limpeza avulsa de piscina",
  },
  {
    value: "EQUIPMENT_REPAIR",
    label: "Reparo de equipamento",
    description:
      "Reparo de bomba, filtro, aquecedor ou outro equipamento.",
    defaultTitle: "Reparo de equipamento",
  },
  {
    value: "SAND_REPLACEMENT",
    label: "Troca de areia",
    description:
      "Retirada e substituição da areia do filtro da piscina.",
    defaultTitle: "Troca de areia do filtro",
  },
  {
    value: "PRODUCT_SALE",
    label: "Venda ou entrega de produto",
    description:
      "Venda, entrega ou aplicação pontual de produto.",
    defaultTitle: "Venda ou entrega de produto",
  },
  {
    value: "TECHNICAL_VISIT",
    label: "Visita técnica",
    description:
      "Diagnóstico, avaliação ou orçamento no local.",
    defaultTitle: "Visita técnica",
  },
  {
    value: "OTHER",
    label: "Outro serviço",
    description:
      "Outro atendimento avulso que não se enquadra nas opções anteriores.",
    defaultTitle: "",
  },
];

function todayIso() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();

  return new Date(
    now.getTime() - timezoneOffset * 60_000,
  )
    .toISOString()
    .slice(0, 10);
}

function parseMoney(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return 0;
  }

  let normalized = cleanValue.replace(
    /[^\d,.-]/g,
    "",
  );

  if (
    normalized.includes(",") &&
    normalized.includes(".")
  ) {
    normalized = normalized
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function serviceTypeLabel(type: ServiceType) {
  return (
    SERVICE_TYPES.find(
      (serviceType) => serviceType.value === type,
    )?.label || "Serviço avulso"
  );
}

export default function NewWorkOrderClient({
  customers,
}: {
  customers: WorkOrderCustomerOption[];
}) {
  const router = useRouter();

  const [pending, startTransition] =
    React.useTransition();

  const [serviceType, setServiceType] =
    React.useState<ServiceType>("TECHNICAL_VISIT");

  const [customerId, setCustomerId] =
    React.useState("");

  const [title, setTitle] =
    React.useState("Visita técnica");

  const [description, setDescription] =
    React.useState("");

  const [scheduledDate, setScheduledDate] =
    React.useState(todayIso());

  const [totalAmount, setTotalAmount] =
    React.useState("");

  const selectedCustomer = React.useMemo(
    () =>
      customers.find(
        (customer) => customer.id === customerId,
      ) || null,
    [customers, customerId],
  );

  function handleServiceTypeChange(
    nextServiceType: ServiceType,
  ) {
    const nextOption = SERVICE_TYPES.find(
      (item) => item.value === nextServiceType,
    );

    setServiceType(nextServiceType);

    if (!nextOption) {
      return;
    }

    const currentDefaultTitles = SERVICE_TYPES
      .map((item) => item.defaultTitle)
      .filter(Boolean);

    if (
      !title.trim() ||
      currentDefaultTitles.includes(title.trim())
    ) {
      setTitle(nextOption.defaultTitle);
    }
  }

  function handleSubmit() {
    if (!selectedCustomer) {
      toast.error("Selecione o cliente/piscina.");
      return;
    }

    if (!selectedCustomer.hasValidAddress) {
      toast.error(
        "O cliente selecionado não possui endereço principal válido.",
      );

      return;
    }

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      toast.error(
        "Informe o título da ordem de serviço.",
      );

      return;
    }

    if (!scheduledDate) {
      toast.error("Informe a data agendada.");
      return;
    }

    const parsedTotalAmount =
      parseMoney(totalAmount);

    if (parsedTotalAmount < 0) {
      toast.error(
        "O valor total não pode ser negativo.",
      );

      return;
    }

    const typeDescription =
      `Tipo de atendimento: ${serviceTypeLabel(
        serviceType,
      )}.`;

    const cleanDescription =
      description.trim();

    const finalDescription = cleanDescription
      ? `${typeDescription}\n\n${cleanDescription}`
      : typeDescription;

    startTransition(async () => {
      try {
        await createAdminWorkOrder({
          customerId: selectedCustomer.id,

          customerAddressId:
            selectedCustomer.customerAddressId,

          title: cleanTitle,

          description: finalDescription,

          scheduledDate,

          totalAmount: parsedTotalAmount,
        });

        toast.success(
          "Ordem de serviço criada e enviada para aguardando rota.",
        );

        router.push("/workorders/approved");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível criar a ordem de serviço.",
        );
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          Nova Ordem de Serviço
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Crie um atendimento avulso, como reparo,
          troca de areia, visita técnica ou venda de
          produto. Limpezas recorrentes devem ser
          cadastradas em Planos de Serviço.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-sky-600" />

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Tipo de serviço
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Selecione o motivo principal deste
              atendimento avulso.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_TYPES.map((option) => {
            const selected =
              option.value === serviceType;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  handleServiceTypeChange(
                    option.value,
                  )
                }
                className={`rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-sky-500 bg-sky-50 ring-1 ring-sky-200"
                    : "border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`text-sm font-semibold ${
                    selected
                      ? "text-sky-800"
                      : "text-slate-900"
                  }`}
                >
                  {option.label}
                </div>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Cliente e atendimento
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Cliente/Piscina
            </label>

            <select
              value={customerId}
              onChange={(event) =>
                setCustomerId(event.target.value)
              }
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
            >
              <option value="">
                Selecione um cliente...
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                  disabled={
                    !customer.hasValidAddress
                  }
                >
                  {customer.name}
                  {customer.hasValidAddress
                    ? ""
                    : " — sem endereço válido"}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <p className="mt-1 text-xs text-slate-500">
                {selectedCustomer.addressLabel}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Título da OS
            </label>

            <Input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Ex.: Reparo da bomba da piscina"
            />

            <p className="mt-1 text-xs text-slate-500">
              Você pode editar livremente o título
              sugerido.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-sky-600" />

          <h2 className="text-sm font-semibold text-slate-900">
            Agendamento e valor
          </h2>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Data agendada
            </label>

            <Input
              type="date"
              value={scheduledDate}
              onChange={(event) =>
                setScheduledDate(event.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Valor total
            </label>

            <Input
              inputMode="decimal"
              value={totalAmount}
              onChange={(event) =>
                setTotalAmount(event.target.value)
              }
              placeholder="Ex.: 250,00"
            />

            <p className="mt-1 text-xs text-slate-500">
              Para orçamento ou visita sem cobrança
              definida, o valor pode permanecer zerado.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Descrição e observações
          </label>

          <Textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Ex.: Bomba apresentando ruído. Verificar rolamento, registrar diagnóstico e enviar orçamento."
            rows={5}
          />

          <p className="mt-1 text-xs text-slate-500">
            Descreva produtos, peças, quantidades,
            problemas relatados e instruções para o
            técnico.
          </p>
        </div>
      </section>

      <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
        >
          Voltar
        </Button>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push("/workorders")
            }
            disabled={pending}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            className="btn-brand text-white"
            onClick={handleSubmit}
            disabled={pending}
          >
            <Save className="mr-2 h-4 w-4" />

            {pending ? "Criando..." : "Criar OS"}
          </Button>
        </div>
      </div>
    </div>
  );
}