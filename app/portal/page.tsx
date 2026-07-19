import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Calendar,
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

export const metadata: Metadata = {
  title: "Portal Pacjenta",
  description: "Panel pacjenta – wizyty, dokumenty i profil.",
  robots: { index: false, follow: false },
};

const modules = [
  {
    title: "Moje wizyty",
    description: "Lista zaplanowanych i historycznych wizyt.",
    icon: Calendar,
  },
  {
    title: "Dokumenty",
    description: "Wyniki badań, skierowania i zalecenia.",
    icon: FileText,
  },
  {
    title: "Profil",
    description: "Dane kontaktowe i preferencje powiadomień.",
    icon: UserRound,
  },
] as const;

export default async function PortalPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/portal");
  }

  const { user } = session;

  return (
    <div className="bg-muted/40 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
            <Lock className="size-3.5" />
            Sesja aktywna · strefa chroniona
          </div>
          <LogoutButton
            className="border-brand/30 text-brand hover:bg-secondary"
            label="Wyloguj"
          />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-brand-heading md:text-3xl">
            Witaj, {user.firstName}!
          </h1>
          <div className="section-divider mt-3 mb-4 ml-0" />
          <p className="max-w-2xl text-muted-foreground">
            To Twój panel pacjenta w Centrum Medycznym Kiryluk i Wenta. Poniżej
            znajdziesz skrót danych konta oraz placeholdery przyszłych modułów.
          </p>
        </div>

        <Card className="mb-8 border-gray-100 shadow-sm">
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="border-gray-100 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
                    <Icon className="size-6" />
                  </div>
                  <CardTitle className="text-brand-heading">
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Wkrótce
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
