// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas públicas que não exigem login
const PUBLIC_PATHS = [
  "/login",
  "/auth/signout",
  "/favicon.ico",
  "/assets",
  "/_next",           // assets do Next
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Edge-safe: considera logado se existir o cookie de access/refresh do Supabase
  const hasAccess = !!(
    req.cookies.get("sb-access-token") || req.cookies.get("sb:token") // compat
  );
  const isPublic = isPublicPath(pathname);
  const isAuthRoute = pathname.startsWith("/login");

  // Não logado tentando acessar rota privada -> /login?redirectTo=...
  if (!hasAccess && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // preserva destino para redirecionar após o login
    url.searchParams.set("redirectTo", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // Logado indo para /login -> manda para /dashboard
  if (hasAccess && isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Mantém o matcher bem amplo, como estava
export const config = {
  matcher: ["/((?!_next|assets|favicon\\.ico).*)"],
};
