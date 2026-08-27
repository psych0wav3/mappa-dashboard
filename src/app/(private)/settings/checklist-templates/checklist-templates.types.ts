export type ChecklistItemType = "BOOLEAN" | "TEXT" | "NUMBER";

export type ChecklistTemplateItem = {
  id?: string;
  label: string;
  itemType: ChecklistItemType;
  isRequired: boolean;
  displayOrder: number;
  isActive?: boolean;
};

export type ChecklistTemplate = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string | null;
  items: ChecklistTemplateItem[];
};

export type ApiChecklistTemplateItem = {
  id?: string | null;
  label?: string | null;
  itemType?: ChecklistItemType | string | null;
  isRequired?: boolean | null;
  displayOrder?: number | null;
  isActive?: boolean | null;
};

export type ApiChecklistTemplate = {
  id: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  items?: ApiChecklistTemplateItem[] | null;
};

export type SaveChecklistTemplateInput = {
  name: string;
  description?: string;
  isActive?: boolean;
  items: ChecklistTemplateItem[];
};
