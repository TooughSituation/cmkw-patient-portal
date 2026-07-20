import { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      peselMasked: string;
      role: UserRole;
      /** Powiązanie ze staff / booking doctorId (lekarze) */
      doctorId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    peselMasked: string;
    email: string;
    role: UserRole;
    doctorId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    peselMasked: string;
    role: UserRole;
    doctorId?: string;
  }
}
