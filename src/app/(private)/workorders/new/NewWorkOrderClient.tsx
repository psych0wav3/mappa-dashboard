"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  CircleDollarSign,
  ClipboardList,
  Droplets,
  Hammer,
  Package,
  Plus,
  Search,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import FormActionBar from "@/components/ui/FormActionBar";
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

type ChargeItemType =
  | "LABOR"
  | "PRODUCT"
  | "MATERIAL"
  | "SERVICE";

type ChargeItem = {
  id: string;
  type: ChargeItemType;
  description: string;
  quantity: number;
  unitPrice: string;
  locked: boolean;
};

type ServiceTypeOption = {
  value: ServiceType;
  label: string;
  description: string;
  defaultTitle: string;
  icon: LucideIcon;
};

const SERVICE_TYPES: ServiceTypeOption[] = [
  {
    value: "POOL_CLEANING",
    label: "Limpeza avulsa",
    description:
      "Limpeza pontual de piscina fora de um plano recorrente.",
    defaultTitle: "Limpeza avulsa de piscina",
    icon: Droplets,
  },
  {
    value: "EQUIPMENT_REPAIR",
    label: "Reparo de equipamento",
    description:
      "Reparo de bomba, filtro, aquecedor ou outro equipamento.",
    defaultTitle: "Reparo de equipamento",
    icon: Wrench,
  },
  {
    value: "SAND_REPLACEMENT",
    label: "Troca de areia",
    description:
      "Retirada e substituição da areia do filtro da piscina.",
    defaultTitle: "Troca de areia do filtro",
    icon: Hammer,
  },
  {
    value: "PRODUCT_SALE",
    label: "Venda ou entrega de produto",
    description:
      "Venda, entrega ou aplicação pontual de produto.",
    defaultTitle: "Venda ou entrega de produto",
    icon: Package,
  },
  {
    value: "TECHNICAL_VISIT",
    label: "Visita técnica",
    description:
      "Diagnóstico, avaliação ou orçamento no local.",
    defaultTitle: "Visita técnica",
    icon: Search,
  },
  {
    value: "OTHER",
    label: "Outro serviço",
    description:
      "Outro atendimento avulso que não se enquadra nas opções anteriores.",
    defaultTitle: "",
    icon: ClipboardList,
  },
];

const ITEM_TYPE_LABELS: Record<ChargeItemType, string> = {
  LABOR: "Mão de obra",
  PRODUCT: "Produto",
  MATERIAL: "Material",
  SERVICE: "Serviço adicional",
};

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createLaborItem(): ChargeItem {
  return {
    id: createId(),
    type: "LABOR",
    description: "Mão de obra",
    quantity: 1,
    unitPrice: "",
    locked: true,
  };
}

function createAdditionalItem(): ChargeItem {
  return {
    id: createId(),
    type: "PRODUCT",
    description: "",
    quantity: 1,
    unitPrice: "",
    locked: false,
  };
}

function todayIso() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();

  return new Date(now.getTime() - timezoneOffset * 60_000)
    .toISOString()
    .slice(0, 10);
}

function parseMoney(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return 0;
  }

  let normalized = cleanValue.replace(/[^\d,.-]/g, "");

  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function serviceTypeLabel(type: ServiceType) {
  return (
    SERVICE_TYPES.find(
      (serviceType) => serviceType.value === type,
    )?.label || "Serviço avulso"
  );
}

function itemTotal(item: ChargeItem) {
  return (
    Math.max(1, Number(item.quantity || 1)) *
    parseMoney(item.unitPrice)
  );
}

function StepHeader({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
        <Icon className="h-4 w-4" />

        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-sky-600 px-1 text-[10px] font-bold text-white">
          {step}
        </span>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function NewWorkOrderClient({
  customers,
}: {
  customers: WorkOrderCustomerOption[];
}) {
  const router = useRouter();

  const [pending, startTransition] = React.useTransition();

  const [serviceType, setServiceType] =
    React.useState<ServiceType>("TECHNICAL_VISIT");

  const [customerId, setCustomerId] = React.useState("");
  const [title, setTitle] = React.useState("Visita técnica");
  const [description, setDescription] = React.useState("");
  const [scheduledDate, setScheduledDate] =
    React.useState(todayIso());

  const [items, setItems] = React.useState<ChargeItem[]>(() => [
    createLaborItem(),
  ]);

  const selectedCustomer = React.useMemo(
    () =>
      customers.find((customer) => customer.id === customerId) ||
      null,
    [customers, customerId],
  );

  const selectedServiceType = React.useMemo(
    () =>
      SERVICE_TYPES.find(
        (option) => option.value === serviceType,
      ) || SERVICE_TYPES[0],
    [serviceType],
  );

  const SelectedServiceIcon = selectedServiceType.icon;

  const totalAmount = React.useMemo(
    () =>
      items.reduce(
        (total, item) => total + itemTotal(item),
        0,
      ),
    [items],
  );

  const additionalItemsCount = items.filter(
    (item) => !item.locked,
  ).length;

  const hasValidItems = React.useMemo(() => {
    if (items.length === 0) {
      return false;
    }

    const hasLaborItem = items.some(
      (item) => item.type === "LABOR" && item.locked,
    );

    if (!hasLaborItem) {
      return false;
    }

    return items.every((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = parseMoney(item.unitPrice);

      return (
        item.description.trim().length > 0 &&
        Number.isFinite(quantity) &&
        quantity > 0 &&
        item.unitPrice.trim().length > 0 &&
        Number.isFinite(unitPrice) &&
        unitPrice > 0 &&
        itemTotal(item) > 0
      );
    });
  }, [items]);

  const isFormValid =
    Boolean(selectedCustomer) &&
    selectedCustomer?.hasValidAddress === true &&
    title.trim().length > 0 &&
    Boolean(scheduledDate) &&
    hasValidItems &&
    totalAmount > 0;

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

    const currentDefaultTitles = SERVICE_TYPES.map(
      (item) => item.defaultTitle,
    ).filter(Boolean);

    if (
      !title.trim() ||
      currentDefaultTitles.includes(title.trim())
    ) {
      setTitle(nextOption.defaultTitle);
    }
  }

  function updateItem(
    itemId: string,
    changes: Partial<ChargeItem>,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...changes,
            }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      createAdditionalItem(),
    ]);
  }

  function removeItem(itemId: string) {
    setItems((current) =>
      current.filter(
        (item) => item.id !== itemId || item.locked,
      ),
    );
  }

  function validateItems() {
    if (items.length === 0) {
      toast.error(
        "Adicione ao menos um item à ordem de serviço.",
      );

      return false;
    }

    const laborItem = items.find(
      (item) => item.type === "LABOR" && item.locked,
    );

    if (!laborItem) {
      toast.error(
        "A OS precisa possuir o item Mão de obra.",
      );

      return false;
    }

    for (const item of items) {
      const itemName =
        item.description.trim() ||
        ITEM_TYPE_LABELS[item.type];

      if (!item.description.trim()) {
        toast.error(
          "Preencha a descrição de todos os itens.",
        );

        return false;
      }

      if (
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0
      ) {
        toast.error(
          `Informe uma quantidade válida para "${itemName}".`,
        );

        return false;
      }

      if (!item.unitPrice.trim()) {
        toast.error(
          `Informe o valor de "${itemName}".`,
        );

        return false;
      }

      const unitPrice = parseMoney(item.unitPrice);

      if (
        !Number.isFinite(unitPrice) ||
        unitPrice <= 0
      ) {
        toast.error(
          `O valor de "${itemName}" deve ser maior que zero.`,
        );

        return false;
      }

      if (itemTotal(item) <= 0) {
        toast.error(
          `O subtotal de "${itemName}" deve ser maior que zero.`,
        );

        return false;
      }
    }

    if (totalAmount <= 0) {
      toast.error(
        "O valor total da ordem deve ser maior que zero.",
      );

      return false;
    }

    return true;
  }

  function buildFinalDescription() {
    const serviceTypeText = `Tipo de atendimento: ${serviceTypeLabel(
      serviceType,
    )}.`;

    const itemsText = items
      .map((item, index) => {
        const quantity = Math.max(
          1,
          Number(item.quantity || 1),
        );

        const unitPrice = parseMoney(item.unitPrice);
        const total = itemTotal(item);

        return [
          `${index + 1}. ${
            ITEM_TYPE_LABELS[item.type]
          } — ${item.description.trim()}`,
          `Quantidade: ${quantity}`,
          `Valor unitário: ${formatCurrency(unitPrice)}`,
          `Subtotal: ${formatCurrency(total)}`,
        ].join(" | ");
      })
      .join("\n");

    const chargesText = [
      "Itens da ordem de serviço:",
      itemsText,
      `Total da OS: ${formatCurrency(totalAmount)}`,
    ].join("\n");

    const notes = description.trim();

    return [
      serviceTypeText,
      chargesText,
      notes ? `Observações:\n${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
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

    if (!validateItems()) {
      return;
    }

    if (totalAmount <= 0) {
      toast.error(
        "Informe ao menos um item com valor maior que zero.",
      );

      return;
    }

    const finalDescription = buildFinalDescription();

    startTransition(async () => {
      try {
        await createAdminWorkOrder({
          customerId: selectedCustomer.id,
          customerAddressId:
            selectedCustomer.customerAddressId,
          title: cleanTitle,
          description: finalDescription,
          scheduledDate,
          totalAmount,
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

  function handleFormSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (pending) {
      return;
    }

    handleSubmit();
  }

  function handleBack() {
    if (pending) {
      return;
    }

    router.back();
  }

  function handleCancel() {
    if (pending) {
      return;
    }

    router.push("/workorders");
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      className="mx-auto max-w-7xl space-y-5 pb-28"
    >
      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              <ClipboardList className="h-3.5 w-3.5" />

              Atendimento avulso
            </div>

            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              Nova Ordem de Serviço
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Cadastre reparos, visitas técnicas, trocas de
              areia, entregas de produtos e outros serviços
              pontuais.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <StepHeader
          step={1}
          icon={Wrench}
          title="Tipo de serviço"
          description="Escolha a categoria deste atendimento."
        />

        <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {SERVICE_TYPES.map((option) => {
            const selected = option.value === serviceType;
            const Icon = option.icon;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  handleServiceTypeChange(option.value)
                }
                aria-pressed={selected}
                className={`group relative flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center transition-all duration-200 ${
                  selected
                    ? "border-sky-500 bg-sky-50 shadow-sm ring-1 ring-sky-100"
                    : "border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg transition ${
                    selected
                      ? "bg-sky-600 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <span
                  className={`text-xs font-semibold leading-4 ${
                    selected
                      ? "text-sky-900"
                      : "text-slate-800"
                  }`}
                >
                  {option.label}
                </span>

                {selected && (
                  <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-sky-600 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2.5">
          <SelectedServiceIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />

          <div className="min-w-0">
            <div className="text-xs font-semibold text-sky-900">
              {selectedServiceType.label}
            </div>

            <p className="mt-0.5 text-xs leading-5 text-slate-600">
              {selectedServiceType.description}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <StepHeader
          step={2}
          icon={UserRound}
          title="Cliente e atendimento"
          description="Vincule a OS ao cliente e confirme o título que aparecerá no sistema."
        />

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="work-order-customer"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Cliente/Piscina

              <span className="ml-1 text-red-500">*</span>
            </label>

            <select
              id="work-order-customer"
              value={customerId}
              onChange={(event) =>
                setCustomerId(event.target.value)
              }
              disabled={pending}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                Selecione um cliente...
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                  disabled={!customer.hasValidAddress}
                >
                  {customer.name}

                  {customer.hasValidAddress
                    ? ""
                    : " — sem endereço válido"}
                </option>
              ))}
            </select>

            {selectedCustomer ? (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />

                <span>
                  {selectedCustomer.addressLabel}
                </span>
              </div>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="work-order-title"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Título da OS

              <span className="ml-1 text-red-500">*</span>
            </label>

            <Input
              id="work-order-title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Ex.: Reparo da bomba da piscina"
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <StepHeader
            step={3}
            icon={CircleDollarSign}
            title="Itens e valores"
            description="Informe o valor da mão de obra e acrescente produtos, materiais ou serviços adicionais."
          />

          <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-2.5 text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
              Total da OS
            </div>

            <div className="mt-0.5 text-lg font-bold text-sky-900">
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>

        <div className="mt-5 hidden overflow-hidden rounded-2xl border border-slate-200 lg:block">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[17%]" />
              <col className="w-[31%]" />
              <col className="w-[12%]" />
              <col className="w-[17%]" />
              <col className="w-[15%]" />
              <col className="w-[8%]" />
            </colgroup>

            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tipo
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Descrição
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Qtd.
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Valor unitário
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Subtotal
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ação
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-t border-slate-200 ${
                    item.locked
                      ? "bg-sky-50/40"
                      : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3">
                    <select
                      value={item.type}
                      disabled={item.locked || pending}
                      onChange={(event) =>
                        updateItem(item.id, {
                          type: event.target
                            .value as ChargeItemType,
                        })
                      }
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-500 disabled:border-sky-100 disabled:bg-sky-50 disabled:font-medium disabled:text-sky-800"
                    >
                      <option value="LABOR">
                        Mão de obra
                      </option>

                      <option value="PRODUCT">
                        Produto
                      </option>

                      <option value="MATERIAL">
                        Material
                      </option>

                      <option value="SERVICE">
                        Serviço adicional
                      </option>
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <div className="relative">
                      <Input
                        value={item.description}
                        disabled={item.locked || pending}
                        onChange={(event) =>
                          updateItem(item.id, {
                            description:
                              event.target.value,
                          })
                        }
                        placeholder="Ex.: Areia para filtro"
                        className="h-10 rounded-lg disabled:bg-sky-50 disabled:font-medium disabled:text-sky-800"
                      />

                      {item.locked && (
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-sky-700 shadow-sm">
                          Obrigatório
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={item.quantity}
                      disabled={item.locked || pending}
                      onChange={(event) =>
                        updateItem(item.id, {
                          quantity: Math.max(
                            1,
                            Number(
                              event.target.value || 1,
                            ),
                          ),
                        })
                      }
                      className="h-10 rounded-lg text-center disabled:bg-sky-50 disabled:text-sky-800"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                        R$
                      </span>

                      <Input
                        inputMode="decimal"
                        value={item.unitPrice}
                        onChange={(event) =>
                          updateItem(item.id, {
                            unitPrice:
                              event.target.value,
                          })
                        }
                        placeholder="0,00"
                        disabled={pending}
                        className={`h-10 rounded-lg pl-9 ${
                          item.unitPrice.trim() &&
                          parseMoney(
                            item.unitPrice,
                          ) <= 0
                            ? "border-red-300 focus-visible:ring-red-200"
                            : ""
                        }`}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold text-slate-900">
                      {formatCurrency(
                        itemTotal(item),
                      )}
                    </div>

                    <div className="mt-0.5 text-[10px] text-slate-400">
                      Item {index + 1}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {item.locked ? (
                      <div
                        className="mx-auto grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-sky-500"
                        title="A mão de obra é obrigatória"
                      >
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 rounded-lg border-red-100 p-0 text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() =>
                          removeItem(item.id)
                        }
                        disabled={pending}
                        title="Excluir item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              disabled={pending}
              className="rounded-xl border-sky-200 bg-white text-sky-700 hover:bg-sky-50 hover:text-sky-800"
            >
              <Plus className="mr-2 h-4 w-4" />

              Adicionar item
            </Button>

            <div className="flex items-center gap-5">
              <div className="text-right">
                <div className="text-xs text-slate-500">
                  Mão de obra +{" "}
                  {additionalItemsCount}{" "}
                  {additionalItemsCount === 1
                    ? "adicional"
                    : "adicionais"}
                </div>

                <div className="mt-0.5 text-sm font-semibold text-slate-700">
                  {items.length} itens cadastrados
                </div>
              </div>

              <div className="h-9 w-px bg-slate-200" />

              <div className="text-right">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total
                </div>

                <div className="text-lg font-bold text-sky-700">
                  {formatCurrency(totalAmount)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3 lg:hidden">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 ${
                item.locked
                  ? "border-sky-200 bg-sky-50/50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Item {index + 1}
                  </div>

                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {ITEM_TYPE_LABELS[item.type]}
                  </div>
                </div>

                {!item.locked && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 rounded-lg border-red-100 p-0 text-red-500"
                    onClick={() =>
                      removeItem(item.id)
                    }
                    disabled={pending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Tipo
                  </label>

                  <select
                    value={item.type}
                    disabled={item.locked || pending}
                    onChange={(event) =>
                      updateItem(item.id, {
                        type: event.target
                          .value as ChargeItemType,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:bg-sky-50"
                  >
                    <option value="LABOR">
                      Mão de obra
                    </option>

                    <option value="PRODUCT">
                      Produto
                    </option>

                    <option value="MATERIAL">
                      Material
                    </option>

                    <option value="SERVICE">
                      Serviço adicional
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Descrição
                  </label>

                  <Input
                    value={item.description}
                    disabled={item.locked || pending}
                    onChange={(event) =>
                      updateItem(item.id, {
                        description:
                          event.target.value,
                      })
                    }
                    className="h-10 rounded-lg"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Quantidade
                  </label>

                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={item.quantity}
                    disabled={item.locked || pending}
                    onChange={(event) =>
                      updateItem(item.id, {
                        quantity: Math.max(
                          1,
                          Number(
                            event.target.value || 1,
                          ),
                        ),
                      })
                    }
                    className="h-10 rounded-lg"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Valor unitário
                  </label>

                  <Input
                    inputMode="decimal"
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateItem(item.id, {
                        unitPrice:
                          event.target.value,
                      })
                    }
                    placeholder="0,00"
                    disabled={pending}
                    className={`h-10 rounded-lg ${
                      item.unitPrice.trim() &&
                      parseMoney(
                        item.unitPrice,
                      ) <= 0
                        ? "border-red-300 focus-visible:ring-red-200"
                        : ""
                    }`}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-xs font-medium text-slate-500">
                  Subtotal
                </span>

                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(itemTotal(item))}
                </span>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            disabled={pending}
            className="h-11 w-full rounded-xl border-dashed border-sky-300 text-sky-700"
          >
            <Plus className="mr-2 h-4 w-4" />

            Adicionar item
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <StepHeader
          step={4}
          icon={CalendarDays}
          title="Agendamento e observações"
          description="Defina a data prevista e registre orientações importantes para o atendimento."
        />

        <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
          <div>
            <label
              htmlFor="work-order-date"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Data agendada

              <span className="ml-1 text-red-500">*</span>
            </label>

            <Input
              id="work-order-date"
              type="date"
              value={scheduledDate}
              onChange={(event) =>
                setScheduledDate(event.target.value)
              }
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </div>

          <div>
            <label
              htmlFor="work-order-description"
              className="mb-2 block text-xs font-semibold text-slate-700"
            >
              Descrição e observações
            </label>

            <Textarea
              id="work-order-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Ex.: Bomba apresentando ruído. Verificar rolamento, registrar diagnóstico e enviar orçamento."
              rows={6}
              className="min-h-[148px] resize-y rounded-xl"
              disabled={pending}
            />

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Registre problemas relatados, peças necessárias,
              instruções para o técnico e outras informações
              importantes.
            </p>
          </div>
        </div>
      </section>

      <FormActionBar
        primaryLabel="Criar ordem"
        loadingLabel="Criando OS..."
        pending={pending}
        disabled={!isFormValid}
        onBack={handleBack}
        onCancel={handleCancel}
        submitType="submit"
      />
    </form>
  );
}