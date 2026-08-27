"use server";

import {
  extractItems,
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

import { safeData } from "@/lib/mappa/safe-load";

import {
  addressLabel,
  getMainAddress,
} from "./workorders.helpers";

import type {
  ApiChecklistTemplate,
  ApiCustomer,
  ApiEmployee,
  ApiMeasurementTemplate,
  WorkOrderChecklistTemplateOption,
  WorkOrderCustomerOption,
  WorkOrderMeasurementTemplateOption,
  WorkOrderTechnicianOption,
} from "./workorders.types";

export async function listWorkOrderCustomers(): Promise<
  WorkOrderCustomerOption[]
> {
  const companyId =
    await getCompanyId();

  const data =
    await mappaFetch<unknown>(
      `/api/companies/${companyId}/customers?status=ACTIVE`,
    );

  const summaries =
    extractItems<ApiCustomer>(
      data,
    );

  const customers =
    await Promise.all(
      summaries.map(
        (summary) =>
          safeData({
            resource:
              `detalhes do cliente ${summary.id}`,

            fallback:
              summary,

            loader:
              () =>
                mappaFetch<ApiCustomer>(
                  `/api/companies/${companyId}/customers/${summary.id}`,
                ),
          }),
      ),
    );

  return customers
    .map(
      (customer) => {
        const mainAddress =
          getMainAddress(
            customer,
          );

        const addressId =
          mainAddress?.id ||
          "";

        return {
          id:
            customer.id,

          name:
            customer.name ||
            "Cliente sem nome",

          email:
            customer.email ??
            null,

          phone:
            customer.phone ??
            null,

          document:
            customer.document ??
            null,

          addressId,

          customerAddressId:
            addressId,

          addressLabel:
            addressLabel(
              mainAddress,
            ),

          hasValidAddress:
            Boolean(
              addressId,
            ),
        };
      },
    )
    .sort(
      (
        first,
        second,
      ) =>
        first.name.localeCompare(
          second.name,
          "pt-BR",
        ),
    );
}

export async function listWorkOrderTechnicians(): Promise<
  WorkOrderTechnicianOption[]
> {
  const companyId =
    await getCompanyId();

  const data =
    await mappaFetch<unknown>(
      `/api/companies/${companyId}/employees`,
    );

  return extractItems<ApiEmployee>(
    data,
  )
    .filter(
      (employee) =>
        String(
          employee.status ||
          "",
        ).toUpperCase() !==
        "INACTIVE",
    )
    .map(
      (employee) => ({
        id:
          employee.userId ||
          employee.id,

        name:
          employee.name ||
          employee.email ||
          "Técnico sem nome",

        email:
          employee.email ??
          null,

        phone:
          employee.phone ??
          null,
      }),
    )
    .sort(
      (
        first,
        second,
      ) =>
        first.name.localeCompare(
          second.name,
          "pt-BR",
        ),
    );
}

export async function listWorkOrderChecklistTemplates(): Promise<
  WorkOrderChecklistTemplateOption[]
> {
  const companyId =
    await getCompanyId();

  const data =
    await mappaFetch<unknown>(
      `/api/companies/${companyId}/checklist-templates?activeOnly=true`,
    );

  return extractItems<ApiChecklistTemplate>(
    data,
  )
    .map(
      (template) => ({
        id:
          template.id,

        name:
          template.name ||
          "Checklist sem nome",

        description:
          template.description ??
          null,

        isActive:
          template.isActive !==
          false,

        itemsCount:
          Array.isArray(
            template.items,
          )
            ? template.items.length
            : 0,
      }),
    )
    .filter(
      (template) =>
        template.isActive,
    )
    .sort(
      (
        first,
        second,
      ) =>
        first.name.localeCompare(
          second.name,
          "pt-BR",
        ),
    );
}

export async function listWorkOrderMeasurementTemplates(): Promise<
  WorkOrderMeasurementTemplateOption[]
> {
  const companyId =
    await getCompanyId();

  const data =
    await mappaFetch<unknown>(
      `/api/companies/${companyId}/measurement-templates?activeOnly=true`,
    );

  return extractItems<ApiMeasurementTemplate>(
    data,
  )
    .map(
      (template) => ({
        id:
          template.id,

        name:
          template.name ||
          "Template sem nome",

        description:
          template.description ??
          null,

        isActive:
          template.isActive !==
          false,

        fieldsCount:
          Array.isArray(
            template.fields,
          )
            ? template.fields.length
            : 0,
      }),
    )
    .filter(
      (template) =>
        template.isActive,
    )
    .sort(
      (
        first,
        second,
      ) =>
        first.name.localeCompare(
          second.name,
          "pt-BR",
        ),
    );
}
