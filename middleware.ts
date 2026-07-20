import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import {
  defaultHomeForRole,
  isDoctorPortalRole,
} from "@/lib/auth/roles";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const { pathname } = req.nextUrl;
  const isDoctorRoute = pathname.startsWith("/doctor");
  const isPortalRoute = pathname.startsWith("/portal");

  // --- Portal Lekarza / EDM ---
  if (isDoctorRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isDoctorPortalRole(role)) {
      return NextResponse.redirect(new URL("/portal", req.nextUrl.origin));
    }
  }

  // --- Portal Pacjenta ---
  if (isPortalRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Personel z /portal → przekieruj do EDM (opcja UX)
  if (isPortalRoute && isLoggedIn && isDoctorPortalRole(role)) {
    return NextResponse.redirect(new URL("/doctor", req.nextUrl.origin));
  }

  // Zalogowany na login/rejestracja → domyślny home wg roli
  if (isLoggedIn && (pathname === "/login" || pathname === "/rejestracja")) {
    return NextResponse.redirect(
      new URL(defaultHomeForRole(role), req.nextUrl.origin)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/portal/:path*", "/doctor/:path*", "/login", "/rejestracja"],
};
