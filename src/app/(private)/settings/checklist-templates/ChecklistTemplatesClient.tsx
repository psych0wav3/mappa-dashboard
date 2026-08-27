"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ClipboardCheck,
  GripVertical,
  ListChecks,
  Pencil,
  Plus,
  Power,
  Save,
  Trash2,
  X,
} from "lucide-react";

import FormPageHeader from "@/components/form-layout/FormPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getErrorMessage } from "@/lib/mappa/errors";

import {
  createChecklistTemplate,
  updateChecklistTemplate,
  updateChecklistTemplateStatus,
  type ChecklistItemType,
  type ChecklistTemplate,
  type ChecklistTemplateItem,
} from "./actions";

type DraftItem = ChecklistTemplateItem & {
  localId: string;
};

type ConfirmModalState = {
  template: ChecklistTemplate;
} | null;

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function itemTypeLabel(type: ChecklistItemType) {
  const map: Record<ChecklistItemType, string> = {
    BOOLEAN: "Sim/Não",
    TEXT: "Texto",
    NUMBER: "Número",
  };

  return map[type] || type;
}

function defaultItem(order: number): DraftItem {
  return {
    localId: makeId(),
    label: "",
    itemType: "BOOLEAN",
    isRequired: true,
    displayOrder: order,
    isActive: true,
  };
}

function templateToDraftItems(
  template: ChecklistTemplate,
): DraftItem[] {
  if (!template.items.length) {
    return [defaultItem(1)];
  }

  return template.items.map((item, index) => ({
    ...item,
    localId: item.id || makeId(),
    displayOrder: index + 1,
  }));
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
  if (!state) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Desativar checklist?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              O checklist desativado não aparecerá para novas OS nem para o app do técnico.
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
            {state.template.items.length} item
            {state.template.items.length === 1 ? "" : "s"}{" "}
            configurado
            {state.template.items.length === 1 ? "" : "s"}
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

export default function ChecklistTemplatesClient({
  initialTemplates,
}: {
  initialTemplates: ChecklistTemplate[];
}) {
  const [pending, startTransition] = React.useTransition();

  const [templates, setTemplates] =
    React.useState(initialTemplates);

  const [showForm, setShowForm] = React.useState(false);

  const [editingTemplate, setEditingTemplate] =
    React.useState<ChecklistTemplate | null>(null);

  const [confirmModal, setConfirmModal] =
    React.useState<ConfirmModalState>(null);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [items, setItems] = React.useState<DraftItem[]>([
    {
      ...defaultItem(1),
      label: "Foto antes do serviço realizada?",
    },
    {
      ...defaultItem(2),
      label: "Removeu folhas e sujeiras da superfície?",
    },
    {
      ...defaultItem(3),
      label: "Aspirou a piscina?",
    },
    {
      ...defaultItem(4),
      label: "Foto depois do serviço realizada?",
    },
  ]);

  const isEditing = Boolean(editingTemplate);

  function resetForm() {
    setName("");
    setDescription("");
    setIsActive(true);
    setEditingTemplate(null);
    setItems([defaultItem(1)]);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(template: ChecklistTemplate) {
    setEditingTemplate(template);
    setName(template.name);
    setDescription(template.description || "");
    setIsActive(template.isActive);
    setItems(templateToDraftItems(template));
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function addItem() {
    setItems((current) => [
      ...current,
      defaultItem(current.length + 1),
    ]);
  }

  function removeItem(localId: string) {
    setItems((current) =>
      current
        .filter((item) => item.localId !== localId)
        .map((item, index) => ({
          ...item,
          displayOrder: index + 1,
        })),
    );
  }

  function updateItem(
    localId: string,
    patch: Partial<DraftItem>,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.localId === localId
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    );
  }

  function moveItem(
    localId: string,
    direction: "up" | "down",
  ) {
    setItems((current) => {
      const index = current.findIndex(
        (item) => item.localId === localId,
      );

      if (index === -1) {
        return current;
      }

      const nextIndex =
        direction === "up" ? index - 1 : index + 1;

      if (
        nextIndex < 0 ||
        nextIndex >= current.length
      ) {
        return current;
      }

      const copy = [...current];

      const currentItem = copy[index];
      const nextItem = copy[nextIndex];

      copy[index] = nextItem;
      copy[nextIndex] = currentItem;

      return copy.map((item, itemIndex) => ({
        ...item,
        displayOrder: itemIndex + 1,
      }));
    });
  }

  function buildPayloadItems() {
    return items
      .filter((item) => item.label.trim())
      .map((item, index) => ({
        id: item.id,
        label: item.label.trim(),
        itemType: item.itemType,
        isRequired: item.isRequired,
        displayOrder: index + 1,
        isActive: item.isActive !== false,
      }));
  }

  function handleSave() {
    const cleanName = name.trim();
    const cleanItems = buildPayloadItems();

    if (!cleanName) {
      toast.error("Informe o nome do checklist.");
      return;
    }

    if (cleanItems.length === 0) {
      toast.error(
        "Adicione pelo menos um item ao checklist.",
      );
      return;
    }

    startTransition(async () => {
      try {
        if (editingTemplate) {
          const updated =
            await updateChecklistTemplate({
              templateId: editingTemplate.id,
              input: {
                name: cleanName,
                description,
                isActive,
                items: cleanItems,
              },
            });

          setTemplates((current) =>
            current.map((template) =>
              template.id === updated.id
                ? updated
                : template,
            ),
          );

          toast.success(
            "Checklist atualizado com sucesso.",
          );
        } else {
          const created =
            await createChecklistTemplate({
              name: cleanName,
              description,
              isActive,
              items: cleanItems,
            });

          setTemplates((current) => [
            created,
            ...current,
          ]);

          toast.success(
            "Checklist criado com sucesso.",
          );
        }

        resetForm();
        setShowForm(false);
      } catch (error: unknown) {
        toast.error(
          getErrorMessage(
            error,
            editingTemplate
              ? "Erro ao atualizar checklist."
              : "Erro ao criar checklist.",
          ),
        );
      }
    });
  }

  function activateTemplate(
    template: ChecklistTemplate,
  ) {
    startTransition(async () => {
      try {
        const updated =
          await updateChecklistTemplateStatus({
            templateId: template.id,
            isActive: true,
          });

        setTemplates((current) =>
          current.map((item) =>
            item.id === updated.id ? updated : item,
          ),
        );

        toast.success(
          "Checklist ativado com sucesso.",
        );
      } catch (error: unknown) {
        toast.error(
          getErrorMessage(
            error,
            "Erro ao ativar checklist.",
          ),
        );
      }
    });
  }

  function confirmDeactivate(
    template: ChecklistTemplate,
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
          await updateChecklistTemplateStatus({
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

        toast.success(
          "Checklist desativado com sucesso.",
        );

        setConfirmModal(null);
      } catch (error: unknown) {
        toast.error(
          getErrorMessage(
            error,
            "Não foi possível concluir a ação.",
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

      <FormPageHeader icon={ClipboardCheck} title="Checklists de Serviço" description="Configure o que o técnico precisa executar e confirmar no app." actions={<Button type="button" className="btn-brand text-white" onClick={() => { if (showForm && !isEditing) { setShowForm(false); resetForm(); return; } openCreateForm(); }}><Plus className="mr-2 h-4 w-4" />Novo checklist</Button>} />

      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {isEditing
                  ? "Editar checklist"
                  : "Novo checklist"}
              </h2>

              <p className="text-xs text-slate-500">
                Este template será usado pelo app do
                técnico para orientar a execução.
              </p>
            </div>

            {isEditing && (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                Editando: {editingTemplate?.name}
              </span>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nome
              </label>

              <Input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Ex.: Checklist padrão de limpeza de piscina"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Status
              </label>

              <select
                value={
                  isActive ? "ACTIVE" : "INACTIVE"
                }
                onChange={(event) =>
                  setIsActive(
                    event.target.value === "ACTIVE",
                  )
                }
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">
                  Inativo
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Descrição
              </label>

              <Input
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Ex.: Usado para limpeza recorrente e avulsa."
              />
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Itens do checklist
              </h3>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="mr-1 h-4 w-4" />
                Adicionar item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.localId}
                  className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[36px_1fr_160px_140px_120px]"
                >
                  <div className="flex items-center justify-center text-slate-400">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  <Input
                    value={item.label}
                    onChange={(event) =>
                      updateItem(item.localId, {
                        label: event.target.value,
                      })
                    }
                    placeholder="Ex.: Aspirou a piscina?"
                  />

                  <select
                    value={item.itemType}
                    onChange={(event) =>
                      updateItem(item.localId, {
                        itemType: event.target
                          .value as ChecklistItemType,
                      })
                    }
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
                  >
                    <option value="BOOLEAN">
                      Sim/Não
                    </option>
                    <option value="TEXT">
                      Texto
                    </option>
                    <option value="NUMBER">
                      Número
                    </option>
                  </select>

                  <select
                    value={
                      item.isRequired
                        ? "REQUIRED"
                        : "OPTIONAL"
                    }
                    onChange={(event) =>
                      updateItem(item.localId, {
                        isRequired:
                          event.target.value ===
                          "REQUIRED",
                      })
                    }
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-400"
                  >
                    <option value="REQUIRED">
                      Obrigatório
                    </option>
                    <option value="OPTIONAL">
                      Opcional
                    </option>
                  </select>

                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={index === 0}
                      onClick={() =>
                        moveItem(item.localId, "up")
                      }
                    >
                      ↑
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        index === items.length - 1
                      }
                      onClick={() =>
                        moveItem(
                          item.localId,
                          "down",
                        )
                      }
                    >
                      ↓
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() =>
                        removeItem(item.localId)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
                  : "Salvar checklist"}
            </Button>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-sky-600" />

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Templates cadastrados
            </h2>

            <p className="text-xs text-slate-500">
              Templates ativos aparecem para novas OS e
              para o app do técnico.
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
                      {template.items.length} item
                      {template.items.length === 1
                        ? ""
                        : "s"}
                    </span>
                  </div>

                  {template.description && (
                    <p className="mt-1 text-sm text-slate-500">
                      {template.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {template.isActive ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        confirmDeactivate(template)
                      }
                      disabled={pending}
                      className="h-9 w-9 bg-amber-500 p-0 text-white hover:bg-amber-600"
                      title="Desativar checklist"
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        activateTemplate(template)
                      }
                      disabled={pending}
                      className="h-9 w-9 bg-emerald-600 p-0 text-white hover:bg-emerald-700"
                      title="Ativar checklist"
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
                    title="Editar checklist"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {template.items.map((item) => (
                  <div
                    key={
                      item.id ||
                      `${template.id}-${item.displayOrder}`
                    }
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />

                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-800">
                          {item.label}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
                          <span className="rounded-full bg-white px-2 py-0.5 text-slate-600 ring-1 ring-slate-200">
                            {itemTypeLabel(
                              item.itemType,
                            )}
                          </span>

                          <span className="rounded-full bg-white px-2 py-0.5 text-slate-600 ring-1 ring-slate-200">
                            {item.isRequired
                              ? "Obrigatório"
                              : "Opcional"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {template.items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
                    Nenhum item cadastrado.
                  </div>
                )}
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
              <ListChecks className="mx-auto h-8 w-8 text-slate-400" />

              <p className="mt-2 text-sm text-slate-500">
                Nenhum checklist cadastrado ainda.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}