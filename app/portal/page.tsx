"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Lock,
  UserRound,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const placeholders = [
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
    title: "Profil pacjenta",
    description: "Dane kontaktowe i preferencje powiadomień.",
    icon: UserRound,
  },
] as const;

export default function PortalPage() {
  const router = useRouter();

  return (
    <div className="bg-muted/40 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="gap-2 text-brand hover:text-brand-deep"
          >
            <ArrowLeft className="size-4" />
            Strona główna
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/rejestracja")}
            className="gap-2 border-brand/30 text-brand hover:bg-secondary"
          >
            <Lock className="size-4" />
            Wyloguj (placeholder)
          </Button>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
            <Lock className="size-3.5" />
            Chroniona strefa (szkielet — bez auth)
          </div>
          <h1 className="mt-4 text-2xl font-bold uppercase tracking-wide text-brand-heading md:text-3xl">
            Portal Pacjenta
          </h1>
          <div className="section-divider mt-3 mb-4 ml-0" />
          <p className="max-w-2xl text-muted-foreground">
            To jest szkielet chronionego obszaru pacjenta. Po wdrożeniu
            autoryzacji dostęp będzie wymagał aktywnej sesji (np. middleware +
            NextAuth / Clerk).
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {placeholders.map((item) => {
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
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      alert(
                        `Moduł „${item.title}” zostanie zaimplementowany w kolejnym etapie.`
                      )
                    }
                  >
                    Otwórz (wkrótce)
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
