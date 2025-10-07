// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PRIVATE_PREFIXES = [
  "/dashboard",
  "/routes",
  "/clients",
  "/technicians",
  "/visits",
  "/calendar",
  "/quickstart",
];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isPrivate) return NextResponse.next();

  const hasSupabaseAuthCookie = req.cookies
    .getAll()
    .some((c) =>
      c.name === "sb-access-token" || (c.name.startsWith("sb-") && c.name.endsWith("-auth-token"))
    );

  if (!hasSupabaseAuthCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirectTo=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/routes/:path*",
    "/clients/:path*",
    "/technicians/:path*",
    "/visits/:path*",
    "/calendar/:path*",
    "/quickstart/:path*",
  ],
};
