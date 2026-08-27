"use server";

import { revalidatePath } from "next/cache";

import {
  getErrorMessage,
  isMappaApiError,
} from "@/lib/mappa/errors";

import {
  listServicePlans,
} from "@/app/(private)/service-plans/actions";

import type {
  RouteWeekday,
} from "./routes.types";

import {
  fetchWeeklyRouteTemplates,
  saveWeeklyRouteTemplateApi,
} from "./weekly-route.api";

import type {
  SaveWeeklyRouteTemplateInput,
  SaveWeeklyRouteTemplateResult,
  WeeklyRoutePlanningService,
  WeeklyRouteTemplate,
} from "./weekly-route.types";

export type {
  SaveWeeklyRouteTemplateInput,
  SaveWeeklyRouteTemplateResult,
  WeeklyRoutePlanningService,
  WeeklyRouteTemplate,
};

const WEEKDAY_BY_NUMBER: Record<
  number,
  RouteWeekday
> = {
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
  7: "SUNDAY",
};

const ALL_ROUTE_WEEKDAYS: RouteWeekday[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

function normalizeWeeklyTemplate(
  template: WeeklyRouteTemplate,
): WeeklyRouteTemplate {
  return {
    id:
      template.id ??
      null,

    employeeUserId:
      template.employeeUserId ||
      "",

    weekday:
      template.weekday,

    updatedAt:
      template.updatedAt ??
      null,

    items: [
      ...(
        template.items ||
        []
      ),
    ]
      .filter(
        (item) =>
          Boolean(
            item.servicePlanId,
          ),
      )
      .map(
        (
          item,
          index,
        ) => ({
          servicePlanId:
            item.servicePlanId,

          executionOrder:
            Number.isFinite(
              item.executionOrder,
            ) &&
            item.executionOrder >
              0
              ? Math.floor(
                  item.executionOrder,
                )
              : index + 1,
        }),
      )
      .sort(
        (
          first,
          second,
        ) =>
          first.executionOrder -
          second.executionOrder,
      ),
  };
}

export async function listWeeklyRoutePlanningServices(): Promise<
  WeeklyRoutePlanningService[]
> {
  const plans =
    await listServicePlans({
      status: "ACTIVE",
    });

  return plans
    .map((plan) => {
      let weekdays: RouteWeekday[] =
        [];

      if (
        plan.recurrence
          .frequencyType ===
        "DAILY"
      ) {
        weekdays = [
          ...ALL_ROUTE_WEEKDAYS,
        ];
      } else if (
        plan.recurrence
          .frequencyType ===
          "WEEKLY" &&
        plan.recurrence
          .intervalValue === 1
      ) {
        weekdays =
          plan.recurrence.daysOfWeek
            .map(
              (day) =>
                WEEKDAY_BY_NUMBER[
                  day
                ],
            )
            .filter(
              (
                day,
              ): day is RouteWeekday =>
                Boolean(day),
            );
      }

      return {
        id:
          plan.id,

        customerName:
          plan.customerName,

        title:
          plan.title,

        preferredEmployeeUserId:
          plan.preferredEmployeeUserId ||
          "",

        weekdays,
      } satisfies WeeklyRoutePlanningService;
    })
    .filter(
      (plan) =>
        plan.weekdays.length >
        0,
    )
    .sort(
      (
        first,
        second,
      ) =>
        first.customerName.localeCompare(
          second.customerName,
          "pt-BR",
        ),
    );
}

export async function listWeeklyRouteTemplates(): Promise<
  WeeklyRouteTemplate[]
> {
  /*
   * Templates são dados importantes
   * para o planejamento.
   *
   * Se a API falhar, não retornamos []
   * fingindo que nenhuma rota foi
   * configurada.
   *
   * O erro sobe para o Error Boundary
   * ou para quem estiver consumindo
   * esta action.
   */
  const templates =
    await fetchWeeklyRouteTemplates();

  return templates
    .map(
      normalizeWeeklyTemplate,
    )
    .filter(
      (template) =>
        Boolean(
          template.employeeUserId,
        ) &&
        ALL_ROUTE_WEEKDAYS.includes(
          template.weekday,
        ),
    );
}

export async function saveWeeklyRouteTemplate(
  input: SaveWeeklyRouteTemplateInput,
): Promise<SaveWeeklyRouteTemplateResult> {
  /*
   * Validações esperadas não precisam
   * virar exceptions.
   */
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
    !ALL_ROUTE_WEEKDAYS.includes(
      input.weekday,
    )
  ) {
    return {
      ok: false,

      error:
        "Selecione um dia da semana válido.",
    };
  }

  const servicePlanIds =
    Array.from(
      new Set(
        input.items
          .map(
            (item) =>
              item.servicePlanId,
          )
          .filter(Boolean),
      ),
    );

  const payload: SaveWeeklyRouteTemplateInput =
    {
      employeeUserId:
        input.employeeUserId,

      weekday:
        input.weekday,

      items:
        servicePlanIds.map(
          (
            servicePlanId,
            index,
          ) => ({
            servicePlanId,

            executionOrder:
              index + 1,
          }),
        ),
    };

  try {
    const template =
      await saveWeeklyRouteTemplateApi(
        payload,
      );

    revalidatePath(
      "/routes/builder",
    );

    revalidatePath(
      "/routes/dashboard",
    );

    return {
      ok: true,

      template:
        normalizeWeeklyTemplate(
          template,
        ),
    };
  } catch (error) {
    /*
     * Erro conhecido da API:
     * retornamos mensagem amigável
     * para o RouteBuilder.
     *
     * Redirect do Next, bug ou qualquer
     * erro inesperado não deve ser
     * mascarado.
     */
    if (
      !isMappaApiError(
        error,
      )
    ) {
      throw error;
    }

    console.error(
      "[saveWeeklyRouteTemplate]",
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
          "Não foi possível salvar a rota padrão.",
        ),
    };
  }
}