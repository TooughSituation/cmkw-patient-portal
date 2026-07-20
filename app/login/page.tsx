import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Stethoscope, UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Portal Pacjenta — logowanie",
  description:
    "Zaloguj się do Portalu Pacjenta Centrum Medycznego Kiryluk i Wenta.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="bg-muted/40 py-12 md:py-16">
      <div className="mx-auto max-w-md px-4 md:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-deep"
        >
          <ArrowLeft className="size-4" />
          Powrót na stronę główną
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
            <UserRound className="size-6" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-brand-heading md:text-3xl">
            Portal Pacjenta
          </h1>
          <div className="section-divider mt-3 mb-4" />
          <p className="text-muted-foreground">
            Zaloguj się, aby umawiać wizyty i przeglądać rezerwacje
          </p>
        </div>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-brand-heading">
              Witamy ponownie
            </CardTitle>
            <CardDescription>
              Podaj e-mail i hasło użyte przy rejestracji. Personel medyczny —
              osobne logowanie.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">Ładowanie…</p>
              }
            >
              <LoginForm variant="patient" />
            </Suspense>

            <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Demo pacjenta</p>
              <p className="mt-1 font-mono">
                jan.kowalski@email.pl / jankowalski123
              </p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 border-t border-slate-100 pt-4">
              <Stethoscope className="size-4 text-brand-deep" />
              <Link
                href="/doctor/login"
                className="text-sm font-semibold text-brand-deep hover:text-brand"
              >
                Jestem lekarzem — Portal Lekarza (EDM)
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
