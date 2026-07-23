"use server";

import { revalidatePath } from "next/cache";

import {
  extractItems,
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

type ApiAddress = {
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

type ApiCustomer = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  status?: string | null;
  mainAddress?: ApiAddress | null;
  addresses?: ApiAddress[] | null;
};

type ApiEmployee = {
  id: string;
  userId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
};

type ApiChecklistTemplate = {
  id: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  items?: unknown[] | null;
};

type ApiMeasurementTemplate = {
  id: string;
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  fields?: unknown[] | null;
};

type ApiServiceOrder = {
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
  openedByUserId?: string | null;
  openedByUserName?: string | null;
  finishedByUserId?: string | null;
  finishedByUserName?: string | null;
  finishedAt?: string | null;
  customerApprovedAt?: string | null;
  createdAt?: string | null;
  visits?: unknown[] | null;
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

export type WorkOrderListItem = {
  id: string;
  code?: string;
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

  client?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;

  technician?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

export type PriceWorkOrderInput = {
  serviceOrderId: string;
  scheduledDate: string;
  totalAmount: number;
};

export type CreateAdminWorkOrderInput = {
  customerId: string;
  customerAddressId: string;
  title: string;
  description: string;
  scheduledDate: string;
  totalAmount: number;
};

function toApiDate(value: string) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] =
      value.split("/");

    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

function toApiStatus(value?: string) {
  if (!value) {
    return "";
  }

  const normalized = value
    .replace(/[_\s-]/g, "")
    .toUpperCase();

  const statuses: Record<string, string> = {
    PENDINGCOMPANYPRICING:
      "PendingCompanyPricing",

    PENDINGCUSTOMERAPPROVAL:
      "PendingCustomerApproval",

    WAITINGEXECUTION:
      "WaitingExecution",

    INROUTE:
      "InRoute",

    INPROGRESS:
      "InProgress",

    DONE:
      "Done",

    FINISHED:
      "Done",

    CANCELED:
      "Canceled",

    CANCELLED:
      "Canceled",

    APPROVED:
      "WaitingExecution",
  };

  return statuses[normalized] || value;
}

function normalizeStatus(
  value?: string | null,
) {
  const normalized = String(
    value || "WaitingExecution",
  )
    .replace(/[_\s-]/g, "")
    .toUpperCase();

  const statuses: Record<string, string> = {
    PENDINGCOMPANYPRICING:
      "PendingCompanyPricing",

    PENDINGCUSTOMERAPPROVAL:
      "PendingCustomerApproval",

    WAITINGEXECUTION:
      "WaitingExecution",

    INROUTE:
      "InRoute",

    INPROGRESS:
      "InProgress",

    DONE:
      "Done",

    FINISHED:
      "Done",

    CANCELED:
      "Canceled",

    CANCELLED:
      "Canceled",
  };

  return (
    statuses[normalized] ||
    value ||
    "WaitingExecution"
  );
}

function addressLabel(
  address?: ApiAddress | null,
) {
  if (!address) {
    return "Endereço não informado";
  }

  const line = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    address.city &&
      `${address.city}${
        address.state
          ? `/${address.state}`
          : ""
      }`,
    address.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return line || "Endereço não informado";
}

function serviceOrderAddressLabel(
  address?: string | ApiAddress | null,
) {
  if (!address) {
    return "Endereço não informado";
  }

  if (typeof address === "string") {
    return (
      address || "Endereço não informado"
    );
  }

  return addressLabel(address);
}

function getMainAddress(
  customer: ApiCustomer,
) {
  if (customer.mainAddress) {
    return customer.mainAddress;
  }

  if (Array.isArray(customer.addresses)) {
    return (
      customer.addresses.find(
        (address) =>
          address.isMain === true,
      ) ||
      customer.addresses[0] ||
      null
    );
  }

  return null;
}

function normalizeWorkOrder(
  order: ApiServiceOrder,
): WorkOrderListItem {
  const totalAmount = Number(
    order.totalAmount || 0,
  );

  return {
    id: order.id,
    code: order.id,
    customerId: order.customerId || "",
    clientId: order.customerId || "",
    technicianId: null,

    customerName:
      order.customerName ||
      "Cliente não informado",

    customerAddressId:
      order.customerAddressId ?? null,

    address: serviceOrderAddressLabel(
      order.address,
    ),

    title:
      order.title || "Ordem de serviço",

    description:
      order.description || "",

    scheduledDate:
      order.scheduledDate || "",

    totalAmount,

    amountCents:
      Math.round(totalAmount * 100),

    status: normalizeStatus(order.status),

    createdAt:
      order.createdAt ?? null,

    deletedAt: null,
    startTime: null,
    endTime: null,

    openedByUserId:
      order.openedByUserId ?? null,

    openedByUserName:
      order.openedByUserName ?? null,

    finishedByUserId:
      order.finishedByUserId ?? null,

    finishedByUserName:
      order.finishedByUserName ?? null,

    finishedAt:
      order.finishedAt ?? null,

    customerApprovedAt:
      order.customerApprovedAt ?? null,

    visits:
      order.visits ?? [],

    client: {
      firstName:
        order.customerName || "Cliente",
      lastName: "",
    },

    technician: null,
  };
}

export async function listWorkOrders(
  options?: {
    status?: string;
    customerId?: string;
    scheduledDate?: string;
  },
): Promise<WorkOrderListItem[]> {
  const companyId = await getCompanyId();
  const params = new URLSearchParams();

  const status = toApiStatus(
    options?.status,
  );

  if (status) {
    params.set("status", status);
  }

  if (options?.customerId) {
    params.set(
      "customerId",
      options.customerId,
    );
  }

  if (options?.scheduledDate) {
    params.set(
      "scheduledDate",
      toApiDate(
        options.scheduledDate,
      ),
    );
  }

  const query = params.toString();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/service-orders${
      query ? `?${query}` : ""
    }`,
  );

  const summaries =
    extractItems<ApiServiceOrder>(data);

  const hydrated = await Promise.all(
    summaries.map(async (summary) => {
      try {
        const details =
          await mappaFetch<ApiServiceOrder>(
            `/api/companies/${companyId}/service-orders/${summary.id}`,
          );

        return {
          ...summary,
          ...details,
          customerName:
            details.customerName ||
            summary.customerName,
          customerId:
            details.customerId ||
            summary.customerId,
          customerAddressId:
            details.customerAddressId ||
            summary.customerAddressId,
          address:
            details.address ||
            summary.address,
        };
      } catch {
        return summary;
      }
    }),
  );

  return hydrated.map(normalizeWorkOrder);
}

export async function getWorkOrderById(
  serviceOrderId: string,
) {
  const companyId = await getCompanyId();

  if (!serviceOrderId) {
    throw new Error(
      "ID da ordem de serviço não informado.",
    );
  }

  const data =
    await mappaFetch<ApiServiceOrder>(
      `/api/companies/${companyId}/service-orders/${serviceOrderId}`,
    );

  return normalizeWorkOrder(data);
}

export async function listWorkOrderCustomers(): Promise<
  WorkOrderCustomerOption[]
> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/customers?status=ACTIVE`,
  );

  const summaries =
    extractItems<ApiCustomer>(data);

  const customers = await Promise.all(
    summaries.map(async (summary) => {
      try {
        return await mappaFetch<ApiCustomer>(
          `/api/companies/${companyId}/customers/${summary.id}`,
        );
      } catch {
        return summary;
      }
    }),
  );

  return customers
    .map((customer) => {
      const mainAddress =
        getMainAddress(customer);

      const addressId =
        mainAddress?.id || "";

      return {
        id: customer.id,

        name:
          customer.name ||
          "Cliente sem nome",

        email:
          customer.email ?? null,

        phone:
          customer.phone ?? null,

        document:
          customer.document ?? null,

        addressId,
        customerAddressId: addressId,

        addressLabel:
          addressLabel(mainAddress),

        hasValidAddress:
          Boolean(addressId),
      };
    })
    .sort((first, second) =>
      first.name.localeCompare(
        second.name,
        "pt-BR",
      ),
    );
}

export async function listWorkOrderTechnicians(): Promise<
  WorkOrderTechnicianOption[]
> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/employees`,
  );

  return extractItems<ApiEmployee>(data)
    .filter(
      (employee) =>
        String(employee.status || "")
          .toUpperCase() !== "INACTIVE",
    )
    .map((employee) => ({
      id:
        employee.userId ||
        employee.id,

      name:
        employee.name ||
        employee.email ||
        "Técnico sem nome",

      email:
        employee.email ?? null,

      phone:
        employee.phone ?? null,
    }))
    .sort((first, second) =>
      first.name.localeCompare(
        second.name,
        "pt-BR",
      ),
    );
}

export async function listWorkOrderChecklistTemplates(): Promise<
  WorkOrderChecklistTemplateOption[]
> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/checklist-templates?activeOnly=true`,
  );

  return extractItems<ApiChecklistTemplate>(
    data,
  )
    .map((template) => ({
      id: template.id,

      name:
        template.name ||
        "Checklist sem nome",

      description:
        template.description ?? null,

      isActive:
        template.isActive !== false,

      itemsCount:
        Array.isArray(template.items)
          ? template.items.length
          : 0,
    }))
    .filter(
      (template) =>
        template.isActive,
    )
    .sort((first, second) =>
      first.name.localeCompare(
        second.name,
        "pt-BR",
      ),
    );
}

export async function listWorkOrderMeasurementTemplates(): Promise<
  WorkOrderMeasurementTemplateOption[]
> {
  const companyId = await getCompanyId();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/measurement-templates?activeOnly=true`,
  );

  return extractItems<ApiMeasurementTemplate>(
    data,
  )
    .map((template) => ({
      id: template.id,

      name:
        template.name ||
        "Template sem nome",

      description:
        template.description ?? null,

      isActive:
        template.isActive !== false,

      fieldsCount:
        Array.isArray(template.fields)
          ? template.fields.length
          : 0,
    }))
    .filter(
      (template) =>
        template.isActive,
    )
    .sort((first, second) =>
      first.name.localeCompare(
        second.name,
        "pt-BR",
      ),
    );
}

export async function createAdminWorkOrder(
  input: CreateAdminWorkOrderInput,
) {
  const companyId = await getCompanyId();

  if (!input.customerId) {
    throw new Error(
      "Selecione o cliente/piscina.",
    );
  }

  if (!input.customerAddressId) {
    throw new Error(
      "O cliente selecionado não possui endereço principal válido.",
    );
  }

  if (!input.title.trim()) {
    throw new Error(
      "Informe o título da ordem de serviço.",
    );
  }

  if (!input.scheduledDate) {
    throw new Error(
      "Informe a data agendada.",
    );
  }

  const totalAmount = Number(
    input.totalAmount || 0,
  );

  if (
    !Number.isFinite(totalAmount) ||
    totalAmount <= 0
  ) {
    throw new Error(
      "O valor total deve ser maior que zero.",
    );
  }

  const payload = {
    customerId: input.customerId,

    customerAddressId:
      input.customerAddressId,

    title: input.title.trim(),

    description:
      input.description?.trim() || "",

    scheduledDate:
      toApiDate(input.scheduledDate),

    totalAmount,

    checklistTemplateId: null,

    measurementTemplateId: null,
  };

  const created =
    await mappaFetch<ApiServiceOrder>(
      `/api/companies/${companyId}/service-orders/admin`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  revalidatePath("/workorders");
  revalidatePath("/workorders/new");
  revalidatePath("/workorders/approved");
  revalidatePath("/routes/builder");
  revalidatePath("/routes/dashboard");

  return normalizeWorkOrder(created);
}

export async function priceWorkOrder(
  input: PriceWorkOrderInput,
) {
  const companyId = await getCompanyId();

  if (!input.serviceOrderId) {
    throw new Error(
      "ID da ordem de serviço não informado.",
    );
  }

  if (!input.scheduledDate) {
    throw new Error(
      "Informe a data prevista para o serviço.",
    );
  }

  const totalAmount = Number(input.totalAmount);

  if (
    !Number.isFinite(totalAmount) ||
    totalAmount <= 0
  ) {
    throw new Error(
      "O valor do orçamento deve ser maior que zero.",
    );
  }

  const updated =
    await mappaFetch<ApiServiceOrder>(
      `/api/companies/${companyId}/service-orders/${input.serviceOrderId}/pricing`,
      {
        method: "PATCH",
        body: JSON.stringify({
          scheduledDate: toApiDate(
            input.scheduledDate,
          ),
          totalAmount,
        }),
      },
    );

  revalidatePath("/workorders");
  revalidatePath("/workorders/pricing");
  revalidatePath(
    "/workorders/customer-approval",
  );
  revalidatePath("/workorders/approved");

  return normalizeWorkOrder(updated);
}