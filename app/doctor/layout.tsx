import type { Metadata } from "next";
import { DoctorShell } from "@/components/doctor/doctor-shell";

export const metadata: Metadata = {
  title: "Portal Lekarza · CMKW EDM",
  description:
    "System EDM – kalendarz, wizyty i dokumentacja medyczna CMKW.",
  robots: { index: false, follow: false },
};

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DoctorShell>{children}</DoctorShell>;
}
