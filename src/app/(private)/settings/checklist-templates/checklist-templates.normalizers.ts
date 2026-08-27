import type {
  ApiChecklistTemplate,
  ApiChecklistTemplateItem,
  ChecklistTemplate,
  ChecklistTemplateItem,
} from "./checklist-templates.types";

function normalizeChecklistItem(
  item: ApiChecklistTemplateItem,
  index: number,
): ChecklistTemplateItem {
  return {
    id: item.id || undefined,
    label: item.label || "Item sem nome",
    itemType: item.itemType === "TEXT" || item.itemType === "NUMBER" ? item.itemType : "BOOLEAN",
    isRequired: item.isRequired !== false,
    displayOrder: item.displayOrder ?? index + 1,
    isActive: item.isActive !== false,
  };
}

export function normalizeChecklistTemplate(
  template: ApiChecklistTemplate,
): ChecklistTemplate {
  const items = Array.isArray(template.items)
    ? template.items
        .map(normalizeChecklistItem)
        .filter((item) => item.isActive !== false)
        .sort((first, second) => first.displayOrder - second.displayOrder)
    : [];

  return {
    id: template.id,
    name: template.name || "Checklist sem nome",
    description: template.description ?? null,
    isActive: template.isActive !== false,
    createdAt: template.createdAt ?? null,
    items,
  };
}
