import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, CalendarDays, Home } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Wizyta potwierdzona",
  robots: { index: false, follow: false },
};

export default async function SukcesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/portal");
  }

  return (
    <div className="bg-muted/40 py-12 md:py-16">
      <div className="mx-auto max-w-md px-4">
        <Card className="border-gray-100 text-center shadow-sm">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-9" />
            </div>
            <CardTitle className="text-brand-heading">
              Wizyta potwierdzona!
            </CardTitle>
            <CardDescription>
              Płatność została zasymulowana pomyślnie. Rezerwacja jest widoczna
              na liście „Moje wizyty” w portalu.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              asChild
              className="h-11 gap-2 bg-brand text-white hover:bg-brand-deep"
            >
              <Link href="/portal">
                <Home className="size-4" />
                Przejdź do portalu
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 gap-2">
              <Link href="/portal/umow-wizyte">
                <CalendarDays className="size-4" />
                Umów kolejną wizytę
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
