import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const path = request.nextUrl.pathname;

  // Protect /admin routes (except /admin/login)
  if (path.startsWith("/admin") && path !== "/admin/login") {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Redirect away from login if already has cookie
  if (path === "/admin/login") {
    if (token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

// Export default to support standard compilation paths
export default proxy;

export const config = {
  matcher: ["/admin/:path*"],
};
