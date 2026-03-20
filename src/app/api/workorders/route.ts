import { NextResponse } from "next/server";
import { createWorkOrder, listWorkOrders } from "@/app/(private)/workorders/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listWorkOrders();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao listar OS" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createWorkOrder(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao criar OS" }, { status: 400 });
  }
}