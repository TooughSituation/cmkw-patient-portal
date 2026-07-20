import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarPlus,
  FileText,
  Lock,
  UserRound,
} from "lucide-react";
import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { MyAppointments } from "@/components/booking/my-appointments";

export const metadata: Metadata = {
  title: "Portal Pacjenta",
  description: "Panel pacjenta – wizyty, dokumenty i profil.",
  robots: { index: false, follow: false },
};

export default async function PortalPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/portal");
  }

  const { user } = session;

  return (
    <div
      className="bg-muted/40 py-12 md:py-16"
      data-tour="patient-dashboard"
    >
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
            <Lock className="size-3.5" />
            Sesja aktywna · strefa chroniona
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="gap-2 bg-brand text-white hover:bg-brand-deep"
              data-tour="patient-book-cta"
            >
              <Link href="/portal/umow-wizyte">
                <CalendarPlus className="size-4" />
                Umów wizytę
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2 border-brand/30">
              <Link href="/portal/przewodnik">
                <FileText className="size-4" />
                Przewodnik
              </Link>
            </Button>
            <LogoutButton
              className="border-brand/30 text-brand hover:bg-secondary"
              label="Wyloguj"
            />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-brand-heading md:text-3xl">
            Witaj, {user.firstName}!
          </h1>
          <div className="section-divider mt-3 mb-4 ml-0" />
          <p className="max-w-2xl text-muted-foreground">
            Panel pacjenta CMKW — umawiaj wizyty online, przeglądaj rezerwacje
            i zarządzaj danymi konta.
          </p>
        </div>

        <div className="mb-8">
          <MyAppointments />
        </div>

        <Card
          className="mb-8 border-gray-100 shadow-sm"
          data-tour="patient-profile"
        >
          <CardHeader>
            <CardTitle className="text-brand-heading">Dane konta</CardTitle>
            <CardDescription>
              Informacje z sesji JWT (PESEL tylko w formie zmaskowanej).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Imię i nazwisko
                </dt>
                <dd className="mt-1 text-foreground">
                  {user.firstName} {user.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  E-mail
                </dt>
                <dd className="mt-1 text-foreground">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Telefon
                </dt>
                <dd className="mt-1 text-foreground">{user.phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  PESEL
                </dt>
                <dd className="mt-1 font-mono text-foreground">
                  {user.peselMasked}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
                <FileText className="size-6" />
              </div>
              <CardTitle className="text-brand-heading">Dokumenty</CardTitle>
              <CardDescription>
                Wyniki badań, skierowania i zalecenia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Wkrótce
              </Button>
            </CardContent>
          </Card>
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
                <UserRound className="size-6" />
              </div>
              <CardTitle className="text-brand-heading">Profil</CardTitle>
              <CardDescription>
                Dane kontaktowe i preferencje powiadomień.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Wkrótce
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
