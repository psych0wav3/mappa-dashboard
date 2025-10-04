import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  // { id?, workspaceId, technicianId, weekday, frequency, startDate, endCondition, endAfter?, endDate? }
  const { id, ...data } = body;

  const saved = id
    ? await prisma.routeTemplate.update({ where: { id }, data })
    : await prisma.routeTemplate.create({ data });

  return NextResponse.json({ data: saved });
}
