import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/reader", "/librarian", "/superadmin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const session = req.cookies.get("ailibrarian_session")?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const user = JSON.parse(decodeURIComponent(session));
    if (pathname.startsWith("/reader") && user.role !== "reader") {
      return NextResponse.redirect(new URL(`/${user.role}`, req.url));
    }
    if (pathname.startsWith("/librarian") && user.role !== "librarian") {
      return NextResponse.redirect(new URL(`/${user.role}`, req.url));
    }
    if (pathname.startsWith("/superadmin") && user.role !== "superadmin") {
      return NextResponse.redirect(new URL(`/${user.role}`, req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/reader/:path*", "/librarian/:path*", "/superadmin/:path*"],
};
