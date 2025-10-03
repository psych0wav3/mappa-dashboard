// app/api/mobile/v1/schedule/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromAuth, getTechnicianIdForUser } from "@/lib/auth";
import crypto from "crypto";

function fullClientName(c: { firstName: string; lastName: string; email: string }) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return name || c.email || "Cliente";
}

function fullClientAddress(c: {
  street: string | null; number: string | null; district: string | null;
  city: string | null; uf: string | null; cep: string | null;
}) {
  const cityUf = c.city && c.uf ? `${c.city} - ${c.uf}` : c.city || c.uf || null;
  const parts = [c.street, c.number, c.district, cityUf, c.cep].filter(Boolean);
  return parts.join(", ");
}

function jsWeekday(d: Date) { return d.getUTCDay(); } // 0..6 (0=Dom)
function arrayHasWeekday(arr: number[] | null | undefined, jsDay0to6: number) {
  if (!arr || arr.length === 0) return false;
  const dom0 = jsDay0to6;                          // 0..6 (0=Dom)
  const seg1a7 = jsDay0to6 === 0 ? 7 : jsDay0to6;  // 1..7 (Dom=7)
  const seg1a6 = jsDay0to6 === 0 ? 0 : jsDay0to6;  // 1..6 (Dom fora)
  return arr.includes(dom0) || arr.includes(seg1a7) || (seg1a6 !== 0 && arr.includes(seg1a6));
}

/** Gera ETag estável a partir de um string */
function etagOf(s: string) {
  return `"W/${crypto.createHash("sha1").update(s).digest("hex")}"`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const dateISO = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const emailOverride = url.searchParams.get("email"); // útil p/ testes
    const date = new Date(`${dateISO}T00:00:00.000Z`);

    const user = await getUserFromAuth(req);
    const technicianId = await getTechnicianIdForUser(user ?? undefined, emailOverride);
    if (!technicianId) {
      return NextResponse.json({ message: "Technician not found" }, { status: 404 });
    }

    const wJS = jsWeekday(date); // 0..6
    console.log("[mobile/schedule] dateISO:", dateISO, "wJS(0=Sun):", wJS, "tech:", technicianId);

    // ─────────────────────────────────────────────────────────────
    // PRÉ-VERSÃO (para Conditional GET)
    // ─────────────────────────────────────────────────────────────
    const [maxPlanUpdated, maxInstUpdated, plansCountToday, instCountToday] = await Promise.all([
      prisma.visitPlan.aggregate({
        _max: { updatedAt: true },
        where: { technicianId, active: true },
      }),
      prisma.visitInstance.aggregate({
        _max: { updatedAt: true },
        where: { technicianId, date },
      }),
      prisma.visitPlan.count({ where: { technicianId, active: true } }),
      prisma.visitInstance.count({ where: { technicianId, date } }),
    ]);

    const lastModifiedFallback =
      maxInstUpdated._max.updatedAt ??
      maxPlanUpdated._max.updatedAt ??
      new Date("2000-01-01T00:00:00.000Z");

    const preVersionKey = [
      "schedule",
      dateISO,
      technicianId,
      plansCountToday,
      instCountToday,
      maxPlanUpdated._max.updatedAt?.toISOString() ?? "-",
      maxInstUpdated._max.updatedAt?.toISOString() ?? "-",
      wJS,
    ].join("|");

    const preETag = etagOf(preVersionKey);

    const ifNoneMatch = req.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === preETag) {
      const notModified = new NextResponse(null, { status: 304 });
      notModified.headers.set("ETag", preETag);
      notModified.headers.set("Last-Modified", lastModifiedFallback.toUTCString());
      return notModified;
    }

    // ─────────────────────────────────────────────────────────────
    // 1) Busca TODOS os planos ativos do técnico e filtra pelo dia
    // ─────────────────────────────────────────────────────────────
    const plansAll = await prisma.visitPlan.findMany({
      where: { technicianId, active: true },
      include: {
        client: { select: {
          firstName: true, lastName: true, email: true,
          street: true, number: true, district: true, city: true, uf: true, cep: true,
        }},
      },
      orderBy: [{ order: "asc" }, { windowStart: "asc" }],
    });
    const plans = plansAll.filter((p) => arrayHasWeekday(p.weekdays as any, wJS));
    const planIds = plans.map((p) => p.id);
    console.log("[mobile/schedule] plansAll:", plansAll.length, "matched:", plans.length);

    // 2) Instâncias existentes p/ os planos do dia
    const existing = planIds.length
      ? await prisma.visitInstance.findMany({
          where: { planId: { in: planIds }, date },
          select: {
            id: true, planId: true, startHour: true, endHour: true, order: true, status: true,
          },
        })
      : [];
    const existingByPlan = new Map(existing.map((e) => [e.planId!, e]));
    console.log("[mobile/schedule] instancesExist:", existing.length);

    // 3) Criar faltantes
    const toCreate = plans.filter((p) => !existingByPlan.has(p.id));
    if (toCreate.length) {
      console.log("[mobile/schedule] creating instances for:", toCreate.map(p => p.id));
      await prisma.$transaction(
        toCreate.map((p) =>
          prisma.visitInstance.create({
            data: {
              date,
              startHour: p.windowStart ?? 9,
              endHour: p.windowEnd ?? 10,
              order: p.order ?? 100,
              status: "planned",
              plan: { connect: { id: p.id } },
              technician: { connect: { id: p.technicianId } },
              client: { connect: { id: p.clientId } },
            },
          })
        )
      );
    }

    // 4) Patch em planned (alinha com plano)
    const toPatch = existing
      .map((inst) => {
        const p = plans.find((x) => x.id === inst.planId);
        if (!p) return null;
        const next: { id: string; startHour?: number; endHour?: number; order?: number } = { id: inst.id };
        let changed = false;
        if (inst.status === "planned") {
          if (typeof p.windowStart === "number" && inst.startHour !== p.windowStart) { next.startHour = p.windowStart; changed = true; }
          if (typeof p.windowEnd === "number"   && inst.endHour   !== p.windowEnd)   { next.endHour   = p.windowEnd;   changed = true; }
          const ord = p.order ?? 100;
          if ((inst.order ?? 100) !== ord) { next.order = ord; changed = true; }
        }
        return changed ? next : null;
      })
      .filter(Boolean) as Array<{ id: string; startHour?: number; endHour?: number; order?: number }>;

    if (toPatch.length) {
      console.log("[mobile/schedule] patching instances:", toPatch.length);
      await prisma.$transaction(
        toPatch.map((p) =>
          prisma.visitInstance.update({
            where: { id: p.id },
            data: {
              ...(p.startHour != null ? { startHour: p.startHour } : {}),
              ...(p.endHour != null ? { endHour: p.endHour } : {}),
              ...(p.order != null ? { order: p.order } : {}),
            },
          })
        )
      );
    }

    // 5) Limpeza: remove instâncias inválidas (plano inativo/sem dia)
    const allInstancesToday = await prisma.visitInstance.findMany({
      where: { technicianId, date },
      include: {
        plan: { select: { id: true, active: true, weekdays: true } },
        client: { select: {
          firstName: true, lastName: true, email: true,
          street: true, number: true, district: true, city: true, uf: true, cep: true,
        }},
      },
      orderBy: [{ order: "asc" }, { startHour: "asc" }],
    });

    const invalidIds: string[] = [];
    for (const i of allInstancesToday) {
      if (!i.planId) continue; // instância manual/avulsa
      const p = i.plan;
      if (!p || !p.active || !arrayHasWeekday((p.weekdays as any), wJS)) invalidIds.push(i.id);
    }
    if (invalidIds.length) {
      console.log("[mobile/schedule] deleting invalid instances:", invalidIds.length);
      await prisma.visitInstance.deleteMany({ where: { id: { in: invalidIds } } });
    }

    // 6) Recarrega definitivas do dia (ordenadas por order + startHour)
    const instances = await prisma.visitInstance.findMany({
      where: { technicianId, date },
      include: {
        client: { select: {
          firstName: true, lastName: true, email: true,
          street: true, number: true, district: true, city: true, uf: true, cep: true,
        }},
      },
      orderBy: [{ order: "asc" }, { startHour: "asc" }],
    });
    console.log("[mobile/schedule] instancesReturned:", instances.length);

    // 7) Payload
    const items = instances.map((i) => ({
      id: i.id,
      startHour: i.startHour,
      endHour: i.endHour,
      order: i.order,
      status: i.status,
      notes: i.notes ?? "",
      client: { name: fullClientName(i.client), address: fullClientAddress(i.client) },
    }));

    // 8) Versão final (ETag/Last-Modified)
    const finalVersionKey = [
      preVersionKey,
      "final",
      instances.length,
      items.map((x) => `${x.id}:${x.startHour}:${x.endHour}:${x.order}:${x.status}`).join(","),
    ].join("|");
    const eTag = etagOf(finalVersionKey);

    const maxUpdated =
      instances.reduce<Date | null>((acc, cur) => {
        const d = (cur as any).updatedAt as Date | undefined;
        return !acc || (d && d > acc) ? (d ?? acc) : acc;
      }, null) ?? lastModifiedFallback;

    const res = NextResponse.json({ date: dateISO, technicianId, items });
    res.headers.set("ETag", eTag);
    res.headers.set("Last-Modified", maxUpdated.toUTCString());
    return res;
  } catch (e) {
    console.error("[mobile/schedule] error:", e);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
