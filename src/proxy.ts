import { NextResponse, type NextRequest } from "next/server";

/**
 * Convenience only: sends visitors without a session cookie to sign-in before they see an admin
 * page shell. It protects nothing by itself. Real authorization runs in layouts, server actions
 * and services, which validate the session in the database on every request.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasCookie =
    request.cookies.has("diyalo_session") || request.cookies.has("__Host-diyalo_session");
  if (!hasCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
