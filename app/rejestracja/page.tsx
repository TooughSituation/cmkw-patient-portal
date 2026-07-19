"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarPlus, LogIn, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RejestracjaPage() {
  const router = useRouter();

  return (
    <div className="bg-muted/40 py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6 gap-2 text-brand hover:text-brand-deep"
        >
          <ArrowLeft className="size-4" />
          Powrót na stronę główną
        </Button>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-brand-heading md:text-3xl">
            Rejestracja / Portal Pacjenta
          </h1>
          <div className="section-divider mt-3 mb-4" />
          <p className="mx-auto max-w-xl text-muted-foreground">
            Szkielet modułu rejestracji i logowania. Logika autoryzacji zostanie
            dodana w kolejnych krokach.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
                <CalendarPlus className="size-6" />
              </div>
              <CardTitle className="text-brand-heading">
                Nowa rejestracja
              </CardTitle>
              <CardDescription>
                Utwórz konto pacjenta, aby umawiać wizyty online i zarządzać
                terminami.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-brand text-white hover:bg-brand-deep"
                onClick={() => {
                  // Placeholder – no auth yet
                  alert(
                    "Formularz rejestracji będzie dostępny po wdrożeniu autoryzacji."
                  );
                }}
              >
                Zarejestruj się
              </Button>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
                <LogIn className="size-6" />
              </div>
              <CardTitle className="text-brand-heading">
                Masz już konto?
              </CardTitle>
              <CardDescription>
                Zaloguj się do portalu pacjenta, aby zobaczyć wizyty i dokumenty.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-brand-deep text-white hover:bg-black"
                onClick={() => router.push("/portal")}
              >
                Przejdź do portalu
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-lg border border-blue-100 bg-secondary/60 p-4 text-sm text-brand-deep">
          <Shield className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>
            <strong>Uwaga (szkielet):</strong> strona{" "}
            <code className="rounded bg-white px-1 py-0.5 text-xs">/portal</code>{" "}
            jest oznaczona jako chroniona w architekturze, ale na tym etapie nie
            wymaga logowania — przekierowanie działa bez weryfikacji sesji.
          </p>
        </div>
      </div>
    </div>
  );
}
