"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Activity,
  Droplets,
  Pencil,
  Plus,
  Power,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  createMeasurementField,
  deleteMeasurementField,
  updateMeasurementField,
  updateMeasurementFieldStatus,
  type MeasurementField,
  type MeasurementFieldType,
} from "./actions";

type ConfirmModalState =
  | {
      type: "DEACTIVATE";
      field: MeasurementField;
    }
  | {
      type: "DELETE";
      field: MeasurementField;
    }
  | null;

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
  if (!state) return null;

  const isDelete = state.type === "DELETE";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {isDelete ? "Excluir campo de medição?" : "Desativar campo?"}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {isDelete
                ? "Essa ação pode remover o campo da configuração da empresa. Se ele já foi usado em visitas antigas, confirme com o backend se o histórico será preservado."
                : "O campo desativado não aparecerá para o técnico preencher no app."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-900">
            {state.field.label}
          </div>

          <div className="mt-1 text-xs text-slate-500">
            Nome técnico: {state.field.fieldName}
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
            className={
              isDelete
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-amber-500 text-white hover:bg-amber-600"
            }
          >
            {pending
              ? isDelete
                ? "Excluindo..."
                : "Desativando..."
              : isDelete
                ? "Sim, excluir"
                : "Sim, desativar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MeasurementFieldsClient({
  initialFields,
}: {
  initialFields: MeasurementField[];
}) {
  const [pending, startTransition] = React.useTransition();

  const [fields, setFields] = React.useState(initialFields);
  const [showForm, setShowForm] = React.useState(false);
  const [editingField, setEditingField] =
    React.useState<MeasurementField | null>(null);
  const [confirmModal, setConfirmModal] =
    React.useState<ConfirmModalState>(null);

  const [label, setLabel] = React.useState("");
  const [fieldName, setFieldName] = React.useState("");
  const [fieldType, setFieldType] =
    React.useState<MeasurementFieldType>("NUMBER");
  const [unit, setUnit] = React.useState("");
  const [isRequired, setIsRequired] = React.useState(true);
  const [isActive, setIsActive] = React.useState(true);

  const isEditing = Boolean(editingField);

  function resetForm() {
    setLabel("");
    setFieldName("");
    setFieldType("NUMBER");
    setUnit("");
    setIsRequired(true);
    setIsActive(true);
    setEditingField(null);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(field: MeasurementField) {
    setEditingField(field);
    setLabel(field.label);
    setFieldName(field.fieldName);
    setFieldType(field.fieldType);
    setUnit(field.unit || "");
    setIsRequired(field.isRequired);
    setIsActive(field.isActive);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleLabelChange(value: string) {
    setLabel(value);

    if (!fieldName.trim()) {
      setFieldName(slugify(value));
    }
  }

  function handleSave() {
    const cleanLabel = label.trim();
    const cleanFieldName = fieldName.trim() || slugify(cleanLabel);

    if (!cleanLabel) {
      toast.error("Informe o rótulo do campo.");
      return;
    }

    if (!cleanFieldName) {
      toast.error("Informe o nome técnico do campo.");
      return;
    }

    startTransition(async () => {
      try {
        if (editingField) {
          const updated = await updateMeasurementField({
            fieldId: editingField.id,
            input: {
              label: cleanLabel,
              fieldName: cleanFieldName,
              fieldType,
              unit,
              isRequired,
              isActive,
              displayOrder: editingField.displayOrder,
            },
          });

          setFields((current) =>
            current.map((field) => (field.id === updated.id ? updated : field)),
          );

          toast.success("Campo de medição atualizado com sucesso.");
        } else {
          const created = await createMeasurementField({
            label: cleanLabel,
            fieldName: cleanFieldName,
            fieldType,
            unit,
            isRequired,
            isActive,
            displayOrder: fields.length + 1,
          });

          setFields((current) => [created, ...current]);

          toast.success("Campo de medição criado com sucesso.");
        }

        resetForm();
        setShowForm(false);
      } catch (error: any) {
        toast.error(
          error?.message ||
            (editingField
              ? "Erro ao atualizar campo de medição."
              : "Erro ao criar campo de medição."),
        );
      }
    });
  }

  function activateField(field: MeasurementField) {
    startTransition(async () => {
      try {
        const updated = await updateMeasurementFieldStatus({
          fieldId: field.id,
          isActive: true,
        });

        setFields((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );

        toast.success("Campo ativado com sucesso.");
      } catch (error: any) {
        toast.error(error?.message || "Erro ao ativar campo.");
      }
    });
  }

  function confirmDeactivate(field: MeasurementField) {
    setConfirmModal({
      type: "DEACTIVATE",
      field,
    });
  }

  function confirmDelete(field: MeasurementField) {
    setConfirmModal({
      type: "DELETE",
      field,
    });
  }

  function handleConfirmModalAction() {
    if (!confirmModal) return;

    const modalState = confirmModal;

    startTransition(async () => {
      try {
        if (modalState.type === "DEACTIVATE") {
          const updated = await updateMeasurementFieldStatus({
            fieldId: modalState.field.id,
            isActive: false,
          });

          setFields((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );

          toast.success("Campo desativado com sucesso.");
        }

        if (modalState.type === "DELETE") {
          await deleteMeasurementField(modalState.field.id);

          setFields((current) =>
            current.filter((item) => item.id !== modalState.field.id),
          );

          if (editingField?.id === modalState.field.id) {
            resetForm();
            setShowForm(false);
          }

          toast.success("Campo excluído com sucesso.");
        }

        setConfirmModal(null);
      } catch (error: any) {
        toast.error(error?.message || "Não foi possível concluir a ação.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <ConfirmationModal
        state={confirmModal}
        pending={pending}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirmModalAction}
      />

      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Campos de Medição
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Configure os dados de água/serviço que o técnico deverá preencher
              no app.
            </p>
          </div>

          <Button
            type="button"
            className="btn-brand text-white"
            onClick={() => {
              if (showForm && !isEditing) {
                setShowForm(false);
                resetForm();
                return;
              }

              openCreateForm();
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo campo
          </Button>
        </div>
      </div>

      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {isEditing ? "Editar campo de medição" : "Novo campo de medição"}
              </h2>
              <p className="text-xs text-slate-500">
                Esse campo aparecerá para o técnico preencher durante ou ao
                finalizar a visita.
              </p>
            </div>

            {isEditing && (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                Editando: {editingField?.label}
              </span>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Rótulo exibido
              </label>
              <Input
                value={label}
                onChange={(event) => handleLabelChange(event.target.value)}
                placeholder="Ex.: pH da água"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nome técnico
              </label>
              <Input
                value={fieldName}
                onChange={(event) => setFieldName(event.target.value)}
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
                  const nextType = event.target.value as MeasurementFieldType;

                  setFieldType(nextType);

                  if (nextType !== "NUMBER") {
                    setUnit("");
                  }
                }}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
              >
                <option value="NUMBER">Número</option>
                <option value="TEXT">Texto</option>
                <option value="BOOLEAN">Sim/Não</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Unidade
              </label>
              <Input
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                placeholder="Ex.: ppm, pH, °C"
                disabled={fieldType !== "NUMBER"}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Obrigatoriedade
              </label>
              <select
                value={isRequired ? "REQUIRED" : "OPTIONAL"}
                onChange={(event) =>
                  setIsRequired(event.target.value === "REQUIRED")
                }
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
              >
                <option value="REQUIRED">Obrigatório</option>
                <option value="OPTIONAL">Opcional</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Status
              </label>
              <select
                value={isActive ? "ACTIVE" : "INACTIVE"}
                onChange={(event) =>
                  setIsActive(event.target.value === "ACTIVE")
                }
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              disabled={pending}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              className="btn-brand text-white"
              onClick={handleSave}
              disabled={pending}
            >
              <Save className="mr-2 h-4 w-4" />
              {pending
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Salvar campo"}
            </Button>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Droplets className="h-4 w-4 text-sky-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Campos cadastrados
            </h2>
            <p className="text-xs text-slate-500">
              Campos ativos aparecem no app do técnico durante a execução.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[20%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[21%]" />
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
                <tr key={field.id} className="border-t border-slate-200">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 shrink-0 text-sky-600" />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">
                          {field.label}
                        </div>

                        <div
                          className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                            field.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}
                        >
                          {field.isActive ? "Ativo" : "Inativo"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="truncate p-3 text-slate-600">
                    {field.fieldName}
                  </td>

                  <td className="p-3 text-slate-600">
                    {fieldTypeLabel(field.fieldType)}
                  </td>

                  <td className="p-3 text-slate-600">{field.unit || "—"}</td>

                  <td className="p-3 text-slate-600">
                    {field.isRequired ? "Sim" : "Não"}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-1.5">
                      {field.isActive ? (
                        <Button
                          type="button"
                          onClick={() => confirmDeactivate(field)}
                          disabled={pending}
                          size="sm"
                          className="h-8 w-8 p-0 bg-amber-500 text-white hover:bg-amber-600"
                          title="Desativar campo"
                        >
                          <Power className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => activateField(field)}
                          disabled={pending}
                          size="sm"
                          className="h-8 w-8 p-0 bg-emerald-600 text-white hover:bg-emerald-700"
                          title="Ativar campo"
                        >
                          <Power className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(field)}
                        disabled={pending}
                        className="h-8 w-8 p-0"
                        title="Editar campo"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDelete(field)}
                        disabled={pending}
                        className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title="Excluir campo"
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
                    className="p-10 text-center text-sm text-slate-500"
                  >
                    Nenhum campo de medição cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}