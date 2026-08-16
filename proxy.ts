import { type NextRequest, NextResponse } from "next/server";

// Domains that serve the app under /eisenhower instead of at their own root.
const LEGACY_PREFIXED_HOSTS = new Set(["brentlwilliams.com", "www.brentlwilliams.com"]);
const PREFIX = "/eisenhower";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (!LEGACY_PREFIXED_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(PREFIX, request.url));
  }

  if (pathname === PREFIX || pathname.startsWith(`${PREFIX}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(PREFIX.length) || "/";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
