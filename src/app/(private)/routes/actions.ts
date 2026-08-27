"use server";

import { revalidatePath } from "next/cache";

import {
  getErrorMessage,
  isMappaApiError,
} from "@/lib/mappa/errors";

import { safeData } from "@/lib/mappa/safe-load";

import {
  addServiceOrdersToRoute,
  createRoute,
  fetchRouteDetails,
  fetchRouteEmployees,
  fetchRoutes,
  fetchWaitingExecutionServiceOrders,
  updateRouteEmployee,
} from "./routes.api";

import {
  normalizeStatus,
  splitName,
} from "./routes.parsers";

import {
  employeeDisplayName,
  mergeRouteDashboardItems,
  normalizeRouteDetails,
  normalizeWorkOrderForRoute,
} from "./routes.mapper";

import type {
  ApiRouteDetailsResponse,
  AvailableRouteWorkOrder,
  CreateRoutePlannerInput,
  CreateRoutePlannerResult,
  RouteDashboardItem,
  RouteTechnicianOption,
} from "./routes.types";

export type {
  ApiRouteDetailsResponse,
  AvailableRouteWorkOrder,
  CreateRoutePlannerInput,
  CreateRoutePlannerResult,
  RouteDashboardItem,
  RouteTechnicianOption,
};

export async function listRouteTechnicians(): Promise<
  RouteTechnicianOption[]
> {
  const employees =
    await fetchRouteEmployees();

  return employees
    .filter(
      (employee) =>
        String(
          employee.status || "",
        ).toUpperCase() !==
        "INACTIVE",
    )
    .map((employee) => ({
      id:
        employee.userId ||
        employee.id,

      name:
        employeeDisplayName(
          employee,
        ),
    }))
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

export async function listTechniciansLite() {
  const technicians =
    await listRouteTechnicians();

  return technicians.map(
    (technician) => {
      const {
        firstName,
        lastName,
      } = splitName(
        technician.name,
      );

      return {
        id:
          technician.id,

        firstName,

        lastName,
      };
    },
  );
}

export async function listApprovedServiceOrdersForRoute(): Promise<
  AvailableRouteWorkOrder[]
> {
  const orders =
    await fetchWaitingExecutionServiceOrders();

  return orders
    .filter(
      (order) =>
        normalizeStatus(
          order.status,
        ) ===
        "waitingexecution",
    )
    .map(
      normalizeWorkOrderForRoute,
    )
    .sort(
      (
        first,
        second,
      ) => {
        const dateCompare =
          String(
            first.scheduledDate ||
              "",
          ).localeCompare(
            String(
              second.scheduledDate ||
                "",
            ),
          );

        if (
          dateCompare !== 0
        ) {
          return dateCompare;
        }

        return first.customerName.localeCompare(
          second.customerName,
          "pt-BR",
        );
      },
    );
}

function normalizeOrigin(
  value?: string | null,
) {
  return String(
    value || "",
  )
    .replace(
      /[_\s-]/g,
      "",
    )
    .toLowerCase();
}

export async function listOneTimeServiceOrdersForRoute(): Promise<
  AvailableRouteWorkOrder[]
> {
  const orders =
    await listApprovedServiceOrdersForRoute();

  return orders.filter(
    (order) => {
      const origin =
        normalizeOrigin(
          order.origin,
        );

      return (
        origin ===
          "adminonetime" ||
        origin ===
          "employeeadditional" ||
        origin ===
          "employeerequest"
      );
    },
  );
}

function validateRouteInput(
  input: CreateRoutePlannerInput,
) {
  const title =
    input.title.trim();

  if (!title) {
    throw new Error(
      "Informe o nome da rota.",
    );
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      input.routeDate,
    )
  ) {
    throw new Error(
      "Informe uma data válida para a rota.",
    );
  }

  if (
    !input.employeeUserId
  ) {
    throw new Error(
      "Selecione o técnico responsável.",
    );
  }

  const serviceOrderIds =
    Array.from(
      new Set(
        input.serviceOrderIds.filter(
          Boolean,
        ),
      ),
    );

  if (
    !serviceOrderIds.length
  ) {
    throw new Error(
      "Adicione ao menos uma OS à rota.",
    );
  }

  return {
    title,

    routeDate:
      input.routeDate,

    employeeUserId:
      input.employeeUserId,

    serviceOrderIds,
  };
}

export async function createRouteFromPlanner(
  input: CreateRoutePlannerInput,
): Promise<CreateRoutePlannerResult> {
  let validated: ReturnType<
    typeof validateRouteInput
  >;

  /*
   * Validação é um erro esperado
   * do formulário.
   */
  try {
    validated =
      validateRouteInput(
        input,
      );
  } catch (error) {
    return {
      ok: false,

      error:
        getErrorMessage(
          error,
          "Não foi possível validar os dados da rota.",
        ),
    };
  }

  try {
    const existingRoutes =
      await fetchRoutes({
        routeDate:
          validated.routeDate,

        employeeUserId:
          validated.employeeUserId,
      });

    let route: ApiRouteDetailsResponse;

    if (
      existingRoutes.length >
      0
    ) {
      const routeDetails =
        await Promise.all(
          existingRoutes.map(
            (item) =>
              fetchRouteDetails(
                item.id,
              ),
          ),
        );

      const primaryRoute = [
        ...routeDetails,
      ].sort(
        (
          first,
          second,
        ) =>
          (second
            .serviceOrders
            ?.length || 0) -
          (first
            .serviceOrders
            ?.length || 0),
      )[0];

      const existingServiceOrderIds =
        new Set(
          routeDetails
            .flatMap(
              (item) =>
                (
                  item.serviceOrders ||
                  []
                ).map(
                  (order) =>
                    order.serviceOrderId ||
                    order.id ||
                    "",
                ),
            )
            .filter(
              Boolean,
            ),
        );

      const serviceOrderIdsToAdd =
        validated.serviceOrderIds.filter(
          (
            serviceOrderId,
          ) =>
            !existingServiceOrderIds.has(
              serviceOrderId,
            ),
        );

      if (
        serviceOrderIdsToAdd.length ===
        0
      ) {
        route =
          primaryRoute;
      } else {
        const nextExecutionOrder =
          Math.max(
            0,

            ...(
              primaryRoute.serviceOrders ||
              []
            ).map(
              (order) =>
                Number(
                  order.executionOrder ||
                    0,
                ),
            ),
          ) + 1;

        route =
          await addServiceOrdersToRoute(
            {
              routeId:
                primaryRoute.id,

              serviceOrders:
                serviceOrderIdsToAdd.map(
                  (
                    serviceOrderId,
                    index,
                  ) => ({
                    serviceOrderId,

                    executionOrder:
                      nextExecutionOrder +
                      index,
                  }),
                ),
            },
          );
      }
    } else {
      const created =
        await createRoute({
          title:
            validated.title,

          routeDate:
            validated.routeDate,

          employeeUserId:
            validated.employeeUserId,
        });

      route =
        await addServiceOrdersToRoute(
          {
            routeId:
              created.id,

            serviceOrders:
              validated.serviceOrderIds.map(
                (
                  serviceOrderId,
                  index,
                ) => ({
                  serviceOrderId,

                  executionOrder:
                    index + 1,
                }),
              ),
          },
        );
    }

    revalidatePath(
      "/routes/builder",
    );

    revalidatePath(
      "/routes/dashboard",
    );

    revalidatePath(
      "/workorders",
    );

    return {
      ok: true,
      route,
    };
  } catch (error) {
    /*
     * Só erros conhecidos da API
     * viram resultado amigável.
     *
     * Redirect do Next e bugs
     * inesperados continuam subindo.
     */
    if (
      !isMappaApiError(
        error,
      )
    ) {
      throw error;
    }

    console.error(
      "[createRouteFromPlanner]",
      {
        code:
          error.code,

        status:
          error.status,

        retryable:
          error.retryable,

        message:
          error.message,
      },
    );

    return {
      ok: false,

      error:
        getErrorMessage(
          error,
          "Não foi possível criar a rota.",
        ),
    };
  }
}

function routeTitle(
  routeDate: string,
  employeeName: string,
) {
  const weekday =
    new Date(
      `${routeDate}T12:00:00`,
    ).toLocaleDateString(
      "pt-BR",
      {
        weekday:
          "long",
      },
    );

  const formattedWeekday =
    `${weekday
      .charAt(0)
      .toUpperCase()}${weekday.slice(
      1,
    )}`;

  return `Rota de ${formattedWeekday} — ${employeeName}`;
}

export async function addOneTimeServiceOrderToDailyRoute(
  input: {
    serviceOrderId: string;
    routeDate: string;
    employeeUserId: string;
    employeeName: string;
  },
): Promise<{
  ok: boolean;
  route?: RouteDashboardItem;
  error?: string;
}> {
  /*
   * Validações esperadas ficam fora
   * do try da API.
   */
  if (
    !input.serviceOrderId
  ) {
    return {
      ok: false,
      error:
        "OS não informada.",
    };
  }

  if (
    !input.employeeUserId
  ) {
    return {
      ok: false,

      error:
        "Selecione o técnico responsável.",
    };
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      input.routeDate,
    )
  ) {
    return {
      ok: false,

      error:
        "Data da rota inválida.",
    };
  }

  try {
    const routes =
      await fetchRoutes({
        routeDate:
          input.routeDate,

        employeeUserId:
          input.employeeUserId,
      });

    let routeDetails: ApiRouteDetailsResponse;

    if (
      routes.length > 0
    ) {
      const currentRoutes =
        await Promise.all(
          routes.map(
            (route) =>
              fetchRouteDetails(
                route.id,
              ),
          ),
        );

      const existingRoute =
        currentRoutes.find(
          (route) =>
            (
              route.serviceOrders ||
              []
            ).some(
              (order) =>
                (order.serviceOrderId ||
                  order.id) ===
                input.serviceOrderId,
            ),
        );

      if (existingRoute) {
        routeDetails =
          existingRoute;
      } else {
        const currentRoute =
          [
            ...currentRoutes,
          ].sort(
            (
              first,
              second,
            ) =>
              (second
                .serviceOrders
                ?.length ||
                0) -
              (first
                .serviceOrders
                ?.length ||
                0),
          )[0];

        const nextExecutionOrder =
          Math.max(
            0,

            ...(
              currentRoute.serviceOrders ||
              []
            ).map(
              (order) =>
                Number(
                  order.executionOrder ||
                    0,
                ),
            ),
          ) + 1;

        routeDetails =
          await addServiceOrdersToRoute(
            {
              routeId:
                currentRoute.id,

              serviceOrders: [
                {
                  serviceOrderId:
                    input.serviceOrderId,

                  executionOrder:
                    nextExecutionOrder,
                },
              ],
            },
          );
      }
    } else {
      const createdRoute =
        await createRoute({
          title:
            routeTitle(
              input.routeDate,
              input.employeeName,
            ),

          routeDate:
            input.routeDate,

          employeeUserId:
            input.employeeUserId,
        });

      routeDetails =
        await addServiceOrdersToRoute(
          {
            routeId:
              createdRoute.id,

            serviceOrders: [
              {
                serviceOrderId:
                  input.serviceOrderId,

                executionOrder:
                  1,
              },
            ],
          },
        );
    }

    revalidatePath(
      "/routes/dashboard",
    );

    revalidatePath(
      "/workorders",
    );

    return {
      ok: true,

      route:
        normalizeRouteDetails(
          routeDetails,
        ),
    };
  } catch (error) {
    if (
      !isMappaApiError(
        error,
      )
    ) {
      throw error;
    }

    console.error(
      "[addOneTimeServiceOrderToDailyRoute]",
      {
        code:
          error.code,

        status:
          error.status,

        retryable:
          error.retryable,

        message:
          error.message,
      },
    );

    return {
      ok: false,

      error:
        getErrorMessage(
          error,
          "Não foi possível adicionar a OS à rota.",
        ),
    };
  }
}

export async function changeRouteEmployee(
  params: {
    routeId: string;
    employeeUserId: string;
  },
) {
  if (!params.routeId) {
    throw new Error(
      "ID da rota não informado.",
    );
  }

  if (
    !params.employeeUserId
  ) {
    throw new Error(
      "Selecione o técnico responsável.",
    );
  }

  const updated =
    await updateRouteEmployee(
      params,
    );

  revalidatePath(
    "/routes/dashboard",
  );

  return updated;
}

export async function listRoutesForDashboard(
  params?: {
    routeDate?: string;
    status?: string;
    employeeUserId?: string;
  },
): Promise<
  RouteDashboardItem[]
> {
  /*
   * Rotas são o dado principal
   * desta tela.
   *
   * Se esta chamada falhar,
   * NÃO retornamos [].
   *
   * O erro sobe para:
   * src/app/(private)/error.tsx
   */
  const routes =
    await fetchRoutes(
      params,
    );

  /*
   * Já uma falha recuperável no
   * detalhe de apenas uma rota
   * não precisa derrubar todas.
   */
  const detailed =
    await Promise.all(
      routes.map(
        (route) =>
          safeData({
            resource:
              `detalhes da rota ${route.id}`,

            fallback: {
              id:
                route.id,

              title:
                route.title,

              routeDate:
                route.routeDate,

              employeeUserId:
                route.employeeUserId,

              employeeName:
                route.employeeName,

              status:
                route.status,

              serviceOrders:
                [],

              createdAt:
                route.createdAt,
            } satisfies ApiRouteDetailsResponse,

            loader:
              () =>
                fetchRouteDetails(
                  route.id,
                ),
          }),
      ),
    );

  return mergeRouteDashboardItems(
    detailed.map(
      normalizeRouteDetails,
    ),
  ).sort(
    (
      first,
      second,
    ) => {
      const dateCompare =
        String(
          second.routeDate ||
            "",
        ).localeCompare(
          String(
            first.routeDate ||
              "",
          ),
        );

      if (
        dateCompare !== 0
      ) {
        return dateCompare;
      }

      return first.employeeName.localeCompare(
        second.employeeName,
        "pt-BR",
      );
    },
  );
}