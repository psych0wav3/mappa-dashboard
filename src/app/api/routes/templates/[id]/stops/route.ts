// src/app/api/route-templates/[id]/stops/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const templateId = params.id;

  const { stops } = (await req.json()) as {
    stops: Array<{
      order: number;
      clientId: string;
      durationMin?: number;
      windowStart?: string | null;
      windowEnd?: string | null;
      note?: string | null;
      clientLat?: number | null;
      clientLng?: number | null;
      addressLine?: string | null;
    }>;
  };

  // ⚠️ Se no template suas janelas são “horas do dia” e não timestamps,
  // considere trocar o tipo no schema para Int, senão new Date("09:00") vira inválido.

  await prisma.$transaction(async (tx) => {
    await tx.routeStopTemplate.deleteMany({ where: { templateId } });

    await tx.routeStopTemplate.createMany({
      data: stops.map((s) => ({
        templateId,
        order: s.order,
        clientId: s.clientId,
        durationMin: s.durationMin ?? 30,
        windowStart: s.windowStart ? new Date(s.windowStart) : null,
        windowEnd: s.windowEnd ? new Date(s.windowEnd) : null,
        note: s.note ?? null,
        clientLat: s.clientLat ?? null,
        clientLng: s.clientLng ?? null,
        addressLine: s.addressLine ?? null,
      })),
    });
  });

  return NextResponse.json({ ok: true });
}
