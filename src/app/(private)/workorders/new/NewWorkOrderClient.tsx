"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createAdminWorkOrder,
  type CustomerOption,
  type TechnicianOption,
} from "@/app/(private)/workorders/actions";

type ServiceKind = "POOL_CLEANING" | "ADDITIONAL_SERVICE";
type Frequency = "ONCE" | "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";
type AdditionalItemKind = "PRODUCT" | "SERVICE";

type AdditionalItem = {
  id: string;
  kind: AdditionalItemKind;
  name: string;
  quantity: number;
  unitPrice: number;
};

const POOL_CLEANING_FREQUENCIES: Array<{
  value: Frequency;
  label: string;
  description: string;
}> = [
  {
    value: "ONCE",
    label: "Avulsa",
    description: "Uma limpeza pontual, sem recorrência.",
  },
  {
    value: "DAILY",
    label: "Diária",
    description: "Limpeza todos os dias.",
  },
  {
    value: "WEEKLY",
    label: "Semanal",
    description: "Limpeza uma vez por semana.",
  },
  {
    value: "BIWEEKLY",
    label: "Quinzenal",
    description: "Limpeza a cada 15 dias.",
  },
  {
    value: "MONTHLY",
    label: "Mensal",
    description: "Limpeza uma vez por mês.",
  },
];

const PRODUCT_SUGGESTIONS = [
  "Cloro",
  "Pastilha de cloro",
  "Decantador",
  "Algicida",
  "Clarificante",
  "Elevador de pH",
  "Redutor de pH",
  "Barrilha",
  "Sulfato de alumínio",
  "Limpa bordas",
  "Kit teste pH/cloro",
  "Refil",
  "Areia para filtro",
];

const SERVICE_SUGGESTIONS = [
  "Troca de areia",
  "Troca de filtro",
  "Conserto de bomba",
  "Tratamento de água verde",
  "Limpeza pesada",
  "Manutenção de equipamento",
  "Instalação de equipamento",
  "Aspiração extra",
  "Visita técnica",
];

function todayISO() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function onlyDigits(value: string) {
  return value.replace(/\D+/g, "");
}

function formatCurrencyFromDigits(digits: string) {
  const cents = Number(digits || "0");

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

function moneyToNumber(value: string) {
  const digits = onlyDigits(value);
  const cents = Number(digits || "0");

  return cents / 100;
}

function defaultMoney() {
  return formatCurrencyFromDigits("0");
}

function frequencyLabel(value: Frequency) {
  const found = POOL_CLEANING_FREQUENCIES.find((item) => item.value === value);

  return found?.label ?? "Avulsa";
}

function itemKindLabel(kind: AdditionalItemKind) {
  return kind === "PRODUCT" ? "Produto" : "Serviço";
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function NewWorkOrderClient({
  customers,
  technicians,
}: {
  customers: CustomerOption[];
  technicians: TechnicianOption[];
}) {
  const router = useRouter();

  const [serviceKind, setServiceKind] =
    React.useState<ServiceKind>("POOL_CLEANING");

  const [frequency, setFrequency] = React.useState<Frequency>("ONCE");

  const [customerId, setCustomerId] = React.useState("");
  const [employeeUserId, setEmployeeUserId] = React.useState("");

  const [scheduledDate, setScheduledDate] = React.useState(todayISO());
  const [scheduledTime, setScheduledTime] = React.useState("09:00");

  const [description, setDescription] = React.useState("");
  const [cleaningAmount, setCleaningAmount] = React.useState(defaultMoney());

  const [itemKind, setItemKind] =
    React.useState<AdditionalItemKind>("PRODUCT");
  const [itemName, setItemName] = React.useState("");
  const [itemQuantity, setItemQuantity] = React.useState("1");
  const [itemUnitPrice, setItemUnitPrice] = React.useState(defaultMoney());
  const [additionalItems, setAdditionalItems] = React.useState<
    AdditionalItem[]
  >([]);

  const [pending, setPending] = React.useState(false);

  const selectedCustomer = React.useMemo(
    () => customers.find((customer) => customer.id === customerId) || null,
    [customers, customerId],
  );

  const selectedTechnician = React.useMemo(
    () =>
      technicians.find((technician) => technician.id === employeeUserId) ||
      null,
    [technicians, employeeUserId],
  );

  const suggestions =
    itemKind === "PRODUCT" ? PRODUCT_SUGGESTIONS : SERVICE_SUGGESTIONS;

  const additionalItemsTotal = React.useMemo(
    () =>
      additionalItems.reduce(
        (total, item) => total + item.quantity * item.unitPrice,
        0,
      ),
    [additionalItems],
  );

  const totalAmount =
    serviceKind === "POOL_CLEANING"
      ? moneyToNumber(cleaningAmount)
      : additionalItemsTotal;

  const title =
    serviceKind === "POOL_CLEANING"
      ? "Limpeza de piscina"
      : additionalItems.length === 1
        ? additionalItems[0].name
        : "Serviço/produto adicional";

  const serviceType =
    serviceKind === "POOL_CLEANING"
      ? "Limpeza de piscina"
      : additionalItems
          .map((item) => `${itemKindLabel(item.kind)}: ${item.name}`)
          .join(" | ") || "Serviço/produto adicional";

  const canSubmit =
    Boolean(selectedCustomer?.id) &&
    Boolean(selectedCustomer?.customerAddressId) &&
    Boolean(selectedTechnician?.id) &&
    Boolean(scheduledDate) &&
    Boolean(scheduledTime) &&
    (serviceKind === "POOL_CLEANING" || additionalItems.length > 0) &&
    !pending;

  function handleCleaningMoneyChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const digits = onlyDigits(event.target.value);

    setCleaningAmount(formatCurrencyFromDigits(digits));
  }

  function handleItemUnitPriceChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const digits = onlyDigits(event.target.value);

    setItemUnitPrice(formatCurrencyFromDigits(digits));
  }

  function handleServiceKindChange(kind: ServiceKind) {
    setServiceKind(kind);
    setDescription("");

    if (kind === "POOL_CLEANING") {
      setFrequency("ONCE");
      setCleaningAmount(defaultMoney());
      return;
    }

    setItemKind("PRODUCT");
    setItemName("");
    setItemQuantity("1");
    setItemUnitPrice(defaultMoney());
    setAdditionalItems([]);
  }

  function addAdditionalItem() {
    const name = itemName.trim();
    const quantity = Number(String(itemQuantity).replace(",", "."));
    const unitPrice = moneyToNumber(itemUnitPrice);

    if (!name) {
      toast.error("Informe o produto ou serviço.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Informe uma quantidade válida.");
      return;
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      toast.error("Informe um valor unitário válido.");
      return;
    }

    setAdditionalItems((current) => [
      ...current,
      {
        id: generateId(),
        kind: itemKind,
        name,
        quantity,
        unitPrice,
      },
    ]);

    setItemName("");
    setItemQuantity("1");
    setItemUnitPrice(defaultMoney());

    toast.message("Item adicionado à OS.");
  }

  function removeAdditionalItem(id: string) {
    setAdditionalItems((current) => current.filter((item) => item.id !== id));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!canSubmit || !selectedCustomer || !selectedTechnician) return;

    try {
      setPending(true);

      await createAdminWorkOrder({
        customerId: selectedCustomer.id,
        customerAddressId: selectedCustomer.customerAddressId || "",
        employeeUserId: selectedTechnician.id,
        employeeName: selectedTechnician.name,
        serviceKind,
        serviceType,
        frequency: serviceKind === "POOL_CLEANING" ? frequency : "ONCE",
        title,
        description: description.trim(),
        scheduledDate,
        scheduledTime,
        totalAmount,
        additionalItems:
          serviceKind === "ADDITIONAL_SERVICE"
            ? additionalItems.map((item) => ({
                kind: item.kind,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice,
              }))
            : [],
      } as any);

      router.push("/workorders?created=1");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar ordem de serviço.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {customers.length === 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Nenhum cliente ativo encontrado. Cadastre um cliente antes de criar
          uma ordem de serviço.
        </div>
      )}

      {technicians.length === 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Nenhum técnico ativo encontrado. Cadastre um técnico antes de criar
          uma ordem de serviço.
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Tipo de ordem
          </h2>
          <p className="text-xs text-slate-500">
            Escolha se esta OS é uma limpeza de piscina ou uma cobrança
            adicional de produto/serviço.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => handleServiceKindChange("POOL_CLEANING")}
            className={`rounded-xl border p-4 text-left transition ${
              serviceKind === "POOL_CLEANING"
                ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="text-sm font-semibold text-slate-800">
              Limpeza de piscina
            </div>
            <div className="mt-1 text-xs leading-5 text-slate-500">
              Serviço principal do cliente. Pode ser avulso, diário, semanal,
              quinzenal ou mensal.
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleServiceKindChange("ADDITIONAL_SERVICE")}
            className={`rounded-xl border p-4 text-left transition ${
              serviceKind === "ADDITIONAL_SERVICE"
                ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="text-sm font-semibold text-slate-800">
              Produto ou serviço adicional
            </div>
            <div className="mt-1 text-xs leading-5 text-slate-500">
              Produtos, materiais e serviços pontuais, como cloro, pastilha,
              decantador, troca de areia, filtro ou conserto de bomba.
            </div>
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Cliente e responsável
          </h2>
          <p className="text-xs text-slate-500">
            Vincule a OS à piscina do cliente e ao técnico responsável.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
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
                  {customer.name}
                  {customer.address ? ` — ${customer.address}` : ""}
                </option>
              ))}
            </select>

            {selectedCustomer && !selectedCustomer.customerAddressId && (
              <div className="mt-1 text-xs text-red-600">
                Este cliente não possui endereço principal da piscina.
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Técnico responsável
            </label>

            <select
              value={employeeUserId}
              onChange={(event) => setEmployeeUserId(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
            >
              <option value="">Selecione um técnico...</option>

              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Detalhes da OS
          </h2>
          <p className="text-xs text-slate-500">
            Configure a frequência da limpeza ou adicione produtos/serviços.
          </p>
        </div>

        {serviceKind === "POOL_CLEANING" ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-5">
              {POOL_CLEANING_FREQUENCIES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFrequency(item.value)}
                  className={`rounded-lg border px-3 py-3 text-left transition ${
                    frequency === item.value
                      ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-medium text-slate-800">
                    {item.label}
                  </div>
                  <div className="mt-1 text-[11px] leading-4 text-slate-500">
                    {item.description}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Valor da limpeza
                </label>

                <Input
                  inputMode="numeric"
                  value={cleaningAmount}
                  onChange={handleCleaningMoneyChange}
                  onFocus={(event) => event.currentTarget.select()}
                  placeholder="R$ 0,00"
                />
              </div>
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
              <div className="grid gap-3 lg:grid-cols-[150px_minmax(260px,1fr)_120px_170px_120px] lg:items-start">
                <div className="space-y-1">
                  <label className="block h-5 text-sm font-medium text-slate-700">
                    Tipo
                  </label>

                  <select
                    value={itemKind}
                    onChange={(event) =>
                      setItemKind(event.target.value as AdditionalItemKind)
                    }
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
                  >
                    <option value="PRODUCT">Produto</option>
                    <option value="SERVICE">Serviço</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block h-5 text-sm font-medium text-slate-700">
                    Produto ou serviço
                  </label>

                  <Input
                    list="workorder-item-suggestions"
                    value={itemName}
                    onChange={(event) => setItemName(event.target.value)}
                    placeholder={
                      itemKind === "PRODUCT"
                        ? "Ex.: Cloro, pastilha, decantador..."
                        : "Ex.: Troca de areia, conserto de bomba..."
                    }
                    className="h-10"
                  />

                  <datalist id="workorder-item-suggestions">
                    {suggestions.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="block h-5 text-sm font-medium text-slate-700">
                    Quantidade
                  </label>

                  <Input
                    inputMode="decimal"
                    value={itemQuantity}
                    onChange={(event) => setItemQuantity(event.target.value)}
                    placeholder="1"
                    className="h-10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block h-5 text-sm font-medium text-slate-700">
                    Valor unitário
                  </label>

                  <Input
                    inputMode="numeric"
                    value={itemUnitPrice}
                    onChange={handleItemUnitPriceChange}
                    onFocus={(event) => event.currentTarget.select()}
                    placeholder="R$ 0,00"
                    className="h-10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block h-5 text-sm font-medium text-transparent">
                    Ação
                  </label>

                  <Button
                    type="button"
                    onClick={addAdditionalItem}
                    className="h-10 w-full btn-brand text-white"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left">Tipo</th>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-right">Qtd.</th>
                    <th className="p-3 text-right">Valor unit.</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {additionalItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">
                        <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {itemKindLabel(item.kind)}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {item.name}
                      </td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => removeAdditionalItem(item.id)}
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {additionalItems.length === 0 && (
                    <tr>
                      <td
                        className="p-6 text-center text-neutral-500"
                        colSpan={6}
                      >
                        Nenhum produto ou serviço adicionado.
                      </td>
                    </tr>
                  )}
                </tbody>

                <tfoot className="border-t bg-slate-50">
                  <tr>
                    <td className="p-3 text-right font-semibold" colSpan={4}>
                      Total da OS
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatCurrency(additionalItemsTotal)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
              Você pode adicionar vários produtos e serviços na mesma OS. O
              total será calculado automaticamente pela quantidade e valor
              unitário de cada item.
            </div>
          </div>
        )}

        <div className="mt-4 space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Observações
          </label>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
            placeholder={
              serviceKind === "POOL_CLEANING"
                ? "Ex.: Limpeza avulsa, piscina com folhas, verificar nível de cloro..."
                : "Ex.: Aplicar cloro, vender pastilha, trocar peça, bomba fazendo ruído..."
            }
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Agendamento
          </h2>
          <p className="text-xs text-slate-500">
            Defina quando o serviço deve acontecer.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Data agendada
            </label>

            <input
              type="date"
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Horário previsto
            </label>

            <input
              type="time"
              value={scheduledTime}
              onChange={(event) => setScheduledTime(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Valor total
            </label>

            <div className="flex h-10 items-center rounded-md border border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-800">
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-700">
          A OS criada pelo admin nasce como{" "}
          <span className="font-semibold">WAITING_EXECUTION</span>, pronta para
          ser adicionada a uma rota. Os campos de técnico, horário, tipo,
          frequência e itens já ficam preparados para o ajuste do backend.
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-slate-300 text-slate-700"
        >
          Voltar
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/workorders")}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="btn-brand text-white"
          >
            {pending ? "Criando..." : "Criar OS"}
          </Button>
        </div>
      </div>
    </form>
  );
}