import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { technicianId, dateISO } = await req.json();
    const d = new Date(dateISO + "T00:00:00Z");
    const list = await prisma.visitInstance.findMany({
      where: { technicianId, date: d },
      orderBy: { order: "asc" },
      select: { id: true },
    });
    await prisma.$transaction(
      list.map((x, i) => prisma.visitInstance.update({ where: { id: x.id }, data: { order: i } }))
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
