// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/auth/signout", "/favicon.ico", "/assets", "/_next"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p)
  );
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const hasAccess = !!(
    req.cookies.get("sb-access-token") ||
    req.cookies.get("sb:token")
  );

  const isPublic = isPublicPath(pathname);
  const isAuthRoute = pathname.startsWith("/login");

  if (!hasAccess && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  if (hasAccess && isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|assets).*)"],
};
