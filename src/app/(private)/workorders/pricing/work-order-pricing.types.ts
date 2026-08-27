export type WorkOrderPricingItemType =
  | "LABOR"
  | "MATERIAL"
  | "PRODUCT"
  | "SERVICE"
  | "OTHER";

export type PriceWorkOrderInput = {
  serviceOrderId: string;
  scheduledDate: string;
  notes?: string;
  items: Array<{
    type: WorkOrderPricingItemType;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
};

export type PriceWorkOrderResponse = {
  id: string;
  status?: string | null;
  totalAmount?: number | null;
};
