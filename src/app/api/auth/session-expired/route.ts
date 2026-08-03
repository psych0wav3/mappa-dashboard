import {
  NextRequest,
  NextResponse,
} from "next/server";

const SESSION_COOKIES = [
  "mappa_access_token",
  "mappa_company_id",
  "mappa_company_name",
  "mappa_roles",
  "mappa_role",
  "mappa_user",
] as const;

export async function GET(
  request: NextRequest,
) {
  const reason =
    request.nextUrl.searchParams.get(
      "reason",
    ) || "session-expired";

  const loginUrl =
    new URL(
      "/login",
      request.url,
    );

  loginUrl.searchParams.set(
    "reason",
    reason,
  );

  const response =
    NextResponse.redirect(
      loginUrl,
    );

  for (
    const cookieName of
    SESSION_COOKIES
  ) {
    response.cookies.set(
      cookieName,
      "",
      {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        sameSite: "lax",
      },
    );
  }

  return response;
}