import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rejestracja / Portal Pacjenta",
  description:
    "Zarejestruj się lub zaloguj do portalu pacjenta Centrum Medycznego Kiryluk i Wenta.",
  robots: { index: true, follow: true },
};

export default function RejestracjaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
