// app/api/mobile/v1/schedule/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromAuth, getTechnicianIdForUser } from "@/lib/auth";

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
  const dom0 = jsDay0to6;                     // 0..6 (0=Dom)
  const seg1a7 = jsDay0to6 === 0 ? 7 : jsDay0to6; // 1..7 (Dom=7)
  const seg1a6 = jsDay0to6 === 0 ? 0 : jsDay0to6; // 1..6 (Dom fora)
  return arr.includes(dom0) || arr.includes(seg1a7) || (seg1a6 !== 0 && arr.includes(seg1a6));
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const dateISO = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
    const emailOverride = url.searchParams.get("email"); // útil para testes no navegador
    const date = new Date(`${dateISO}T00:00:00.000Z`);

    const user = await getUserFromAuth(req);
    const technicianId = await getTechnicianIdForUser(user ?? undefined, emailOverride);
    if (!technicianId) {
      return NextResponse.json({ message: "Technician not found" }, { status: 404 });
    }

    const wJS = jsWeekday(date);
    console.log("[mobile/schedule] dateISO:", dateISO, "wJS(0=Sun):", wJS, "tech:", technicianId);

    // Busca TODOS os planos ativos do técnico e filtra o dia no código
    const plansAll = await prisma.visitPlan.findMany({
      where: { technicianId, active: true },
      include: {
        client: { select: {
          firstName: true, lastName: true, email: true,
          street: true, number: true, district: true, city: true, uf: true, cep: true,
        }},
      },
      orderBy: { order: "asc" },
    });
    const plans = plansAll.filter((p) => arrayHasWeekday(p.weekdays as any, wJS));
    console.log("[mobile/schedule] plansAll:", plansAll.length, "matched:", plans.length);

    // Ver quais já têm instance para a data
    const planIds = plans.map((p) => p.id);
    const existing = planIds.length
      ? await prisma.visitInstance.findMany({ where: { planId: { in: planIds }, date }, select: { id: true, planId: true } })
      : [];
    const existingSet = new Set(existing.map((e) => e.planId));
    console.log("[mobile/schedule] instancesExist:", existing.length);

    // Criar instâncias faltantes
    const toCreate = plans.filter((p) => !existingSet.has(p.id));
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

    // Ler TODAS as instâncias do técnico para a data
    const instances = await prisma.visitInstance.findMany({
      where: { technicianId, date },
      include: {
        client: { select: {
          firstName: true, lastName: true, email: true,
          street: true, number: true, district: true, city: true, uf: true, cep: true,
        }},
      },
      orderBy: { order: "asc" },
    });
    console.log("[mobile/schedule] instancesReturned:", instances.length);

    const items = instances.map((i) => ({
      id: i.id,
      startHour: i.startHour,
      endHour: i.endHour,
      order: i.order,
      status: i.status,
      notes: i.notes ?? "",
      client: {
        name: fullClientName(i.client),
        address: fullClientAddress(i.client),
      },
    }));

    return NextResponse.json({ date: dateISO, technicianId, items });
  } catch (e) {
    console.error("[mobile/schedule] error:", e);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
