import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/lib/auth/roles";

/**
 * Konfiguracja edge-compatible (bez Node APIs / bcrypt).
 * Używana w middleware — pełna konfiguracja z Credentials jest w auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  providers: [], // Credentials dodawane w auth.ts (Node runtime)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.peselMasked = user.peselMasked;
        token.email = user.email;
        token.role = (user.role ?? "patient") as UserRole;
        token.doctorId = user.doctorId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phone = token.phone as string;
        session.user.peselMasked = token.peselMasked as string;
        session.user.email = token.email as string;
        session.user.role = (token.role as UserRole) ?? "patient";
        session.user.doctorId = token.doctorId as string | undefined;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
