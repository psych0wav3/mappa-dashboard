export type ApiAddress = {
  id?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isMain?: boolean | null;
};

export type ApiCustomer = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  status?: string | null;
  mainAddress?: ApiAddress | null;
  addresses?: ApiAddress[] | null;
};

export type ApiEmployee = {
  id: string;
  userId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
};

export type ApiChecklistTemplate = {
  id: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  items?: unknown[] | null;
};

export type ApiMeasurementTemplate = {
  id: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  fields?: unknown[] | null;
};

export type ApiServiceOrderItem = {
  id?: string | null;
  type?: string | null;
  description?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  subtotal?: number | null;
};

export type ApiServiceOrder = {
  id: string;
  orderNumber?: number | null;
  companyId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerAddressId?: string | null;
  address?: string | ApiAddress | null;
  title?: string | null;
  description?: string | null;
  scheduledDate?: string | null;
  totalAmount?: number | null;
  pricingNotes?: string | null;
  serviceOrderType?: string | null;
  origin?: string | null;
  status?: string | null;
  openedByUserId?: string | null;
  openedByUserName?: string | null;
  finishedByUserId?: string | null;
  finishedByUserName?: string | null;
  finishedAt?: string | null;
  customerApprovedAt?: string | null;
  createdAt?: string | null;
  visits?: unknown[] | null;
  items?: ApiServiceOrderItem[] | null;
};

export type WorkOrderCustomerOption = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  addressId: string;
  customerAddressId: string;
  addressLabel: string;
  hasValidAddress: boolean;
};

export type WorkOrderTechnicianOption = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type WorkOrderChecklistTemplateOption = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  itemsCount: number;
};

export type WorkOrderMeasurementTemplateOption = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  fieldsCount: number;
};

export type WorkOrderPricingItemType =
  | "LABOR"
  | "MATERIAL"
  | "PRODUCT"
  | "SERVICE"
  | "OTHER";

export type WorkOrderItem = {
  id?: string;
  type: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type WorkOrderListItem = {
  id: string;
  code?: string;
  orderNumber?: number | null;
  serviceOrderType?: string | null;
  origin?: string | null;
  customerId: string;
  clientId?: string;
  technicianId?: string | null;
  customerName: string;
  customerAddressId?: string | null;
  address: string;
  title: string;
  description: string;
  scheduledDate: string;
  totalAmount: number;
  pricingNotes?: string | null;
  amountCents?: number;
  status: string;
  createdAt?: string | null;
  deletedAt?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  openedByUserId?: string | null;
  openedByUserName?: string | null;
  finishedByUserId?: string | null;
  finishedByUserName?: string | null;
  finishedAt?: string | null;
  customerApprovedAt?: string | null;
  visits?: unknown[];
  items?: WorkOrderItem[];

  client?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;

  technician?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

export type CreateAdminWorkOrderInput = {
  customerId: string;
  customerAddressId: string;
  title: string;
  description: string;
  scheduledDate: string;
  notes?: string;
  items: Array<{
    type: WorkOrderPricingItemType;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
};
