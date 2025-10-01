import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { technicianId, dateISO, orderedIds } = await req.json() as {
      technicianId: string; dateISO: string; orderedIds: string[];
    };
    if (!technicianId || !dateISO || !Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    const d = new Date(dateISO + "T00:00:00Z");

    await prisma.$transaction(
      orderedIds.map((id, idx) =>
        prisma.visitInstance.update({
          where: { id },
          data: { order: idx, technicianId, date: d }, // garante coesão
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
