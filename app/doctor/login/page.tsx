import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Stethoscope } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { DEMO_DOCTOR_ACCOUNTS } from "@/lib/demo-accounts";

export const metadata: Metadata = {
  title: "Portal Lekarza — logowanie",
  description: "Logowanie do CMKW EDM — Portal Lekarza.",
  robots: { index: false, follow: false },
};

export default function DoctorLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-secondary/40">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12 md:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-deep"
        >
          <ArrowLeft className="size-4" />
          Strona główna CMKW
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-brand-deep text-white shadow-md">
            <Stethoscope className="size-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-brand-heading md:text-3xl">
            Portal Lekarza
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-brand">
            CMKW EDM
          </p>
          <div className="section-divider mt-3 mb-3" />
          <p className="text-muted-foreground">
            Logowanie personelu medycznego i recepcji
          </p>
        </div>

        <Card className="border-slate-200 shadow-md ring-1 ring-brand/10">
          <CardHeader>
            <CardTitle className="text-lg text-brand-heading">
              Wejście do systemu EDM
            </CardTitle>
            <CardDescription>
              Użyj konta służbowego @cmkw.pl. Pacjenci logują się w{" "}
              <Link href="/login" className="font-medium text-brand underline">
                Portalu Pacjenta
              </Link>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">Ładowanie…</p>
              }
            >
              <LoginForm
                variant="doctor"
                defaultEmail="jan.kiryluk@cmkw.pl"
              />
            </Suspense>

            <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Demo — szybki start
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                <li>
                  <span className="font-mono font-medium text-brand-deep">
                    jan.kiryluk@cmkw.pl
                  </span>{" "}
                  / jankiryluk123{" "}
                  <span className="text-muted-foreground">(admin)</span>
                </li>
                <li>
                  <span className="font-mono">
                    {DEMO_DOCTOR_ACCOUNTS[1]?.email}
                  </span>{" "}
                  / {DEMO_DOCTOR_ACCOUNTS[1]?.password}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
