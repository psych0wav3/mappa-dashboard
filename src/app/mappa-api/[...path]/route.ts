import { NextRequest, NextResponse } from "next/server";

import { getBackendApiBaseUrl } from "@/lib/browser-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "content-encoding",
  "accept-encoding",
]);

type RouteContext = {
  params: {
    path: string[];
  };
};

function filterHeaders(headers: Headers) {
  const next = new Headers();

  headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      next.set(key, value);
    }
  });

  return next;
}

async function proxy(request: NextRequest, context: RouteContext) {
  const backend = getBackendApiBaseUrl();

  if (!backend) {
    return NextResponse.json(
      {
        error:
          "API_URL não configurada no servidor. Use o endereço HTTP da API .NET.",
      },
      { status: 500 },
    );
  }

  const path = context.params.path.join("/");
  const url = `${backend}/${path}${request.nextUrl.search}`;
  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  try {
    const upstream = await fetch(url, {
      method,
      headers: filterHeaders(request.headers),
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: filterHeaders(upstream.headers),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao conectar na API.";

    return NextResponse.json(
      { error: `Proxy da API: ${message}` },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
