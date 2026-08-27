export type ServicePlanStatus =
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "PAUSED"
  | "CANCELED"
  | "FINISHED";

export type RecurrenceFrequencyType =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

export type ServicePlanRecurrence = {
  frequencyType: RecurrenceFrequencyType;
  intervalValue: number;
  daysOfWeek: number[];
  dayOfMonth?: number | null;
  generateDaysAhead: number;
};

export type ServicePlan = {
  id: string;
  customerId?: string | null;
  customerName: string;
  customerAddressId?: string | null;
  checklistTemplateId?: string | null;
  measurementTemplateId?: string | null;
  preferredEmployeeUserId?: string | null;
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  totalAmount?: number | null;
  status: ServicePlanStatus;
  createdAt?: string | null;
  recurrence: ServicePlanRecurrence;
};

export type ApiRecurrence = {
  frequencyType?: string | null;
  intervalValue?: number | null;
  daysOfWeek?: number[] | null;
  dayOfMonth?: number | null;
  generateDaysAhead?: number | null;
};

export type ApiServicePlan = {
  id: string;
  customerId?: string | null;
  customerName?: string | null;
  customerAddressId?: string | null;
  checklistTemplateId?: string | null;
  measurementTemplateId?: string | null;
  preferredEmployeeUserId?: string | null;
  title?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  totalAmount?: number | null;
  status?: string | null;
  createdAt?: string | null;
  recurrence?: ApiRecurrence | null;
};

export type SaveServicePlanInput = {
  customerId: string;
  customerAddressId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  totalAmount: number;
  checklistTemplateId?: string;
  measurementTemplateId?: string;
  preferredEmployeeUserId?: string;
  recurrence: ServicePlanRecurrence;
};

export type ListServicePlansFilters = {
  status?: ServicePlanStatus;
  customerId?: string;
};
