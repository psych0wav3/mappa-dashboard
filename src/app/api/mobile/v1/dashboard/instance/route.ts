import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toYMD(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function POST(req: NextRequest) {
  try {
    const { clientId, technicianId, dateISO, startHour, endHour, notes } = await req.json();
    if (!clientId || !technicianId || !dateISO) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    const d = toYMD(new Date(dateISO));

    // último order do dia/técnico
    const last = await prisma.visitInstance.findFirst({
      where: { date: d, technicianId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const order = (last?.order ?? -1) + 1;

    const item = await prisma.visitInstance.create({
      data: {
        clientId, technicianId, date: d, startHour: startHour ?? 9, endHour: endHour ?? 11,
        notes, status: "planned", order,
      },
      include: { client: true, technician: true },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
