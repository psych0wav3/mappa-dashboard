"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  createAdminWorkOrder,
  type CustomerOption,
  type TechnicianOption,
} from "@/app/(private)/workorders/actions";

import PoolCleaningDetails, {
  type Frequency,
} from "./components/PoolCleaningDetails";

import AdditionalItemsDetails, {
  type AdditionalItem,
  type AdditionalItemKind,
  itemKindLabel,
  formatCurrency,
} from "./components/AdditionalItemsDetails";

type ServiceKind = "POOL_CLEANING" | "ADDITIONAL_SERVICE";

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

function moneyToNumber(value: string) {
  const digits = onlyDigits(value);
  const cents = Number(digits || "0");

  return cents / 100;
}

function defaultMoney() {
  return formatCurrencyFromDigits("0");
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
      });

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
            Tipo de Ordem
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
              Limpeza de Piscina
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
              Produto ou Serviço Adicional
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
            Cliente e Responsável
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
          <PoolCleaningDetails
            frequency={frequency}
            onFrequencyChange={setFrequency}
            cleaningAmount={cleaningAmount}
            onCleaningAmountChange={handleCleaningMoneyChange}
          />
        ) : (
          <AdditionalItemsDetails
            itemKind={itemKind}
            onItemKindChange={setItemKind}
            itemName={itemName}
            onItemNameChange={setItemName}
            itemQuantity={itemQuantity}
            onItemQuantityChange={setItemQuantity}
            itemUnitPrice={itemUnitPrice}
            onItemUnitPriceChange={handleItemUnitPriceChange}
            additionalItems={additionalItems}
            additionalItemsTotal={additionalItemsTotal}
            onAddItem={addAdditionalItem}
            onRemoveItem={removeAdditionalItem}
          />
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