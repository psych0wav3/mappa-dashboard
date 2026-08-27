"use client";

import * as React from "react";
import {
  Activity,
  Pencil,
  Plus,
  Power,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import FormPageHeader from "@/components/form-layout/FormPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/mappa/errors";

import {
  createMeasurementTemplate,
  updateMeasurementTemplate,
  updateMeasurementTemplateStatus,
  type MeasurementFieldType,
  type MeasurementTemplate,
  type MeasurementTemplateField,
} from "./actions";

function fieldTypeLabel(type: MeasurementFieldType) {
  const map: Record<MeasurementFieldType, string> = {
    NUMBER: "Número",
    TEXT: "Texto",
    BOOLEAN: "Sim/Não",
  };

  return map[type] || type;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function createLocalId() {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return `local-${crypto.randomUUID()}`;
  }

  return `local-field-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

type ConfirmModalState = {
  template: MeasurementTemplate;
} | null;

function ConfirmationModal({
  state,
  pending,
  onClose,
  onConfirm,
}: {
  state: ConfirmModalState;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!state) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Desativar template de medição?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              O template desativado não ficará disponível para novas ordens e visitas.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-900">
            {state.template.name}
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {state.template.fieldsCount} campo
            {state.template.fieldsCount === 1 ? "" : "s"} configurado
            {state.template.fieldsCount === 1 ? "" : "s"}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="bg-amber-500 text-white hover:bg-amber-600"
          >
            {pending ? "Desativando..." : "Sim, desativar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MeasurementTemplatesClient({
  initialTemplates,
}: {
  initialTemplates: MeasurementTemplate[];
}) {
  const [pending, startTransition] = React.useTransition();

  const [templates, setTemplates] =
    React.useState(initialTemplates);

  const [showForm, setShowForm] = React.useState(false);

  const [editingTemplate, setEditingTemplate] =
    React.useState<MeasurementTemplate | null>(null);

  const [confirmModal, setConfirmModal] =
    React.useState<ConfirmModalState>(null);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [fields, setFields] = React.useState<
    MeasurementTemplateField[]
  >([]);

  const [fieldLabel, setFieldLabel] = React.useState("");
  const [fieldName, setFieldName] = React.useState("");

  const [fieldType, setFieldType] =
    React.useState<MeasurementFieldType>("NUMBER");

  const [fieldUnit, setFieldUnit] = React.useState("");

  const [fieldRequired, setFieldRequired] =
    React.useState(true);

  const isEditing = Boolean(editingTemplate);

  function resetFieldForm() {
    setFieldLabel("");
    setFieldName("");
    setFieldType("NUMBER");
    setFieldUnit("");
    setFieldRequired(true);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setIsActive(true);
    setEditingTemplate(null);
    setFields([]);
    resetFieldForm();
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(
    template: MeasurementTemplate,
  ) {
    setEditingTemplate(template);
    setName(template.name);
    setDescription(template.description || "");
    setIsActive(template.isActive);

    setFields(
      template.fields.map((field, index) => ({
        ...field,
        displayOrder:
          field.displayOrder || index + 1,
      })),
    );

    resetFieldForm();
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleFieldLabelChange(value: string) {
    setFieldLabel(value);

    if (!fieldName.trim()) {
      setFieldName(slugify(value));
    }
  }

  function addField() {
    const cleanLabel = fieldLabel.trim();

    const cleanFieldName =
      fieldName.trim() || slugify(cleanLabel);

    if (!cleanLabel) {
      toast.error("Informe o rótulo do campo.");
      return;
    }

    if (!cleanFieldName) {
      toast.error(
        "Informe o nome técnico do campo.",
      );
      return;
    }

    const alreadyExists = fields.some(
      (field) =>
        field.fieldName.toLowerCase() ===
        cleanFieldName.toLowerCase(),
    );

    if (alreadyExists) {
      toast.error(
        "Já existe um campo com esse nome técnico no template.",
      );
      return;
    }

    setFields((current) => [
      ...current,
      {
        id: createLocalId(),
        fieldName: cleanFieldName,
        label: cleanLabel,
        fieldType,
        unit:
          fieldType === "NUMBER"
            ? fieldUnit.trim() || null
            : null,
        minValue: 0,
        maxValue: 0,
        isRequired: fieldRequired,
        displayOrder: current.length + 1,
        isActive: true,
      },
    ]);

    resetFieldForm();
  }

  function removeField(fieldId: string) {
    setFields((current) =>
      current
        .filter((field) => field.id !== fieldId)
        .map((field, index) => ({
          ...field,
          displayOrder: index + 1,
        })),
    );
  }

  function handleSave() {
    const input = {
      name,
      description,
      isActive,
      fields,
    };

    if (!fields.length) {
      toast.error(
        "Adicione ao menos um campo ao template.",
      );
      return;
    }

    startTransition(async () => {
      try {
        if (editingTemplate) {
          const updated =
            await updateMeasurementTemplate({
              templateId: editingTemplate.id,
              input,
            });

          setTemplates((current) =>
            current.map((item) =>
              item.id === updated.id
                ? updated
                : item,
            ),
          );

          toast.success(
            "Template de medição atualizado com sucesso.",
          );
        } else {
          const created =
            await createMeasurementTemplate(input);

          setTemplates((current) => [
            created,
            ...current,
          ]);

          toast.success(
            "Template de medição criado com sucesso.",
          );
        }

        resetForm();
        setShowForm(false);
      } catch (error: unknown) {
        toast.error(
          getErrorMessage(
            error,
            "Não foi possível salvar o template.",
          ),
        );
      }
    });
  }

  function activateTemplate(
    template: MeasurementTemplate,
  ) {
    startTransition(async () => {
      try {
        const updated =
          await updateMeasurementTemplateStatus({
            templateId: template.id,
            isActive: true,
          });

        setTemplates((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item,
          ),
        );

        toast.success(
          "Template de medição ativado com sucesso.",
        );
      } catch (error: unknown) {
        toast.error(
          getErrorMessage(
            error,
            "Erro ao ativar template de medição.",
          ),
        );
      }
    });
  }

  function confirmDeactivate(
    template: MeasurementTemplate,
  ) {
    setConfirmModal({ template });
  }

  function handleConfirmModalAction() {
    if (!confirmModal) {
      return;
    }

    const modalState = confirmModal;

    startTransition(async () => {
      try {
        const updated =
          await updateMeasurementTemplateStatus({
            templateId: modalState.template.id,
            isActive: false,
          });

        setTemplates((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item,
          ),
        );

        if (editingTemplate?.id === updated.id) {
          setEditingTemplate(updated);
          setIsActive(false);
        }

        toast.success(
          "Template de medição desativado com sucesso.",
        );

        setConfirmModal(null);
      } catch (error: unknown) {
        toast.error(
          getErrorMessage(
            error,
            "Erro ao desativar template de medição.",
          ),
        );
      }
    });
  }

  return (
    <div className="space-y-5">
      <ConfirmationModal
        state={confirmModal}
        pending={pending}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirmModalAction}
      />

      <FormPageHeader
        icon={Activity}
        title="Templates de Medição"
        description="Configure modelos de medições para uso nas ordens e visitas."
        actions={
          <Button
            type="button"
            className="btn-brand text-white"
            onClick={() => {
              if (
                showForm &&
                !isEditing
              ) {
                resetForm();
                setShowForm(false);
                return;
              }

              openCreateForm();
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo template
          </Button>
        }
      />

      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {isEditing
                  ? "Editar template"
                  : "Novo template"}
              </h2>

              <p className="text-xs text-slate-500">
                Crie o template com os campos que o
                técnico deverá preencher.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fechar formulário"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nome
              </label>

              <Input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Ex.: Medição padrão"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Status
              </label>

              <select
                value={
                  isActive
                    ? "ACTIVE"
                    : "INACTIVE"
                }
                onChange={(event) =>
                  setIsActive(
                    event.target.value ===
                      "ACTIVE",
                  )
                }
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
              >
                <option value="ACTIVE">
                  Ativo
                </option>

                <option value="INACTIVE">
                  Inativo
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Descrição
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                className="min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
                placeholder="Observações sobre quando usar este template."
              />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Campos do template
                </h3>

                <p className="text-xs text-slate-500">
                  Adicione pH, cloro,
                  alcalinidade ou qualquer
                  medição usada na visita.
                </p>
              </div>

              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                {fields.length} campo
                {fields.length === 1
                  ? ""
                  : "s"}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="xl:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Rótulo exibido
                </label>

                <Input
                  value={fieldLabel}
                  onChange={(event) =>
                    handleFieldLabelChange(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: pH da água"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Nome técnico
                </label>

                <Input
                  value={fieldName}
                  onChange={(event) =>
                    setFieldName(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: ph"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Tipo
                </label>

                <select
                  value={fieldType}
                  onChange={(event) => {
                    const nextType =
                      event.target
                        .value as MeasurementFieldType;

                    setFieldType(nextType);

                    if (
                      nextType !== "NUMBER"
                    ) {
                      setFieldUnit("");
                    }
                  }}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
                >
                  <option value="NUMBER">
                    Número
                  </option>

                  <option value="TEXT">
                    Texto
                  </option>

                  <option value="BOOLEAN">
                    Sim/Não
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Unidade
                </label>

                <Input
                  value={fieldUnit}
                  onChange={(event) =>
                    setFieldUnit(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: ppm"
                  disabled={
                    fieldType !== "NUMBER"
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Obrigatoriedade
                </label>

                <select
                  value={
                    fieldRequired
                      ? "REQUIRED"
                      : "OPTIONAL"
                  }
                  onChange={(event) =>
                    setFieldRequired(
                      event.target.value ===
                        "REQUIRED",
                    )
                  }
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
                >
                  <option value="REQUIRED">
                    Obrigatório
                  </option>

                  <option value="OPTIONAL">
                    Opcional
                  </option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={addField}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar campo
                </Button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[22%]" />
                  <col className="w-[16%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[8%]" />
                </colgroup>

                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left font-semibold text-slate-700">
                      Campo
                    </th>

                    <th className="p-3 text-left font-semibold text-slate-700">
                      Nome técnico
                    </th>

                    <th className="p-3 text-left font-semibold text-slate-700">
                      Tipo
                    </th>

                    <th className="p-3 text-left font-semibold text-slate-700">
                      Unidade
                    </th>

                    <th className="p-3 text-left font-semibold text-slate-700">
                      Obrigatório
                    </th>

                    <th className="p-3 text-right font-semibold text-slate-700">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {fields.map((field) => (
                    <tr
                      key={field.id}
                      className="border-t border-slate-200"
                    >
                      <td className="truncate p-3 font-medium text-slate-900">
                        {field.label}
                      </td>

                      <td className="truncate p-3 text-slate-600">
                        {field.fieldName}
                      </td>

                      <td className="p-3 text-slate-600">
                        {fieldTypeLabel(
                          field.fieldType,
                        )}
                      </td>

                      <td className="p-3 text-slate-600">
                        {field.unit || "-"}
                      </td>

                      <td className="p-3 text-slate-600">
                        {field.isRequired
                          ? "Sim"
                          : "Não"}
                      </td>

                      <td className="p-3">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 border-slate-200 p-0 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() =>
                              removeField(
                                field.id,
                              )
                            }
                            title="Remover campo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {fields.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-sm text-slate-500"
                      >
                        Nenhum campo adicionado
                        ao template ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              className="btn-brand text-white"
              disabled={pending}
              onClick={handleSave}
            >
              <Save className="mr-2 h-4 w-4" />

              {pending
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Salvar template"}
            </Button>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-sky-600" />

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Templates cadastrados
            </h2>

            <p className="text-xs text-slate-500">
              Templates ativos aparecem para
              novas OS e para o app do técnico.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {template.name}
                    </h3>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        template.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {template.isActive
                        ? "Ativo"
                        : "Inativo"}
                    </span>

                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                      {template.fields.length}{" "}
                      campo
                      {template.fields.length ===
                      1
                        ? ""
                        : "s"}
                    </span>
                  </div>

                  {template.description && (
                    <p className="mt-1 text-sm text-slate-500">
                      {
                        template.description
                      }
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {template.isActive ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        confirmDeactivate(
                          template,
                        )
                      }
                      disabled={pending}
                      className="h-9 w-9 bg-amber-500 p-0 text-white hover:bg-amber-600"
                      title="Desativar template"
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        activateTemplate(
                          template,
                        )
                      }
                      disabled={pending}
                      className="h-9 w-9 bg-emerald-600 p-0 text-white hover:bg-emerald-700"
                      title="Ativar template"
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openEditForm(template)
                    }
                    disabled={pending}
                    className="h-9 w-9 p-0"
                    title="Editar template"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {template.fields.map(
                  (field) => (
                    <div
                      key={field.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="flex items-start gap-2">
                        <Activity className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />

                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-800">
                            {field.label}
                          </div>

                          <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                            <span className="rounded-full bg-white px-2 py-0.5 text-slate-600 ring-1 ring-slate-200">
                              {fieldTypeLabel(
                                field.fieldType,
                              )}
                            </span>

                            {field.unit && (
                              <span className="rounded-full bg-white px-2 py-0.5 text-slate-600 ring-1 ring-slate-200">
                                {
                                  field.unit
                                }
                              </span>
                            )}

                            <span className="rounded-full bg-white px-2 py-0.5 text-slate-600 ring-1 ring-slate-200">
                              {field.isRequired
                                ? "Obrigatório"
                                : "Opcional"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                )}

                {template.fields.length ===
                  0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
                    Nenhum campo cadastrado.
                  </div>
                )}
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
              <Activity className="mx-auto h-8 w-8 text-slate-400" />

              <p className="mt-2 text-sm text-slate-500">
                Nenhum template de medição
                cadastrado ainda.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}