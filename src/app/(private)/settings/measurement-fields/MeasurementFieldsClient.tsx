"use client";

import Link from "next/link";
import * as React from "react";
import {
  Activity,
  Gauge,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

import FormPageHeader from "@/components/form-layout/FormPageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/mappa/errors";

import {
  createMeasurementField,
  updateMeasurementField,
  updateMeasurementFieldStatus,
  type MeasurementField,
  type MeasurementFieldTemplate,
  type SaveMeasurementFieldInput,
} from "./actions";
import type { MeasurementFieldType } from "../measurement-templates/actions";

type FieldDraft = SaveMeasurementFieldInput;

const fieldTypeLabels: Record<MeasurementFieldType, string> = {
  NUMBER: "Número",
  TEXT: "Texto",
  BOOLEAN: "Sim/Não",
};

function sortFields(fields: MeasurementField[]) {
  return [...fields].sort((first, second) => {
    if (first.isActive !== second.isActive) return first.isActive ? -1 : 1;
    if (first.displayOrder !== second.displayOrder) {
      return first.displayOrder - second.displayOrder;
    }
    return first.label.localeCompare(second.label, "pt-BR");
  });
}

function fieldTemplateMap(templates: MeasurementFieldTemplate[]) {
  return new Map(
    templates.flatMap((template) =>
      template.fields.map((field) => [field.id, template] as const),
    ),
  );
}

function nextOrder(
  template?: MeasurementFieldTemplate,
  existingFields: MeasurementField[] = [],
) {
  const orders = [
    ...(template?.fields.map((field) => field.displayOrder) || []),
    ...existingFields.map((field) => field.displayOrder),
  ];

  return orders.length ? Math.max(...orders) + 1 : 1;
}

function emptyDraft(
  template?: MeasurementFieldTemplate,
  existingFields: MeasurementField[] = [],
): FieldDraft {
  return {
    name: "",
    label: "",
    fieldType: "NUMBER",
    unit: "",
    minValue: null,
    maxValue: null,
    isRequired: false,
    displayOrder: nextOrder(template, existingFields),
    measurementTemplateId: template?.id || null,
  };
}

function numberOrNull(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function valueSummary(field: MeasurementField) {
  if (field.fieldType !== "NUMBER") return fieldTypeLabels[field.fieldType];

  const range = [field.minValue, field.maxValue]
    .filter((value): value is number => typeof value === "number")
    .join(" até ");

  return [fieldTypeLabels[field.fieldType], field.unit, range]
    .filter(Boolean)
    .join(" · ");
}

export default function MeasurementFieldsClient({
  initialFields,
  templates,
}: {
  initialFields: MeasurementField[];
  templates: MeasurementFieldTemplate[];
}) {
  const [pending, startTransition] = React.useTransition();
  const [fields, setFields] = React.useState(() => sortFields(initialFields));
  const [editingField, setEditingField] = React.useState<MeasurementField | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  const activeTemplates = React.useMemo(
    () => templates.filter((template) => template.isActive),
    [templates],
  );
  const templateByFieldId = React.useMemo(
    () => fieldTemplateMap(templates),
    [templates],
  );
  const defaultTemplate = activeTemplates[0];
  const [draft, setDraft] = React.useState<FieldDraft>(() =>
    emptyDraft(defaultTemplate, initialFields),
  );

  function updateDraft<Key extends keyof FieldDraft>(key: Key, value: FieldDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function openCreateForm() {
    setEditingField(null);
    setDraft(emptyDraft(defaultTemplate, fields));
    setShowForm(true);
  }

  function openEditForm(field: MeasurementField) {
    const template = templateByFieldId.get(field.id);
    setEditingField(field);
    setDraft({
      name: field.name,
      label: field.label,
      fieldType: field.fieldType,
      unit: field.unit || "",
      minValue: field.minValue ?? null,
      maxValue: field.maxValue ?? null,
      isRequired: field.isRequired,
      displayOrder: field.displayOrder,
      measurementTemplateId: template?.id || null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    if (pending) return;
    setEditingField(null);
    setDraft(emptyDraft(defaultTemplate, fields));
    setShowForm(false);
  }

  function submitField(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const saved = editingField
          ? await updateMeasurementField({ fieldId: editingField.id, input: draft })
          : await createMeasurementField(draft);

        setFields((current) =>
          sortFields(
            editingField
              ? current.map((field) => (field.id === saved.id ? saved : field))
              : [...current, saved],
          ),
        );
        toast.success(editingField ? "Campo atualizado." : "Campo criado.");
        setEditingField(null);
        setDraft(emptyDraft(defaultTemplate, fields));
        setShowForm(false);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível salvar o campo."));
      }
    });
  }

  function toggleStatus(field: MeasurementField) {
    const isActive = !field.isActive;
    startTransition(async () => {
      try {
        const updated = await updateMeasurementFieldStatus({
          fieldId: field.id,
          isActive,
        });
        setFields((current) =>
          sortFields(current.map((item) => (item.id === updated.id ? updated : item))),
        );
        toast.success(isActive ? "Campo ativado." : "Campo desativado.");
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível alterar o status."));
      }
    });
  }

  return (
    <div className="space-y-6">
      <FormPageHeader
        icon={Gauge}
        title="Campos de medição"
        description="Configure os dados coletados nas visitas técnicas e vincule novos campos a um template ativo."
        actions={
          <Button
            type="button"
            onClick={openCreateForm}
            disabled={pending || activeTemplates.length === 0}
            className="w-full gap-2 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Novo campo
          </Button>
        }
      />

      {activeTemplates.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          É necessário ter ao menos um template de medição ativo antes de criar campos.{" "}
          <Link href="/settings/measurement-templates" className="font-semibold underline">
            Configurar templates
          </Link>
        </div>
      ) : null}

      {showForm ? (
        <form
          onSubmit={submitField}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {editingField ? "Editar campo" : "Novo campo"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                O identificador e o template não podem ser trocados após a criação.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              disabled={pending}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fechar formulário"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Identificador</span>
              <Input
                value={draft.name}
                onChange={(event) => updateDraft("name", event.target.value)}
                placeholder="Ex.: ph, cloro_livre"
                disabled={Boolean(editingField) || pending}
                required
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Nome exibido</span>
              <Input
                value={draft.label}
                onChange={(event) => updateDraft("label", event.target.value)}
                placeholder="Ex.: Cloro livre"
                disabled={pending}
                required
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Template</span>
              <select
                value={draft.measurementTemplateId || ""}
                onChange={(event) => {
                  const template = activeTemplates.find(
                    (item) => item.id === event.target.value,
                  );
                  setDraft((current) => ({
                    ...current,
                    measurementTemplateId: event.target.value,
                    displayOrder: nextOrder(template, fields),
                  }));
                }}
                disabled={Boolean(editingField) || pending}
                required={!editingField}
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 disabled:bg-slate-50"
              >
                <option value="">Selecione</option>
                {activeTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Tipo</span>
              <select
                value={draft.fieldType}
                onChange={(event) =>
                  updateDraft("fieldType", event.target.value as MeasurementFieldType)
                }
                disabled={pending}
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              >
                {Object.entries(fieldTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            {draft.fieldType === "NUMBER" ? (
              <>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Unidade</span>
                  <Input
                    value={draft.unit || ""}
                    onChange={(event) => updateDraft("unit", event.target.value)}
                    placeholder="Ex.: ppm, °C"
                    disabled={pending}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span>Mínimo</span>
                    <Input
                      type="number"
                      step="any"
                      value={draft.minValue ?? ""}
                      onChange={(event) =>
                        updateDraft("minValue", numberOrNull(event.target.value))
                      }
                      disabled={pending}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span>Máximo</span>
                    <Input
                      type="number"
                      step="any"
                      value={draft.maxValue ?? ""}
                      onChange={(event) =>
                        updateDraft("maxValue", numberOrNull(event.target.value))
                      }
                      disabled={pending}
                    />
                  </label>
                </div>
              </>
            ) : null}

            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Ordem de exibição</span>
              <Input
                type="number"
                min={1}
                step={1}
                value={draft.displayOrder}
                onChange={(event) =>
                  updateDraft("displayOrder", Number(event.target.value))
                }
                disabled={pending}
                required
              />
            </label>

            <label className="flex items-center gap-2 self-end rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
              <Checkbox
                checked={draft.isRequired}
                onChange={(event) => updateDraft("isRequired", event.target.checked)}
                disabled={pending}
              />
              Obrigatório durante a visita
            </label>
          </div>

          <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={closeForm} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending} className="gap-2">
              <Save className="h-4 w-4" />
              {pending ? "Salvando..." : "Salvar campo"}
            </Button>
          </div>
        </form>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-slate-900">Campos cadastrados</h2>
          <p className="mt-1 text-sm text-slate-500">
            {fields.length} campo{fields.length === 1 ? "" : "s"} encontrado{fields.length === 1 ? "" : "s"}.
          </p>
        </div>

        {fields.length ? (
          <div className="divide-y divide-slate-100">
            {fields.map((field) => {
              const template = templateByFieldId.get(field.id);
              return (
                <article
                  key={field.id}
                  className={`flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
                    field.isActive ? "" : "bg-slate-50 opacity-75"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{field.label}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            field.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {field.isActive ? "Ativo" : "Inativo"}
                        </span>
                        {field.isRequired ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Obrigatório
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 break-words text-sm text-slate-500">
                        {field.name} · {valueSummary(field)} · ordem {field.displayOrder}
                      </p>
                      {template ? (
                        <p className="mt-1 text-xs text-slate-400">
                          Template: {template.name}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(field)}
                      disabled={pending}
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(field)}
                      disabled={pending}
                      className="gap-2"
                    >
                      {field.isActive ? (
                        <Power className="h-4 w-4" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                      {field.isActive ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <Gauge className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 font-medium text-slate-700">Nenhum campo cadastrado</p>
            <p className="mt-1 text-sm text-slate-500">
              Crie o primeiro campo para utilizá-lo nas visitas técnicas.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
