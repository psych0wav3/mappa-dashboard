// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas públicas que não exigem login
const PUBLIC_PATHS: string[] = [
  "/login",
  "/auth/signout",
  "/favicon.ico",
  "/assets",
  "/_next", // assets do Next
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p)
  );
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Considera logado se existir cookie de access/refresh do Supabase
  const hasAccess = !!(
    req.cookies.get("sb-access-token") ||
    req.cookies.get("sb:token") // compat
  );

  const isPublic = isPublicPath(pathname);
  const isAuthRoute = pathname.startsWith("/login");

  // Não logado tentando acessar rota privada -> /login?redirectTo=...
  if (!hasAccess && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
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

// Matcher amplo, mas compatível com o parser do Next (sem `as const`)
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|assets).*)",
  ],
};
