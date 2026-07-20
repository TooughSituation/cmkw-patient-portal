import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import {
  canAccessFacilityAdmin,
  defaultHomeForRole,
  isDoctorPortalRole,
  isPatientRole,
} from "@/lib/auth/roles";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const { pathname } = req.nextUrl;

  const isDoctorLogin = pathname === "/doctor/login";
  const isDoctorRoute =
    pathname.startsWith("/doctor") && !isDoctorLogin;
  const isPortalRoute = pathname.startsWith("/portal");
  const isPatientLogin = pathname === "/login";
  const isRegister = pathname === "/rejestracja";

  // --- Osobne logowanie lekarza (publiczne dla niezalogowanych) ---
  if (isDoctorLogin) {
    if (isLoggedIn) {
      if (isDoctorPortalRole(role)) {
        return NextResponse.redirect(new URL("/doctor", req.nextUrl.origin));
      }
      // pacjent na doctor login → portal pacjenta
      return NextResponse.redirect(new URL("/portal", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // --- Portal Lekarza / EDM ---
  if (isDoctorRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/doctor/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isDoctorPortalRole(role)) {
      return NextResponse.redirect(new URL("/portal", req.nextUrl.origin));
    }
    // Admin / ustawienia placówki — tylko facility, admin, reception
    if (
      (pathname === "/doctor/admin" ||
        pathname.startsWith("/doctor/admin/")) &&
      !canAccessFacilityAdmin(role)
    ) {
      const home = new URL("/doctor", req.nextUrl.origin);
      home.searchParams.set("denied", "admin");
      return NextResponse.redirect(home);
    }
  }

  // --- Portal Pacjenta ---
  if (isPortalRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Personel nie używa portalu pacjenta
  if (isPortalRoute && isLoggedIn && isDoctorPortalRole(role)) {
    return NextResponse.redirect(new URL("/doctor", req.nextUrl.origin));
  }

  // Zalogowany na login pacjenta / rejestracja
  if (isLoggedIn && (isPatientLogin || isRegister)) {
    return NextResponse.redirect(
      new URL(defaultHomeForRole(role), req.nextUrl.origin)
    );
  }

  // Lekarz nie powinien „utknąć” na loginie pacjenta (już obsłużone wyżej)
  // Pacjent próbujący callback /doctor → middleware na isDoctorRoute

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/portal/:path*",
    "/doctor/:path*",
    "/doctor/login",
    "/login",
    "/rejestracja",
  ],
};
