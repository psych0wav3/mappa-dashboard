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

export type ApiEmployee = {
  id: string;
  userId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
};

export type ApiServiceOrder = {
  id: string;
  companyId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerAddressId?: string | null;
  address?: string | ApiAddress | null;
  title?: string | null;
  description?: string | null;
  scheduledDate?: string | null;
  totalAmount?: number | null;
  status?: string | null;
  createdAt?: string | null;
};

export type ApiRouteListItem = {
  id: string;
  title?: string | null;
  routeDate?: string | null;
  employeeUserId?: string | null;
  employeeName?: string | null;
  status?: string | null;
  serviceOrderCount?: number | null;
  createdAt?: string | null;
};

export type ApiRouteResponse = {
  id: string;
  companyId?: string | null;
  employeeUserId?: string | null;
  employeeName?: string | null;
  title?: string | null;
  routeDate?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

export type ApiRouteDetailsResponse = ApiRouteResponse & {
  serviceOrders?: Array<{
    serviceOrderId?: string | null;
    id?: string | null;
    title?: string | null;
    customerId?: string | null;
    customerName?: string | null;
    customerAddressId?: string | null;
    address?: string | ApiAddress | null;
    latitude?: number | null;
    longitude?: number | null;
    executionOrder?: number | null;
    status?: string | null;
    description?: string | null;
    scheduledDate?: string | null;
    totalAmount?: number | null;
  }>;
};

export type RouteTechnicianOption = {
  id: string;
  name: string;
};

export type RouteWeekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type AvailableRouteWorkOrder = {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  serviceKind: "POOL_CLEANING" | "ADDITIONAL_SERVICE";
  frequencyLabel: string;
  weekdays: RouteWeekday[];
  weekdaysLabel: string;
  scheduledTime: string;
  scheduledDate: string;
  address: string;
  status: "WAITING_EXECUTION" | "READY_FOR_ROUTE";
  lat: number;
  lng: number;
  totalAmount: number;
  technicianId?: string | null;
  technicianName?: string | null;
};

export type CreateWeeklyRoutesInput = {
  employeeUserId: string;
  weekStartDate: string;
  items: Array<{
    serviceOrderId: string;
    customerName: string;
    weekdays: RouteWeekday[];
    scheduledTime: string;
    order: number;
  }>;
};

export type CreateWeeklyRoutesResult = {
  ok: boolean;
  count: number;
  routes: ApiRouteDetailsResponse[];
  error?: string;
};

export type RouteDashboardItem = {
  id: string;
  title: string;
  routeDate: string;
  employeeUserId: string;
  employeeName: string;
  status: string;
  serviceOrderCount: number;
  createdAt?: string | null;
  serviceOrders: Array<{
    id: string;
    serviceOrderId: string;
    title: string;
    customerName: string;
    address: string;
    executionOrder: number;
    status: string;
    scheduledTime?: string | null;
    scheduledDate?: string | null;
    frequencyLabel?: string | null;
    weekdaysLabel?: string | null;
    totalAmount?: number;
  }>;
};