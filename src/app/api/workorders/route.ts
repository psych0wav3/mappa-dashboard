import { NextResponse } from "next/server";

import {
  createAdminWorkOrder,
  listWorkOrders,
} from "@/app/(private)/workorders/actions";

export const dynamic = "force-dynamic";

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}

export async function GET() {
  try {
    const data = await listWorkOrders();

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: getErrorMessage(
          error,
          "Erro ao listar OS",
        ),
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Parameters<
        typeof createAdminWorkOrder
      >[0];

    const created = await createAdminWorkOrder(body);

    return NextResponse.json(created, {
      status: 201,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: getErrorMessage(
          error,
          "Erro ao criar OS",
        ),
      },
      {
        status: 400,
      },
    );
  }
}