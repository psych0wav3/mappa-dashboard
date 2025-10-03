// src/components/visits/VisitPlanForm.tsx
"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createVisitPlan, updateVisitPlan } from "@/app/visits/actions";
import { useTransition } from "react";
import { toast } from "sonner";

/** Schema alinhado com useForm<Values> (sem coerce) */
const schema = z.object({
  technicianId: z.string().min(1, "Selecione o técnico"),
  clientId: z.string().min(1, "Selecione o cliente"),
  weekdays: z.array(z.number()).min(1, "Escolha ao menos um dia"),
  windowStart: z.number().min(6).max(18),
  windowEnd: z.number().min(7).max(19),
  notes: z.string().optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

const WEEKDAYS = [
  { v: 1, label: "Seg" },
  { v: 2, label: "Ter" },
  { v: 3, label: "Qua" },
  { v: 4, label: "Qui" },
  { v: 5, label: "Sex" },
  { v: 6, label: "Sáb" },
];

const HOURS = Array.from({ length: 13 }, (_, i) => 6 + i); // 6..18

export default function VisitPlanForm({
  trigger = "Nova visita",
  id,
  defaultValues,
  technicians,
  clients,
}: {
  id?: string;
  defaultValues?: Partial<Values>;
  trigger?: React.ReactNode;
  technicians: { id: string; firstName: string; lastName: string }[];
  clients: {
    id: string;
    firstName: string;
    lastName: string;
    street?: string | null;
    number?: string | null;
  }[];
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();

  /** ✅ Tipamos explicitamente o resolver para o RHF do seu projeto */
  const resolver = zodResolver(schema) as unknown as Resolver<Values, any>;

  const form = useForm<Values>({
    resolver,
    defaultValues: {
      technicianId: defaultValues?.technicianId ?? "",
      clientId: defaultValues?.clientId ?? "",
      weekdays: defaultValues?.weekdays ?? [],
      windowStart: defaultValues?.windowStart ?? 9,
      windowEnd: defaultValues?.windowEnd ?? 11,
      notes: defaultValues?.notes ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // ===== Autocomplete =====
  const [techQuery, setTechQuery] = React.useState("");
  const [techOpen, setTechOpen] = React.useState(false);
  const [cliQuery, setCliQuery] = React.useState("");
  const [cliOpen, setCliOpen] = React.useState(false);

  const selectedTech = technicians.find((t) => t.id === form.watch("technicianId"));
  const selectedTechName = selectedTech ? `${selectedTech.firstName} ${selectedTech.lastName}` : "";

  const selectedClient = clients.find((c) => c.id === form.watch("clientId"));
  const selectedClientName = selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : "";

  const techOpts = technicians.filter((t) =>
    `${t.firstName} ${t.lastName}`.toLowerCase().includes(techQuery.toLowerCase())
  );
  const cliOpts = clients.filter((c) =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(cliQuery.toLowerCase())
  );

  const delayedClose = (fn: () => void) => () => setTimeout(fn, 120);

  const onSubmit = (values: Values) => {
    if (values.windowStart >= values.windowEnd) {
      form.setError("windowEnd", {
        type: "validate",
        message: "Fim deve ser maior que início",
      });
      return;
    }

    startTransition(async () => {
      try {
        if (id) {
          await updateVisitPlan(id, values);
          toast.success("Visita atualizada");
        } else {
          await createVisitPlan(values);
          toast.success("Visita criada");
        }
        setOpen(false);
      } catch (e: any) {
        toast.error(e?.message || "Erro ao salvar visita");
      }
    });
  };

  const toggleDay = (d: number) => {
    const cur = form.getValues("weekdays") ?? [];
    if (cur.includes(d)) form.setValue("weekdays", cur.filter((x) => x !== d));
    else form.setValue("weekdays", [...cur, d]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {typeof trigger === "string" ? (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">{trigger}</Button>
        ) : (
          (trigger as React.ReactElement)
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{id ? "Editar visita" : "Nova visita"}</DialogTitle>
        </DialogHeader>

        <Form {...(form as any)}>
          <form className="space-y-4" onSubmit={(form.handleSubmit as any)(onSubmit as any)}>
            {/* Técnico */}
            <FormField
              name="technicianId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Técnico</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Digite o nome do técnico"
                        value={techOpen ? techQuery : (selectedTechName ?? "")}
                        onChange={(e) => {
                          setTechQuery(e.target.value);
                          setTechOpen(true);
                        }}
                        onFocus={() => {
                          setTechQuery("");
                          setTechOpen(true);
                        }}
                        onBlur={delayedClose(() => setTechOpen(false))}
                      />
                      {techOpen && techQuery && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow max-h-64 overflow-auto">
                          {techOpts.slice(0, 8).map((t) => (
                            <button
                              type="button"
                              key={t.id}
                              className="w-full text-left px-3 py-2 hover:bg-neutral-50"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                field.onChange(t.id);
                                setTechQuery("");
                                setTechOpen(false);
                              }}
                            >
                              {t.firstName} {t.lastName}
                            </button>
                          ))}
                          {techOpts.length === 0 && (
                            <div className="px-3 py-2 text-sm text-neutral-500">
                              Sem resultados
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cliente */}
            <FormField
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Digite o nome do cliente"
                        value={cliOpen ? cliQuery : (selectedClientName ?? "")}
                        onChange={(e) => {
                          setCliQuery(e.target.value);
                          setCliOpen(true);
                        }}
                        onFocus={() => {
                          setCliQuery("");
                          setCliOpen(true);
                        }}
                        onBlur={delayedClose(() => setCliOpen(false))}
                      />
                      {cliOpen && cliQuery && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow max-h-64 overflow-auto">
                          {cliOpts.slice(0, 8).map((c) => (
                            <button
                              type="button"
                              key={c.id}
                              className="w-full text-left px-3 py-2 hover:bg-neutral-50"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                field.onChange(c.id);
                                setCliQuery("");
                                setCliOpen(false);
                              }}
                            >
                              {c.firstName} {c.lastName}
                            </button>
                          ))}
                          {cliOpts.length === 0 && (
                            <div className="px-3 py-2 text-sm text-neutral-500">
                              Sem resultados
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dias da semana */}
            <FormField
              name="weekdays"
              render={() => (
                <FormItem>
                  <FormLabel>Dias de visita</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((d) => {
                      const active = form.watch("weekdays")?.includes(d.v);
                      return (
                        <button
                          key={d.v}
                          type="button"
                          className={`h-9 px-3 rounded-md border text-sm ${
                            active
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-neutral-300 hover:bg-neutral-50"
                          }`}
                          onClick={() => toggleDay(d.v)}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Janela de horário */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="windowStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início</FormLabel>
                    <FormControl>
                      <select
                        className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>
                            {h}:00
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="windowEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fim</FormLabel>
                    <FormControl>
                      <select
                        className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>
                            {h}:00
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notas */}
            <FormField
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informações úteis</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { form.reset(); setOpen(false); }}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {id ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
