"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, CalendarDays, CheckCircle2, GripVertical, Plus, Route, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { RouteTechnicianOption, RouteWeekday } from "@/app/(private)/routes/routes.types";
import { saveWeeklyRouteTemplate } from "@/app/(private)/routes/weekly-route.actions";
import type { WeeklyRoutePlanningService, WeeklyRouteTemplate } from "@/app/(private)/routes/weekly-route.types";

import RoutePlanningDayStrip, { type PlanningDayMeta } from "@/components/routes/RoutePlanningDayStrip";
import RouteTechnicianSelector from "@/components/routes/RouteTechnicianSelector";
import { ROUTE_WEEKDAYS } from "@/components/routes/routeWeek.utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RouteBuilderProps = {
  technicians: RouteTechnicianOption[];
  services: WeeklyRoutePlanningService[];
  initialTemplates: WeeklyRouteTemplate[];
};

type DraftMap = Record<string, string[]>;

function templateKey(employeeUserId: string, weekday: RouteWeekday) {
  return `${employeeUserId}:${weekday}`;
}

function weekdayLabel(weekday: RouteWeekday) {
  return ROUTE_WEEKDAYS.find((day) => day.value === weekday)?.label || "Dia";
}

function normalizeText(value?: string | null) {
  return String(value || "").trim().toLocaleLowerCase("pt-BR");
}

function getTemplateIds(template?: WeeklyRouteTemplate | null) {
  if (!template) {
    return [];
  }

  return [...template.items]
    .sort((first, second) => first.executionOrder - second.executionOrder)
    .map((item) => item.servicePlanId);
}

function RoutePlanStopCard({
  service,
  position,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  service: WeeklyRoutePlanningService;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <GripVertical className="h-5 w-5 text-slate-300" />

          <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-600 text-sm font-bold text-white">
            {position}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-slate-900">
            {service.customerName}
          </h3>

          <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
            {service.title}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Atendimento recorrente
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="outline" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={onMoveUp} disabled={isFirst} title="Mover para cima">
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>

          <Button type="button" variant="outline" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={onMoveDown} disabled={isLast} title="Mover para baixo">
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>

          <Button type="button" variant="outline" size="sm" className="h-8 w-8 rounded-lg border-red-200 p-0 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onRemove} title="Remover da rota">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function AvailableServiceCard({
  service,
  preferredTechnicianName,
  onAdd,
}: {
  service: WeeklyRoutePlanningService;
  preferredTechnicianName?: string;
  onAdd: () => void;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-slate-900">
            {service.customerName}
          </h3>

          <p className="mt-0.5 text-xs font-medium text-slate-600">
            {service.title}
          </p>

          {preferredTechnicianName ? (
            <p className="mt-2 text-[11px] text-slate-400">
              Técnico preferencial: {preferredTechnicianName}
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-slate-400">
              Sem técnico preferencial
            </p>
          )}
        </div>

        <Button type="button" className="btn-brand h-9 shrink-0 rounded-xl px-3 text-xs text-white" onClick={onAdd}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Adicionar
        </Button>
      </div>
    </article>
  );
}

export default function RouteBuilder({ technicians, services, initialTemplates }: RouteBuilderProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const [technicianId, setTechnicianId] = React.useState(technicians[0]?.id || "");
  const [selectedWeekday, setSelectedWeekday] = React.useState<RouteWeekday>("MONDAY");
  const [templates, setTemplates] = React.useState<WeeklyRouteTemplate[]>(initialTemplates);
  const [drafts, setDrafts] = React.useState<DraftMap>({});
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!technicianId && technicians[0]?.id) {
      setTechnicianId(technicians[0].id);
    }
  }, [technicianId, technicians]);

  const selectedTechnician = React.useMemo(() => {
    return technicians.find((technician) => technician.id === technicianId) || null;
  }, [technicianId, technicians]);

  const techniciansById = React.useMemo(() => {
    return new Map(technicians.map((technician) => [technician.id, technician]));
  }, [technicians]);

  const servicesById = React.useMemo(() => {
    return new Map(services.map((service) => [service.id, service]));
  }, [services]);

  const currentDraftKey = templateKey(technicianId, selectedWeekday);

  const currentTemplate = React.useMemo(() => {
    return templates.find((template) => template.employeeUserId === technicianId && template.weekday === selectedWeekday) || null;
  }, [selectedWeekday, technicianId, templates]);

  const selectedIds = React.useMemo(() => {
    if (Object.prototype.hasOwnProperty.call(drafts, currentDraftKey)) {
      return drafts[currentDraftKey];
    }

    return getTemplateIds(currentTemplate);
  }, [currentDraftKey, currentTemplate, drafts]);

  const orderedServices = React.useMemo(() => {
    return selectedIds
      .map((id) => servicesById.get(id))
      .filter((service): service is WeeklyRoutePlanningService => Boolean(service));
  }, [selectedIds, servicesById]);

  const eligibleServices = React.useMemo(() => {
    return services.filter((service) => service.weekdays.includes(selectedWeekday));
  }, [selectedWeekday, services]);

  const assignedToOtherTechnicians = React.useMemo(() => {
    const assigned = new Set<string>();

    for (const technician of technicians) {
      if (technician.id === technicianId) {
        continue;
      }

      const key = templateKey(technician.id, selectedWeekday);

      if (Object.prototype.hasOwnProperty.call(drafts, key)) {
        for (const servicePlanId of drafts[key]) {
          assigned.add(servicePlanId);
        }

        continue;
      }

      const template = templates.find((item) => item.employeeUserId === technician.id && item.weekday === selectedWeekday);

      for (const servicePlanId of getTemplateIds(template)) {
        assigned.add(servicePlanId);
      }
    }

    return assigned;
  }, [drafts, selectedWeekday, technicianId, technicians, templates]);

  const availableServices = React.useMemo(() => {
    const term = normalizeText(search);

    return eligibleServices
      .filter((service) => !selectedIds.includes(service.id))
      .filter((service) => !assignedToOtherTechnicians.has(service.id))
      .filter((service) => {
        if (!term) {
          return true;
        }

        return normalizeText(`${service.customerName} ${service.title}`).includes(term);
      })
      .sort((first, second) => first.customerName.localeCompare(second.customerName, "pt-BR"));
  }, [assignedToOtherTechnicians, eligibleServices, search, selectedIds]);

  const technicianSummaries = React.useMemo(() => {
    return Object.fromEntries(
      technicians.map((technician) => {
        let weeklyStops = 0;
        let daysWithRoute = 0;

        for (const day of ROUTE_WEEKDAYS) {
          const key = templateKey(technician.id, day.value);

          let ids: string[];

          if (Object.prototype.hasOwnProperty.call(drafts, key)) {
            ids = drafts[key];
          } else {
            const template = templates.find((item) => item.employeeUserId === technician.id && item.weekday === day.value);
            ids = getTemplateIds(template);
          }

          if (ids.length > 0) {
            daysWithRoute += 1;
            weeklyStops += ids.length;
          }
        }

        return [
          technician.id,
          {
            primary: `${weeklyStops} ${weeklyStops === 1 ? "atendimento" : "atendimentos"} na semana`,
            secondary: `${daysWithRoute} ${daysWithRoute === 1 ? "dia com rota" : "dias com rota"}`,
            status: daysWithRoute > 0 ? `${daysWithRoute} ${daysWithRoute === 1 ? "dia planejado" : "dias planejados"}` : "Sem rotas planejadas",
          },
        ];
      }),
    );
  }, [drafts, technicians, templates]);

  const dayMeta = React.useMemo(() => {
    return Object.fromEntries(
      ROUTE_WEEKDAYS.map((day) => {
        const key = templateKey(technicianId, day.value);

        let ids: string[];

        if (Object.prototype.hasOwnProperty.call(drafts, key)) {
          ids = drafts[key];
        } else {
          const template = templates.find((item) => item.employeeUserId === technicianId && item.weekday === day.value);
          ids = getTemplateIds(template);
        }

        const savedTemplate = templates.find((item) => item.employeeUserId === technicianId && item.weekday === day.value);

        return [
          day.value,
          {
            count: ids.length,
            saved: Boolean(savedTemplate?.items.length),
          } satisfies PlanningDayMeta,
        ];
      }),
    ) as Record<RouteWeekday, PlanningDayMeta>;
  }, [drafts, technicianId, templates]);

  function replaceDraft(next: string[]) {
    setDrafts((current) => ({
      ...current,
      [currentDraftKey]: next,
    }));
  }

  function addService(servicePlanId: string) {
    if (selectedIds.includes(servicePlanId)) {
      return;
    }

    replaceDraft([...selectedIds, servicePlanId]);
  }

  function removeService(servicePlanId: string) {
    replaceDraft(selectedIds.filter((id) => id !== servicePlanId));
  }

  function moveService(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= selectedIds.length) {
      return;
    }

    const next = [...selectedIds];

    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

    replaceDraft(next);
  }

  function selectTechnician(id: string) {
    setTechnicianId(id);
    setSelectedWeekday("MONDAY");
    setSearch("");
  }

  function selectWeekday(weekday: RouteWeekday) {
    setSelectedWeekday(weekday);
    setSearch("");
  }

  function savePlanning() {
    if (!selectedTechnician) {
      toast.error("Selecione um técnico.");
      return;
    }

    if (!orderedServices.length && !currentTemplate?.items.length) {
      toast.error("Adicione ao menos um atendimento à rota.");
      return;
    }

    startTransition(async () => {
      const result = await saveWeeklyRouteTemplate({
        employeeUserId: selectedTechnician.id,
        weekday: selectedWeekday,
        items: orderedServices.map((service, index) => ({
          servicePlanId: service.id,
          executionOrder: index + 1,
        })),
      });

      if (!result.ok || !result.template) {
        toast.error(result.error || "Não foi possível salvar a rota padrão.");
        return;
      }

      const savedTemplate = result.template;

      setTemplates((current) => {
        const withoutCurrent = current.filter((template) => !(template.employeeUserId === savedTemplate.employeeUserId && template.weekday === savedTemplate.weekday));

        return [...withoutCurrent, savedTemplate];
      });

      setDrafts((current) => {
        const next = { ...current };
        delete next[currentDraftKey];
        return next;
      });

      toast.success(`Rota de ${weekdayLabel(selectedWeekday).toLowerCase()} salva para ${selectedTechnician.name}.`);

      router.refresh();
    });
  }

  const hasSavedRoute = Boolean(currentTemplate?.items.length);
  const hasDraft = Object.prototype.hasOwnProperty.call(drafts, currentDraftKey);

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <Route className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Planejamento de rotas
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Monte a rota padrão de cada técnico para cada dia da semana.
              </p>
            </div>
          </div>

          <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.push("/routes/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Controle das rotas
          </Button>
        </div>
      </section>

      <RouteTechnicianSelector technicians={technicians} technicianId={technicianId} summaries={technicianSummaries} onSelectTechnician={selectTechnician} />

      {selectedTechnician ? (
        <RoutePlanningDayStrip selectedWeekday={selectedWeekday} dayMeta={dayMeta} onSelectWeekday={selectWeekday} />
      ) : null}

      {selectedTechnician ? (
        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-sky-600" />

                  <h2 className="text-base font-bold text-slate-900">
                    Rota de {weekdayLabel(selectedWeekday).toLowerCase()} — {selectedTechnician.name}
                  </h2>

                  {hasSavedRoute && !hasDraft ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                      Rota salva
                    </span>
                  ) : null}

                  {hasDraft ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                      Alterações não salvas
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Esta sequência será repetida todas as {weekdayLabel(selectedWeekday).toLowerCase()}s.
                </p>
              </div>

              <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-700">
                <strong>{orderedServices.length}</strong>{" "}
                {orderedServices.length === 1 ? "atendimento" : "atendimentos"}
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {orderedServices.map((service, index) => (
                <RoutePlanStopCard
                  key={service.id}
                  service={service}
                  position={index + 1}
                  isFirst={index === 0}
                  isLast={index === orderedServices.length - 1}
                  onMoveUp={() => moveService(index, -1)}
                  onMoveDown={() => moveService(index, 1)}
                  onRemove={() => removeService(service.id)}
                />
              ))}

              {orderedServices.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                  <Route className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Esta rota ainda está vazia
                  </p>

                  <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
                    Adicione os atendimentos disponíveis no painel ao lado para montar a rota de {weekdayLabel(selectedWeekday).toLowerCase()}.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                <span>
                  Depois de salva, esta será a rota padrão de todas as {weekdayLabel(selectedWeekday).toLowerCase()}s de {selectedTechnician.name}.
                </span>
              </div>

              <Button
                type="button"
                className="btn-brand shrink-0 rounded-xl px-6 text-white"
                onClick={savePlanning}
                disabled={pending || (!orderedServices.length && !currentTemplate?.items.length)}
              >
                <Save className="mr-2 h-4 w-4" />

                {pending ? "Salvando..." : hasSavedRoute ? "Salvar alterações" : "Salvar rota padrão"}
              </Button>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Atendimentos disponíveis
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Atendimentos recorrentes previstos para {weekdayLabel(selectedWeekday).toLowerCase()} e ainda não incluídos em outra rota.
              </p>
            </div>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} placeholder="Buscar cliente ou serviço..." className="h-10 rounded-xl pl-9" />
            </div>

            <div className="mt-4 max-h-[560px] space-y-2.5 overflow-y-auto pr-1">
              {availableServices.map((service) => {
                const preferredTechnician = service.preferredEmployeeUserId ? techniciansById.get(service.preferredEmployeeUserId) : null;

                return (
                  <AvailableServiceCard
                    key={service.id}
                    service={service}
                    preferredTechnicianName={preferredTechnician?.name}
                    onAdd={() => addService(service.id)}
                  />
                );
              })}

              {availableServices.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-9 text-center">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" />

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Nenhum atendimento disponível
                  </p>

                  <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">
                    Todos os atendimentos previstos para este dia já estão em uma rota ou não existem rotinas configuradas para este dia.
                  </p>
                </div>
              ) : null}
            </div>
          </aside>
        </section>
      ) : null}
    </div>
  );
}