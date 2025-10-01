//src/app/api/mobile/v1/visit/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromBearer } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromBearer(req.headers.get("authorization"));
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();
    const { status, notes } = body as { status?: string; notes?: string };

    // valida que a visita pertence ao técnico logado
    const visit = await prisma.visitInstance.findUnique({
      where: { id: params.id },
      select: { id: true, technician: { select: { userId: true } } }
    });
    if (!visit || visit.technician.userId !== user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    await prisma.visitInstance.update({
      where: { id: params.id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {})
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
