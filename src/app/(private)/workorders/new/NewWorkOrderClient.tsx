"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  CircleDollarSign,
  ClipboardList,
  Droplets,
  Hammer,
  MapPin,
  Package,
  Plus,
  Search,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createAdminWorkOrder,
  type WorkOrderCustomerOption,
} from "../actions";

import FormActionBar from "@/components/ui/FormActionBar";
import FormField from "@/components/form-layout/FormField";
import FormInfoBox from "@/components/form-layout/FormInfoBox";
import StepFormSection from "@/components/form-layout/StepFormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
      "Limpeza pontual de piscina fora de uma rotina recorrente.",
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

const ITEM_TYPE_LABELS: Record<
  ChargeItemType,
  string
> = {
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

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
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

function formatMoneyInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const amount = Number(digits) / 100;

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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
      (serviceType) =>
        serviceType.value === type,
    )?.label || "Serviço avulso"
  );
}

function itemTotal(item: ChargeItem) {
  const quantity = Math.max(
    1,
    Number(item.quantity || 1),
  );

  return quantity * parseMoney(item.unitPrice);
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
    React.useState<ServiceType>(
      "TECHNICAL_VISIT",
    );

  const [customerId, setCustomerId] =
    React.useState("");

  const [
    customerPickerOpen,
    setCustomerPickerOpen,
  ] = React.useState(false);

  const [title, setTitle] =
    React.useState("Visita técnica");

  const [description, setDescription] =
    React.useState("");

  const [scheduledDate, setScheduledDate] =
    React.useState(todayIso());

  const [items, setItems] = React.useState<
    ChargeItem[]
  >(() => [createLaborItem()]);

  const selectedCustomer = React.useMemo(
    () =>
      customers.find(
        (customer) =>
          customer.id === customerId,
      ) || null,
    [customers, customerId],
  );

  const selectedServiceType =
    React.useMemo(
      () =>
        SERVICE_TYPES.find(
          (option) =>
            option.value === serviceType,
        ) || SERVICE_TYPES[0],
      [serviceType],
    );

  const SelectedServiceIcon =
    selectedServiceType.icon;

  const totalAmount = React.useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + itemTotal(item),
        0,
      ),
    [items],
  );

  const additionalItemsCount =
    items.filter(
      (item) => !item.locked,
    ).length;

  const hasValidItems =
    React.useMemo(() => {
      if (items.length === 0) {
        return false;
      }

      const hasLaborItem =
        items.some(
          (item) =>
            item.type === "LABOR" &&
            item.locked,
        );

      if (!hasLaborItem) {
        return false;
      }

      return items.every((item) => {
        const quantity = Number(
          item.quantity,
        );

        const unitPrice = parseMoney(
          item.unitPrice,
        );

        return (
          item.description.trim()
            .length > 0 &&
          Number.isFinite(quantity) &&
          quantity > 0 &&
          item.unitPrice.trim()
            .length > 0 &&
          Number.isFinite(unitPrice) &&
          unitPrice > 0
        );
      });
    }, [items]);

  const isCustomerValid =
    Boolean(selectedCustomer) &&
    selectedCustomer?.hasValidAddress === true;

  const isTitleValid =
    title.trim().length > 0;

  const isDateValid =
    scheduledDate.length > 0;

  const canSubmit =
    isCustomerValid &&
    isTitleValid &&
    isDateValid &&
    hasValidItems &&
    totalAmount > 0 &&
    !pending;

  function handleServiceTypeChange(
    nextServiceType: ServiceType,
  ) {
    const nextOption =
      SERVICE_TYPES.find(
        (item) =>
          item.value === nextServiceType,
      );

    setServiceType(nextServiceType);

    if (!nextOption) {
      return;
    }

    const defaultTitles =
      SERVICE_TYPES.map(
        (item) => item.defaultTitle,
      ).filter(Boolean);

    if (
      !title.trim() ||
      defaultTitles.includes(
        title.trim(),
      )
    ) {
      setTitle(
        nextOption.defaultTitle,
      );
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

  function removeItem(
    itemId: string,
  ) {
    setItems((current) =>
      current.filter(
        (item) =>
          item.id !== itemId ||
          item.locked,
      ),
    );
  }

  function validateItems() {
    const laborItem = items.find(
      (item) =>
        item.type === "LABOR" &&
        item.locked,
    );

    if (!laborItem) {
      toast.error(
        "A OS precisa possuir o item de mão de obra.",
      );

      return false;
    }

    for (const item of items) {
      const itemName =
        item.description.trim() ||
        ITEM_TYPE_LABELS[
          item.type
        ];

      if (
        !item.description.trim()
      ) {
        toast.error(
          "Preencha a descrição de todos os itens.",
        );

        return false;
      }

      if (
        !Number.isFinite(
          item.quantity,
        ) ||
        item.quantity <= 0
      ) {
        toast.error(
          `Informe uma quantidade válida para "${itemName}".`,
        );

        return false;
      }

      if (
        !item.unitPrice.trim()
      ) {
        toast.error(
          `Informe o valor de "${itemName}".`,
        );

        return false;
      }

      const unitPrice =
        parseMoney(
          item.unitPrice,
        );

      if (
        !Number.isFinite(
          unitPrice,
        ) ||
        unitPrice <= 0
      ) {
        toast.error(
          `O valor de "${itemName}" deve ser maior que zero.`,
        );

        return false;
      }
    }

    return true;
  }

  function buildFinalDescription() {
    const serviceText =
      `Tipo de atendimento: ${serviceTypeLabel(
        serviceType,
      )}.`;

    return [
      serviceText,

      description.trim()
        ? `Observações:\n${description.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedCustomer) {
      toast.error(
        "Selecione o cliente ou a piscina.",
      );

      return;
    }

    if (
      !selectedCustomer.hasValidAddress
    ) {
      toast.error(
        "O cliente selecionado não possui um endereço principal válido.",
      );

      return;
    }

    if (!isTitleValid) {
      toast.error(
        "Informe o título da ordem de serviço.",
      );

      return;
    }

    if (!isDateValid) {
      toast.error(
        "Informe a data agendada.",
      );

      return;
    }

    if (!validateItems()) {
      return;
    }

    if (totalAmount <= 0) {
      toast.error(
        "O valor total da ordem deve ser maior que zero.",
      );

      return;
    }

    const finalDescription =
      buildFinalDescription();

    const payloadItems = items.map(
      (item) => ({
        type: item.type,
        description: item.description.trim(),
        quantity: Math.max(
          1,
          Number(item.quantity || 1),
        ),
        unitPrice: parseMoney(
          item.unitPrice,
        ),
      }),
    );

    startTransition(async () => {
      try {
        await createAdminWorkOrder({
          customerId:
            selectedCustomer.id,

          customerAddressId:
            selectedCustomer
              .customerAddressId,

          title: title.trim(),

          description:
            finalDescription,

          notes:
            description.trim() || undefined,

          scheduledDate,

          items: payloadItems,
        });

        toast.success(
          "Ordem enviada para aprovação do cliente.",
        );

        router.push(
          "/workorders/customer-approval",
        );

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
      onSubmit={handleSubmit}
      className="space-y-5 pb-28"
    >
      <StepFormSection
        step={1}
        icon={Wrench}
        title="Tipo de serviço"
        description="Escolha a categoria deste atendimento."
      >
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
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
                disabled={pending}
                className={[
                  "group relative flex min-h-[106px] flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center transition-all duration-200",
                  selected
                    ? "border-sky-500 bg-sky-50 shadow-sm ring-1 ring-sky-100"
                    : "border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50",
                  pending
                    ? "cursor-not-allowed opacity-60"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div
                  className={[
                    "grid h-10 w-10 shrink-0 place-items-center rounded-lg transition",
                    selected
                      ? "bg-sky-600 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-700",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <span
                  className={[
                    "text-xs font-semibold leading-4",
                    selected
                      ? "text-sky-900"
                      : "text-slate-800",
                  ].join(" ")}
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

        <FormInfoBox
          icon={SelectedServiceIcon}
          compact
          className="mt-3"
        >
          <strong className="font-semibold text-sky-900">
            {selectedServiceType.label}
          </strong>

          <span className="ml-1">
            {selectedServiceType.description}
          </span>
        </FormInfoBox>
      </StepFormSection>

      <StepFormSection
        step={2}
        icon={UserRound}
        title="Cliente e atendimento"
        description="Vincule a OS ao cliente e informe o título que aparecerá no sistema."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <FormField
            htmlFor="work-order-customer"
            label="Cliente/Piscina"
            required
            error={
              customerId && !isCustomerValid
                ? "O cliente selecionado não possui endereço principal válido."
                : undefined
            }
          >
            <Popover
              open={customerPickerOpen}
              onOpenChange={setCustomerPickerOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  id="work-order-customer"
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerPickerOpen}
                  aria-invalid={
                    Boolean(customerId) && !isCustomerValid
                  }
                  disabled={pending}
                  className="h-11 w-full justify-between rounded-xl border-slate-300 bg-white px-3 text-left font-normal text-slate-800 hover:bg-white"
                >
                  <span
                    className={[
                      "min-w-0 truncate",
                      selectedCustomer
                        ? "text-slate-800"
                        : "text-slate-500",
                    ].join(" ")}
                  >
                    {selectedCustomer
                      ? selectedCustomer.name
                      : "Selecione um cliente..."}
                  </span>

                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0"
              >
                <Command>
                  <CommandInput
                    placeholder="Pesquisar cliente..."
                    className="h-11"
                  />

                  <CommandList>
                    <CommandEmpty>
                      Nenhum cliente encontrado.
                    </CommandEmpty>

                    <CommandGroup>
                      {customers.map((customer) => {
                        const selected =
                          customer.id === customerId;

                        return (
                          <CommandItem
                            key={customer.id}
                            value={[
                              customer.name,
                              customer.addressLabel,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            disabled={!customer.hasValidAddress}
                            onSelect={() => {
                              if (!customer.hasValidAddress) {
                                return;
                              }

                              setCustomerId(customer.id);
                              setCustomerPickerOpen(false);
                            }}
                            className="items-start gap-3 py-3"
                          >
                            <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700">
                              <UserRound className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-sm font-medium text-slate-900">
                                  {customer.name}
                                </span>

                                {!customer.hasValidAddress && (
                                  <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                    Sem endereço
                                  </span>
                                )}
                              </div>

                              <div className="mt-0.5 truncate text-xs text-slate-500">
                                {customer.addressLabel ||
                                  "Endereço principal não informado"}
                              </div>
                            </div>

                            {selected && (
                              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-sky-600" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormField>

          <FormField
            htmlFor="work-order-title"
            label="Título da OS"
            required
            error={
              title.length > 0 &&
              !isTitleValid
                ? "Informe o título da ordem de serviço."
                : undefined
            }
          >
            <Input
              id="work-order-title"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="Ex.: Reparo da bomba da piscina"
              className="h-11 rounded-xl"
              aria-invalid={
                title.length > 0 &&
                !isTitleValid
              }
              disabled={pending}
            />
          </FormField>
        </div>

        {selectedCustomer && (
          <FormInfoBox
            icon={MapPin}
            className="mt-5"
          >
            <strong className="font-semibold text-slate-800">
              Endereço principal:
            </strong>{" "}
            {
              selectedCustomer.addressLabel
            }
          </FormInfoBox>
        )}
      </StepFormSection>

<StepFormSection
  step={3}
  icon={CircleDollarSign}
  title="Itens e valores"
  description="Informe o valor da mão de obra e adicione produtos, materiais ou serviços complementares."
>
  {/* Desktop */}
  <div className="hidden overflow-hidden rounded-xl border border-slate-200 lg:block">
    <table className="w-full table-fixed text-sm">
      <colgroup>
        <col className="w-[17%]" />
        <col className="w-[31%]" />
        <col className="w-[11%]" />
        <col className="w-[17%]" />
        <col className="w-[16%]" />
        <col className="w-[8%]" />
      </colgroup>

      <thead className="bg-slate-50">
        <tr>
          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Tipo
          </th>

          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Descrição
          </th>

          <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Qtd.
          </th>

          <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Valor unitário
          </th>

          <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Subtotal
          </th>

          <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Ação
          </th>
        </tr>
      </thead>

      <tbody>
        {items.map((item, index) => (
          <tr
            key={item.id}
            className={[
              "border-t border-slate-200",
              item.locked
                ? "bg-sky-50/40"
                : "bg-white",
            ].join(" ")}
          >
            <td className="px-3 py-2">
              <select
                id={`item-type-${item.id}`}
                value={item.type}
                disabled={item.locked || pending}
                onChange={(event) =>
                  updateItem(item.id, {
                    type: event.target
                      .value as ChargeItemType,
                  })
                }
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:border-sky-100 disabled:bg-sky-50 disabled:font-medium disabled:text-sky-800"
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

            <td className="px-3 py-2">
              <div className="relative">
                <Input
                  id={`item-description-${item.id}`}
                  value={item.description}
                  disabled={item.locked || pending}
                  onChange={(event) =>
                    updateItem(item.id, {
                      description: event.target.value,
                    })
                  }
                  placeholder="Ex.: Areia para filtro"
                  className="h-9 rounded-lg text-xs disabled:bg-sky-50 disabled:font-medium disabled:text-sky-800"
                />

                {item.locked && (
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-sky-100 bg-white px-2 py-0.5 text-[9px] font-semibold text-sky-700">
                    Obrigatório
                  </span>
                )}
              </div>
            </td>

            <td className="px-3 py-2">
              <Input
                id={`item-quantity-${item.id}`}
                type="number"
                min={1}
                step={1}
                value={item.quantity}
                disabled={item.locked || pending}
                onChange={(event) =>
                  updateItem(item.id, {
                    quantity: Math.max(
                      1,
                      Number(event.target.value || 1),
                    ),
                  })
                }
                className="h-9 rounded-lg px-2 text-center text-xs disabled:bg-sky-50 disabled:text-sky-800"
              />
            </td>

            <td className="px-3 py-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  R$
                </span>

                <Input
                  id={`item-price-${item.id}`}
                  inputMode="numeric"
                  value={item.unitPrice}
                  onChange={(event) =>
                    updateItem(item.id, {
                      unitPrice: formatMoneyInput(
                        event.target.value,
                      ),
                    })
                  }
                  placeholder="0,00"
                  disabled={pending}
                  className={[
                    "h-9 rounded-lg pl-8 text-xs",
                    item.unitPrice.trim() &&
                    parseMoney(item.unitPrice) <= 0
                      ? "border-red-300 focus-visible:ring-red-200"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              </div>
            </td>

            <td className="px-3 py-2 text-right">
              <div className="text-sm font-semibold text-slate-900">
                {formatCurrency(itemTotal(item))}
              </div>

              <div className="text-[9px] text-slate-400">
                Item {index + 1}
              </div>
            </td>

            <td className="px-3 py-2 text-center">
              {item.locked ? (
                <div
                  className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-500"
                  title="A mão de obra é obrigatória"
                >
                  <Check className="h-3.5 w-3.5" />
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-lg border-red-100 p-0 text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => removeItem(item.id)}
                  disabled={pending}
                  aria-label="Excluir item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2.5">
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        disabled={pending}
        className="h-9 rounded-lg border-sky-200 bg-white px-3 text-xs text-sky-700 hover:bg-sky-50 hover:text-sky-800"
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />

        Adicionar item
      </Button>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-[11px] text-slate-500">
            Mão de obra + {additionalItemsCount}{" "}
            {additionalItemsCount === 1
              ? "adicional"
              : "adicionais"}
          </div>

          <div className="text-xs font-semibold text-slate-700">
            {items.length}{" "}
            {items.length === 1
              ? "item cadastrado"
              : "itens cadastrados"}
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Total da OS
          </div>

          <div className="text-base font-bold text-sky-700">
            {formatCurrency(totalAmount)}
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Mobile e tablet */}
  <div className="space-y-3 lg:hidden">
    {items.map((item, index) => (
      <div
        key={item.id}
        className={[
          "rounded-xl border p-3",
          item.locked
            ? "border-sky-200 bg-sky-50/50"
            : "border-slate-200 bg-white",
        ].join(" ")}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Item {index + 1}
            </div>

            <div className="mt-0.5 flex items-center gap-2 text-xs font-semibold text-slate-900">
              {ITEM_TYPE_LABELS[item.type]}

              {item.locked && (
                <span className="rounded-full border border-sky-200 bg-white px-2 py-0.5 text-[9px] font-semibold text-sky-700">
                  Obrigatório
                </span>
              )}
            </div>
          </div>

          {!item.locked && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 rounded-lg border-red-100 p-0 text-red-500"
              onClick={() => removeItem(item.id)}
              disabled={pending}
              aria-label="Excluir item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            htmlFor={`mobile-item-type-${item.id}`}
            label="Tipo"
          >
            <select
              id={`mobile-item-type-${item.id}`}
              value={item.type}
              disabled={item.locked || pending}
              onChange={(event) =>
                updateItem(item.id, {
                  type: event.target
                    .value as ChargeItemType,
                })
              }
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs disabled:bg-sky-50"
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
          </FormField>

          <FormField
            htmlFor={`mobile-item-description-${item.id}`}
            label="Descrição"
            required
          >
            <Input
              id={`mobile-item-description-${item.id}`}
              value={item.description}
              disabled={item.locked || pending}
              onChange={(event) =>
                updateItem(item.id, {
                  description: event.target.value,
                })
              }
              placeholder="Ex.: Areia para filtro"
              className="h-9 rounded-lg text-xs"
            />
          </FormField>

          <FormField
            htmlFor={`mobile-item-quantity-${item.id}`}
            label="Quantidade"
            required
          >
            <Input
              id={`mobile-item-quantity-${item.id}`}
              type="number"
              min={1}
              step={1}
              value={item.quantity}
              disabled={item.locked || pending}
              onChange={(event) =>
                updateItem(item.id, {
                  quantity: Math.max(
                    1,
                    Number(event.target.value || 1),
                  ),
                })
              }
              className="h-9 rounded-lg text-xs"
            />
          </FormField>

          <FormField
            htmlFor={`mobile-item-price-${item.id}`}
            label="Valor unitário"
            required
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                R$
              </span>

              <Input
                id={`mobile-item-price-${item.id}`}
                inputMode="numeric"
                value={item.unitPrice}
                onChange={(event) =>
                  updateItem(item.id, {
                    unitPrice: formatMoneyInput(
                      event.target.value,
                    ),
                  })
                }
                placeholder="0,00"
                disabled={pending}
                className="h-9 rounded-lg pl-8 text-xs"
              />
            </div>
          </FormField>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Subtotal
          </span>

          <span className="text-sm font-bold text-slate-900">
            {formatCurrency(itemTotal(item))}
          </span>
        </div>
      </div>
    ))}

    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        disabled={pending}
        className="h-9 rounded-lg border-dashed border-sky-300 bg-white text-xs text-sky-700"
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />

        Adicionar item
      </Button>

      <div className="text-right">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Total da OS
        </div>

        <div className="text-base font-bold text-sky-700">
          {formatCurrency(totalAmount)}
        </div>
      </div>
    </div>
  </div>

  <FormInfoBox
    icon={CircleDollarSign}
    variant="warning"
    compact
    className="mt-4"
  >
    A mão de obra é obrigatória e todos os itens precisam
    possuir valor maior que zero.
  </FormInfoBox>
</StepFormSection>

      <StepFormSection
        step={4}
        icon={CalendarDays}
        title="Agendamento e observações"
        description="Defina a data prevista e registre informações importantes para a execução do atendimento."
      >
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <FormField
            htmlFor="work-order-date"
            label="Data agendada"
            required
          >
            <Input
              id="work-order-date"
              type="date"
              min={todayIso()}
              value={scheduledDate}
              onChange={(event) =>
                setScheduledDate(
                  event.target.value,
                )
              }
              className="h-11 rounded-xl"
              disabled={pending}
            />
          </FormField>

          <FormField
            htmlFor="work-order-description"
            label="Descrição e observações"
            optional
            description="Registre o problema relatado, peças necessárias, instruções e referências para o técnico."
          >
            <Textarea
              id="work-order-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Ex.: Bomba apresentando ruído. Verificar rolamento, registrar diagnóstico e enviar orçamento."
              rows={6}
              className="min-h-[148px] resize-y rounded-xl"
              disabled={pending}
            />
          </FormField>
        </div>
      </StepFormSection>

      <FormActionBar
        primaryLabel="Criar ordem"
        loadingLabel="Criando OS..."
        pending={pending}
        disabled={!canSubmit}
        onBack={handleBack}
        onCancel={handleCancel}
        submitType="submit"
      />
    </form>
  );
}