"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Package,
  Plus,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  createAdminWorkOrder,
  type WorkOrderCustomerOption,
  type WorkOrderTechnicianOption,
} from "../actions";

type OrderMode = "POOL_CLEANING" | "ADDITIONAL";

type Frequency =
  | "ONCE"
  | "WEEKLY_ONCE"
  | "WEEKLY_TWICE"
  | "WEEKLY_THREE_TIMES"
  | "WEEKLY_FOUR_TIMES"
  | "DAILY"
  | "BIWEEKLY"
  | "MONTHLY";

type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

type AdditionalItemType = "PRODUCT" | "SERVICE";

type AdditionalItem = {
  id: string;
  type: AdditionalItemType;
  name: string;
  quantity: number;
  unitPrice: number;
};

const FREQUENCIES: Array<{
  value: Frequency;
  label: string;
  description: string;
  defaultDays: Weekday[];
}> = [
  {
    value: "ONCE",
    label: "Avulsa",
    description: "Uma limpeza pontual.",
    defaultDays: [],
  },
  {
    value: "WEEKLY_ONCE",
    label: "Semanal",
    description: "1x por semana.",
    defaultDays: ["THURSDAY"],
  },
  {
    value: "WEEKLY_TWICE",
    label: "2x",
    description: "Duas limpezas por semana.",
    defaultDays: ["MONDAY", "THURSDAY"],
  },
  {
    value: "WEEKLY_THREE_TIMES",
    label: "3x",
    description: "Três limpezas por semana.",
    defaultDays: ["MONDAY", "WEDNESDAY", "FRIDAY"],
  },
  {
    value: "WEEKLY_FOUR_TIMES",
    label: "4x",
    description: "Quatro limpezas por semana.",
    defaultDays: ["MONDAY", "TUESDAY", "THURSDAY", "FRIDAY"],
  },
  {
    value: "DAILY",
    label: "Diária",
    description: "Todos os dias.",
    defaultDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ],
  },
  {
    value: "BIWEEKLY",
    label: "Quinzenal",
    description: "A cada 15 dias.",
    defaultDays: ["SATURDAY"],
  },
  {
    value: "MONTHLY",
    label: "Mensal",
    description: "Uma vez por mês.",
    defaultDays: ["SATURDAY"],
  },
];

const WEEKDAYS: Array<{ value: Weekday; label: string; short: string }> = [
  { value: "MONDAY", label: "Segunda", short: "Seg" },
  { value: "TUESDAY", label: "Terça", short: "Ter" },
  { value: "WEDNESDAY", label: "Quarta", short: "Qua" },
  { value: "THURSDAY", label: "Quinta", short: "Qui" },
  { value: "FRIDAY", label: "Sexta", short: "Sex" },
  { value: "SATURDAY", label: "Sábado", short: "Sáb" },
  { value: "SUNDAY", label: "Domingo", short: "Dom" },
];

function todayIso() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);

  return local.toISOString().slice(0, 10);
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseCurrency(value: string) {
  const digits = value.replace(/\D+/g, "");

  if (!digits) return 0;

  return Number(digits) / 100;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatCurrencyInput(rawValue: string) {
  return formatCurrency(parseCurrency(rawValue));
}

function frequencyLabel(value: Frequency) {
  return FREQUENCIES.find((item) => item.value === value)?.label || "Avulsa";
}

function frequencyDescription(value: Frequency) {
  return (
    FREQUENCIES.find((item) => item.value === value)?.description ||
    "Uma limpeza pontual."
  );
}

function weekdayLabels(days: Weekday[]) {
  if (days.length === 0) return "Não se aplica";

  return WEEKDAYS.filter((weekday) => days.includes(weekday.value))
    .map((weekday) => weekday.label)
    .join(", ");
}

function itemTypeLabel(type: AdditionalItemType) {
  return type === "PRODUCT" ? "Produto" : "Serviço";
}

function buildDescription(params: {
  orderMode: OrderMode;
  frequency: Frequency;
  weekdays: Weekday[];
  technician?: WorkOrderTechnicianOption;
  scheduledTime: string;
  observations: string;
  cleaningAmount: number;
  additionalItems: AdditionalItem[];
}) {
  const lines: string[] = [];

  lines.push(
    params.orderMode === "POOL_CLEANING"
      ? "Tipo da OS: Limpeza de piscina"
      : "Tipo da OS: Produto ou serviço adicional",
  );

  if (params.technician) {
    lines.push(`Técnico responsável: ${params.technician.name}`);
    lines.push(`Técnico ID: ${params.technician.id}`);
  } else {
    lines.push("Técnico responsável: Não informado");
  }

  lines.push(`Horário previsto: ${params.scheduledTime}`);

  if (params.orderMode === "POOL_CLEANING") {
    lines.push(`Frequência: ${frequencyLabel(params.frequency)}`);
    lines.push(`Detalhe: ${frequencyDescription(params.frequency)}`);
    lines.push(`Dias da semana: ${weekdayLabels(params.weekdays)}`);
    lines.push(`Valor da limpeza: ${formatCurrency(params.cleaningAmount)}`);
  }

  if (params.orderMode === "ADDITIONAL") {
    lines.push("Itens da OS:");

    if (params.additionalItems.length === 0) {
      lines.push("- Nenhum produto ou serviço informado.");
    } else {
      for (const item of params.additionalItems) {
        lines.push(
          `- ${itemTypeLabel(item.type)}: ${item.name} | Qtd: ${
            item.quantity
          } | Unitário: ${formatCurrency(item.unitPrice)} | Total: ${formatCurrency(
            item.quantity * item.unitPrice,
          )}`,
        );
      }
    }
  }

  if (params.observations.trim()) {
    lines.push("");
    lines.push("Observações:");
    lines.push(params.observations.trim());
  }

  lines.push("");
  lines.push(
    "Campos extras salvos temporariamente na descrição até o backend liberar técnico, horário, frequência e itens estruturados na OS.",
  );

  return lines.join("\n");
}

function CardOption({
  selected,
  title,
  description,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-4 text-left transition ${
        selected
          ? "border-sky-500 bg-sky-50 ring-1 ring-sky-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            selected ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {icon}
        </div>

        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function NewWorkOrderPageClient({
  customers,
  technicians,
}: {
  customers: WorkOrderCustomerOption[];
  technicians: WorkOrderTechnicianOption[];
}) {
  const router = useRouter();

  const [pending, startTransition] = React.useTransition();

  const [orderMode, setOrderMode] = React.useState<OrderMode>("POOL_CLEANING");

  const [customerId, setCustomerId] = React.useState("");
  const [technicianId, setTechnicianId] = React.useState("");

  const [frequency, setFrequency] = React.useState<Frequency>("ONCE");
  const [weekdays, setWeekdays] = React.useState<Weekday[]>([]);

  const [cleaningAmountText, setCleaningAmountText] = React.useState("R$ 0,00");
  const cleaningAmount = React.useMemo(
    () => parseCurrency(cleaningAmountText),
    [cleaningAmountText],
  );

  const [itemType, setItemType] =
    React.useState<AdditionalItemType>("PRODUCT");
  const [itemName, setItemName] = React.useState("");
  const [itemQuantity, setItemQuantity] = React.useState("1");
  const [itemUnitPriceText, setItemUnitPriceText] = React.useState("R$ 0,00");
  const [additionalItems, setAdditionalItems] = React.useState<
    AdditionalItem[]
  >([]);

  const [scheduledDate, setScheduledDate] = React.useState(todayIso());
  const [scheduledTime, setScheduledTime] = React.useState("09:00");
  const [observations, setObservations] = React.useState("");

  const selectedCustomer = React.useMemo(
    () => customers.find((customer) => customer.id === customerId) || null,
    [customers, customerId],
  );

  const selectedTechnician = React.useMemo(
    () =>
      technicians.find((technician) => technician.id === technicianId) || null,
    [technicians, technicianId],
  );

  const additionalTotal = React.useMemo(
    () =>
      additionalItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      ),
    [additionalItems],
  );

  const totalAmount =
    orderMode === "POOL_CLEANING" ? cleaningAmount : additionalTotal;

  React.useEffect(() => {
    const selected = FREQUENCIES.find((item) => item.value === frequency);

    setWeekdays(selected?.defaultDays ?? []);
  }, [frequency]);

  function toggleWeekday(day: Weekday) {
    setWeekdays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
  }

  function addItem() {
    const name = itemName.trim();
    const quantity = Number(itemQuantity || 0);
    const unitPrice = parseCurrency(itemUnitPriceText);

    if (!name) {
      toast.error("Informe o produto ou serviço.");
      return;
    }

    if (!quantity || quantity <= 0) {
      toast.error("Informe uma quantidade válida.");
      return;
    }

    setAdditionalItems((current) => [
      ...current,
      {
        id: makeId(),
        type: itemType,
        name,
        quantity,
        unitPrice,
      },
    ]);

    setItemName("");
    setItemQuantity("1");
    setItemUnitPriceText("R$ 0,00");
  }

  function removeItem(id: string) {
    setAdditionalItems((current) => current.filter((item) => item.id !== id));
  }

  function handleSubmit() {
    if (!selectedCustomer) {
      toast.error("Selecione o cliente/piscina.");
      return;
    }

    if (!scheduledDate) {
      toast.error("Informe a data agendada.");
      return;
    }

    if (orderMode === "ADDITIONAL" && additionalItems.length === 0) {
      toast.error("Adicione pelo menos um produto ou serviço.");
      return;
    }

    const title =
      orderMode === "POOL_CLEANING"
        ? "Limpeza de piscina"
        : additionalItems.length === 1
          ? additionalItems[0].name
          : "Produto ou serviço adicional";

    const description = buildDescription({
      orderMode,
      frequency,
      weekdays,
      technician: selectedTechnician || undefined,
      scheduledTime,
      observations,
      cleaningAmount,
      additionalItems,
    });

    startTransition(async () => {
      try {
        await createAdminWorkOrder({
          customerId: selectedCustomer.id,
          customerAddressId: selectedCustomer.addressId,
          title,
          description,
          scheduledDate,
          totalAmount,
        });

        toast.success("Ordem de serviço criada com sucesso.");
        router.push("/workorders");
      } catch (error: any) {
        toast.error(error?.message || "Erro ao criar ordem de serviço.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          Nova Ordem de Serviço
        </h1>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Tipo de Ordem
          </h2>
          <p className="text-xs text-slate-500">
            Escolha se esta OS é uma limpeza de piscina ou uma cobrança
            adicional de produto/serviço.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <CardOption
            selected={orderMode === "POOL_CLEANING"}
            title="Limpeza de Piscina"
            description="Serviço principal do cliente. Pode ser avulso, semanal, quinzenal, mensal ou diário."
            icon={<Wrench size={18} />}
            onClick={() => setOrderMode("POOL_CLEANING")}
          />

          <CardOption
            selected={orderMode === "ADDITIONAL"}
            title="Produto ou Serviço Adicional"
            description="Produtos, materiais e serviços pontuais, como cloro, pastilha, decantador, troca de areia, filtro ou conserto de bomba."
            icon={<Package size={18} />}
            onClick={() => setOrderMode("ADDITIONAL")}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Cliente e Responsável
          </h2>
          <p className="text-xs text-slate-500">
            Vincule a OS à piscina do cliente e ao técnico responsável.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Cliente/Piscina
            </label>

            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
            >
              <option value="">Selecione um cliente...</option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} — {customer.addressLabel}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="mt-2 flex items-start gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
                <span>{selectedCustomer.addressLabel}</span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Técnico responsável
            </label>

            <select
              value={technicianId}
              onChange={(event) => setTechnicianId(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
            >
              <option value="">Selecione um técnico...</option>

              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.name}
                </option>
              ))}
            </select>

            <div className="mt-2 flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                A API atual ainda não grava técnico responsável na OS. Este dado
                será salvo temporariamente na descrição.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Detalhes da OS
          </h2>
          <p className="text-xs text-slate-500">
            Configure a frequência da limpeza ou adicione produtos/serviços.
          </p>
        </div>

        {orderMode === "POOL_CLEANING" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Frequência
                  </label>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
                    {FREQUENCIES.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setFrequency(item.value)}
                        className={`min-h-[74px] rounded-xl border px-3 py-2 text-left transition ${
                          frequency === item.value
                            ? "border-sky-500 bg-sky-50 ring-1 ring-sky-100"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-sm font-semibold text-slate-900">
                          {item.label}
                        </div>
                        <div className="mt-1 text-[11px] leading-4 text-slate-600">
                          {item.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Valor da limpeza
                  </label>

                  <Input
                    value={cleaningAmountText}
                    onChange={(event) =>
                      setCleaningAmountText(
                        formatCurrencyInput(event.target.value),
                      )
                    }
                    onFocus={(event) => event.currentTarget.select()}
                    className="h-10"
                  />
                </div>
              </div>

              {frequency !== "ONCE" && (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Dias da semana
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((day) => {
                      const selected = weekdays.includes(day.value);

                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleWeekday(day.value)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            selected
                              ? "border-sky-500 bg-sky-50 text-sky-700"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {selected && <Check size={12} className="mr-1 inline" />}
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left font-semibold text-slate-700">
                      Serviço
                    </th>
                    <th className="p-3 text-left font-semibold text-slate-700">
                      Frequência
                    </th>
                    <th className="p-3 text-left font-semibold text-slate-700">
                      Dias
                    </th>
                    <th className="p-3 text-right font-semibold text-slate-700">
                      Valor
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-t">
                    <td className="p-3 font-medium text-slate-800">
                      Limpeza de piscina
                    </td>
                    <td className="p-3 text-slate-600">
                      {frequencyLabel(frequency)}
                    </td>
                    <td className="p-3 text-slate-600">
                      {weekdayLabels(weekdays)}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-800">
                      {formatCurrency(cleaningAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
              A recorrência será ativada quando o backend liberar os planos
              recorrentes. Por enquanto, será criada uma OS para a data
              agendada, mantendo a frequência registrada na descrição.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-3 lg:grid-cols-[140px_1fr_120px_160px_120px] lg:items-end">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Tipo
                  </label>
                  <select
                    value={itemType}
                    onChange={(event) =>
                      setItemType(event.target.value as AdditionalItemType)
                    }
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
                  >
                    <option value="PRODUCT">Produto</option>
                    <option value="SERVICE">Serviço</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Produto ou serviço
                  </label>
                  <Input
                    value={itemName}
                    onChange={(event) => setItemName(event.target.value)}
                    placeholder="Ex.: Cloro, pastilha, troca de areia..."
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Quantidade
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={itemQuantity}
                    onChange={(event) => setItemQuantity(event.target.value)}
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Valor unitário
                  </label>
                  <Input
                    value={itemUnitPriceText}
                    onChange={(event) =>
                      setItemUnitPriceText(
                        formatCurrencyInput(event.target.value),
                      )
                    }
                    onFocus={(event) => event.currentTarget.select()}
                    className="h-10"
                  />
                </div>

                <Button
                  type="button"
                  className="h-10 btn-brand text-white"
                  onClick={addItem}
                >
                  <Plus size={15} className="mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left font-semibold text-slate-700">
                      Tipo
                    </th>
                    <th className="p-3 text-left font-semibold text-slate-700">
                      Item
                    </th>
                    <th className="p-3 text-center font-semibold text-slate-700">
                      Qtd.
                    </th>
                    <th className="p-3 text-right font-semibold text-slate-700">
                      Valor unit.
                    </th>
                    <th className="p-3 text-right font-semibold text-slate-700">
                      Total
                    </th>
                    <th className="p-3 text-right font-semibold text-slate-700">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {additionalItems.length === 0 ? (
                    <tr className="border-t">
                      <td
                        colSpan={6}
                        className="p-6 text-center text-slate-500"
                      >
                        Nenhum produto ou serviço adicionado.
                      </td>
                    </tr>
                  ) : (
                    additionalItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3 text-slate-600">
                          {itemTypeLabel(item.type)}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          {item.name}
                        </td>
                        <td className="p-3 text-center text-slate-600">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right text-slate-600">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="p-3 text-right font-semibold text-slate-800">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 size={14} className="mr-1" />
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                <tfoot className="bg-slate-50">
                  <tr>
                    <td
                      colSpan={4}
                      className="p-3 text-right font-semibold text-slate-800"
                    >
                      Total da OS
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {formatCurrency(additionalTotal)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Observações
          </label>

          <Textarea
            value={observations}
            onChange={(event) => setObservations(event.target.value)}
            rows={4}
            placeholder="Ex.: Aplicar cloro, piscina com folhas, bomba fazendo ruído..."
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Agendamento
          </h2>
          <p className="text-xs text-slate-500">
            Defina quando o serviço deve acontecer.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Data agendada
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                type="date"
                value={scheduledDate}
                onChange={(event) => setScheduledDate(event.target.value)}
                className="h-10 pr-9"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Horário previsto
            </label>
            <div className="relative">
              <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                type="time"
                value={scheduledTime}
                onChange={(event) => setScheduledTime(event.target.value)}
                className="h-10 pr-9"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Valor total
            </label>
            <Input
              value={formatCurrency(totalAmount)}
              readOnly
              className="h-10 bg-slate-50 font-semibold text-slate-800"
            />
          </div>
        </div>

        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
          A OS criada pelo admin nasce como <strong>WAITING_EXECUTION</strong>,
          pronta para ser adicionada a uma rota. O backend atual recebe cliente,
          endereço, título, descrição, data e valor total.
        </div>
      </section>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
        >
          Voltar
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/workorders")}
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
            {pending ? "Criando..." : "Criar OS"}
          </Button>
        </div>
      </div>
    </div>
  );
}