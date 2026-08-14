// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
//teste

// Rotas públicas que não exigem login
const PUBLIC_PATHS: string[] = [
  "/login",
  "/forgot-password",
  "/verify-reset-code",
  "/reset-password",
  "/auth/signout",
  "/favicon.ico",
  "/assets",
  "/_next",
];

const AUTH_FLOW_PATHS: string[] = [
  "/login",
  "/forgot-password",
  "/verify-reset-code",
  "/reset-password",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

function isAuthFlowPath(pathname: string) {
  return AUTH_FLOW_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // considera logado se existir cookie de access/refresh do Supabase
  const hasAccess = !!(req.cookies.get("sb-access-token") || req.cookies.get("sb:token"));

  const isPublic = isPublicPath(pathname);
  const isAuthRoute = isAuthFlowPath(pathname);

  // Não logado tentando acessar rota privada -> /login?redirectTo=...
  if (!hasAccess && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // Logado indo para fluxo de auth -> manda para /dashboard
  if (hasAccess && isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ⚠ MUITO IMPORTANTE: nada de "as const", "as string[]" aqui
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|assets).*)"],
};
