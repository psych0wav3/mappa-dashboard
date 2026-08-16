import {
  extractItems,
  getCompanyId,
  mappaFetch,
} from "@/lib/mappa/api";

import type {
  SaveWeeklyRouteTemplateInput,
  WeeklyRouteTemplate,
} from "./weekly-route.types";

export async function fetchWeeklyRouteTemplates(
  params?: {
    employeeUserId?: string;
  },
) {
  const companyId = await getCompanyId();

  const query = new URLSearchParams();

  if (params?.employeeUserId) {
    query.set(
      "employeeUserId",
      params.employeeUserId,
    );
  }

  const queryString = query.toString();

  const data = await mappaFetch<unknown>(
    `/api/companies/${companyId}/weekly-route-templates${
      queryString
        ? `?${queryString}`
        : ""
    }`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return extractItems<WeeklyRouteTemplate>(
    data,
  );
}

export async function saveWeeklyRouteTemplateApi(
  input: SaveWeeklyRouteTemplateInput,
) {
  const companyId = await getCompanyId();

  return mappaFetch<WeeklyRouteTemplate>(
    `/api/companies/${companyId}/weekly-route-templates`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}