import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { BookingWizard } from "@/components/booking/booking-wizard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Umów wizytę",
  description: "Rezerwacja wizyty w Centrum Medycznym Kiryluk i Wenta.",
  robots: { index: false, follow: false },
};

export default async function UmowWizytePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/portal/umow-wizyte");
  }

  const { user } = session;

  return (
    <div className="bg-muted/40 py-10 md:py-14">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <Link
          href="/portal"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-deep"
        >
          <ArrowLeft className="size-4" />
          Wróć do portalu
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-brand-heading md:text-3xl">
            Umów wizytę
          </h1>
          <div className="section-divider mt-3 mb-4 ml-0" />
          <p className="max-w-2xl text-muted-foreground">
            Wybierz lekarza, usługę i dogodny termin. Na końcu przejdziesz do
            bezpiecznej (symulowanej) płatności online.
          </p>
        </div>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-brand-heading">
              Rezerwacja online
            </CardTitle>
            <CardDescription>
              Godziny rejestracji placówki: pn–pt 8:00–18:00. Terminy w
              systemie są demonstracyjne.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingWizard
              patient={{
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email ?? "",
                phone: user.phone,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
