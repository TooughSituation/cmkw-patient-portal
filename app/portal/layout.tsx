import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Pacjenta",
  description:
    "Chroniony portal pacjenta – wizyty, dokumenty i profil (szkielet).",
  robots: { index: false, follow: false },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
