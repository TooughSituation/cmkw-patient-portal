import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Logowanie",
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
          <h1 className="text-2xl font-bold uppercase tracking-wide text-brand-heading md:text-3xl">
            Logowanie
          </h1>
          <div className="section-divider mt-3 mb-4" />
          <p className="text-muted-foreground">
            Zaloguj się do Portalu Pacjenta
          </p>
        </div>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-brand-heading">
              Witamy ponownie
            </CardTitle>
            <CardDescription>
              Podaj e-mail i hasło użyte przy rejestracji.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">Ładowanie…</p>
              }
            >
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
