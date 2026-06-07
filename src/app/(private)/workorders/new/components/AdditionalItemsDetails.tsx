"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AdditionalItemKind = "PRODUCT" | "SERVICE";

export type AdditionalItem = {
  id: string;
  kind: AdditionalItemKind;
  name: string;
  quantity: number;
  unitPrice: number;
};

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

export function itemKindLabel(kind: AdditionalItemKind) {
  return kind === "PRODUCT" ? "Produto" : "Serviço";
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

export default function AdditionalItemsDetails({
  itemKind,
  onItemKindChange,
  itemName,
  onItemNameChange,
  itemQuantity,
  onItemQuantityChange,
  itemUnitPrice,
  onItemUnitPriceChange,
  additionalItems,
  additionalItemsTotal,
  onAddItem,
  onRemoveItem,
}: {
  itemKind: AdditionalItemKind;
  onItemKindChange: (kind: AdditionalItemKind) => void;
  itemName: string;
  onItemNameChange: (value: string) => void;
  itemQuantity: string;
  onItemQuantityChange: (value: string) => void;
  itemUnitPrice: string;
  onItemUnitPriceChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  additionalItems: AdditionalItem[];
  additionalItemsTotal: number;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
}) {
  const suggestions =
    itemKind === "PRODUCT" ? PRODUCT_SUGGESTIONS : SERVICE_SUGGESTIONS;

  return (
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
                onItemKindChange(event.target.value as AdditionalItemKind)
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
              onChange={(event) => onItemNameChange(event.target.value)}
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
              onChange={(event) => onItemQuantityChange(event.target.value)}
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
              onChange={onItemUnitPriceChange}
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
              onClick={onAddItem}
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
                    onClick={() => onRemoveItem(item.id)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}

            {additionalItems.length === 0 && (
              <tr>
                <td className="p-6 text-center text-neutral-500" colSpan={6}>
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
        Você pode adicionar vários produtos e serviços na mesma OS. O total será
        calculado automaticamente pela quantidade e valor unitário de cada item.
      </div>
    </div>
  );
}