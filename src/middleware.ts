import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/features",
  "/pricing",
  "/tecnicos",
  "/clientes",
  "/backoffice",
  "/cobranca",
  "/contato",
  "/login",
  "/forgot-password",
  "/verify-reset-code",
  "/reset-password",
  "/auth/signout",
];

const AUTH_FLOW_PATHS = [
  "/login",
  "/forgot-password",
  "/verify-reset-code",
  "/reset-password",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) =>
    path === "/"
      ? pathname === "/"
      : pathname === path ||
        pathname.startsWith(`${path}/`),
  );
}

function isAuthFlowPath(pathname: string) {
  return AUTH_FLOW_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`),
  );
}

function isSuperAdmin(role?: string) {
  const normalized = String(role ?? "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .toUpperCase();

  return (
    normalized === "SUPER_ADMIN" ||
    normalized === "SUPERADMIN"
  );
}

export async function middleware(
  req: NextRequest,
) {
  const { pathname, search } = req.nextUrl;

  const hasAccess = Boolean(
    req.cookies.get("mappa_access_token")?.value,
  );

  const role =
    req.cookies.get("mappa_role")?.value;

  const companyId =
    req.cookies.get("mappa_company_id")?.value;

  const superAdminWithoutCompany =
    hasAccess &&
    isSuperAdmin(role) &&
    !companyId;

  const isPublic = isPublicPath(pathname);
  const isAuthRoute =
    isAuthFlowPath(pathname);

  const isCompanySelection =
    pathname === "/select-company" ||
    pathname.startsWith("/select-company/");

  if (!hasAccess && !isPublic) {
    const url = req.nextUrl.clone();

    url.pathname = "/login";

    url.searchParams.set(
      "redirectTo",
      pathname + (search || ""),
    );

    return NextResponse.redirect(url);
  }

  if (hasAccess && isAuthRoute) {
    const url = req.nextUrl.clone();

    url.pathname =
      superAdminWithoutCompany
        ? "/select-company"
        : "/dashboard";

    url.search = "";

    return NextResponse.redirect(url);
  }

  if (
    superAdminWithoutCompany &&
    !isCompanySelection &&
    !isPublic
  ) {
    const url = req.nextUrl.clone();

    url.pathname = "/select-company";
    url.search = "";

    return NextResponse.redirect(url);
  }

  if (
    hasAccess &&
    isCompanySelection &&
    !isSuperAdmin(role)
  ) {
    const url = req.nextUrl.clone();

    url.pathname = "/dashboard";
    url.search = "";

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)",
  ],
};