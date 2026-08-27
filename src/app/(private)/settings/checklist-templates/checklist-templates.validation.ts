import type {
  ChecklistTemplateItem,
  SaveChecklistTemplateInput,
} from "./checklist-templates.types";

function cleanChecklistItems(items: ChecklistTemplateItem[]) {
  return items
    .map((item, index) => ({
      ...(item.id ? { id: item.id } : {}),
      label: item.label.trim(),
      itemType: item.itemType,
      isRequired: Boolean(item.isRequired),
      displayOrder: index + 1,
      isActive: item.isActive !== false,
    }))
    .filter((item) => item.label.length > 0);
}

export function validateChecklistInput(input: SaveChecklistTemplateInput) {
  const name = input.name.trim();
  const items = cleanChecklistItems(input.items);
  if (!name) throw new Error("Informe o nome do checklist.");
  if (!items.length) throw new Error("Adicione pelo menos um item ao checklist.");

  return {
    name,
    description: input.description?.trim() || null,
    isActive: input.isActive !== false,
    items,
  };
}
