import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { targetTechnicianId, targetDateISO, beforeId } = await req.json() as {
      targetTechnicianId: string; targetDateISO: string; beforeId?: string;
    };
    if (!targetTechnicianId || !targetDateISO) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    const d = new Date(targetDateISO + "T00:00:00Z");

    // calcula order
    let order: number;
    if (beforeId) {
      const before = await prisma.visitInstance.findUnique({ where: { id: beforeId }, select: { order: true }});
      order = Math.max((before?.order ?? 0) - 0.5, 0); // slot intermediário
    } else {
      const last = await prisma.visitInstance.findFirst({
        where: { date: d, technicianId: targetTechnicianId },
        orderBy: { order: "desc" }, select: { order: true }
      });
      order = (last?.order ?? -1) + 1;
    }

    await prisma.visitInstance.update({
      where: { id: params.id },
      data: { technicianId: targetTechnicianId, date: d, order },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
