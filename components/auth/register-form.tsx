"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { registerSchema } from "@/lib/validations/auth";

type FormState = {
  firstName: string;
  lastName: string;
  pesel: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  rodConsent: boolean;
};

const initial: FormState = {
  firstName: "",
  lastName: "",
  pesel: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  rodConsent: false,
};

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload = {
      ...form,
      pesel: form.pesel.replace(/\s/g, ""),
      rodConsent: form.rodConsent as true,
    };

    const parsed = registerSchema.safeParse({
      ...payload,
      rodConsent: form.rodConsent ? true : false,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      // z.literal(true) may put error on rodConsent when false
      if (!form.rodConsent && !fieldErrors.rodConsent) {
        fieldErrors.rodConsent =
          "Wymagana jest zgoda na przetwarzanie danych osobowych (RODO)";
      }
      setErrors(fieldErrors);
      toast.error("Sprawdź poprawność formularza.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        toast.error(data.error ?? "Rejestracja nie powiodła się.");
        setErrors({ form: data.error ?? "Rejestracja nie powiodła się." });
        return;
      }

      const loginResult = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        toast.success("Konto utworzone. Zaloguj się.");
        router.push("/login");
        return;
      }

      toast.success("Konto utworzone. Witamy w portalu!");
      router.push("/portal");
      router.refresh();
    } catch {
      toast.error("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {errors.form && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Imię</Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            aria-invalid={!!errors.firstName}
            className="h-10"
            disabled={loading}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nazwisko</Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            aria-invalid={!!errors.lastName}
            className="h-10"
            disabled={loading}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pesel">PESEL</Label>
        <Input
          id="pesel"
          inputMode="numeric"
          autoComplete="off"
          placeholder="11 cyfr"
          maxLength={11}
          value={form.pesel}
          onChange={(e) =>
            setField("pesel", e.target.value.replace(/\D/g, "").slice(0, 11))
          }
          aria-invalid={!!errors.pesel}
          className="h-10"
          disabled={loading}
        />
        {errors.pesel && (
          <p className="text-sm text-destructive">{errors.pesel}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="jan.kowalski@email.pl"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          aria-invalid={!!errors.email}
          className="h-10"
          disabled={loading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+48 500 600 700"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
          aria-invalid={!!errors.phone}
          className="h-10"
          disabled={loading}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            aria-invalid={!!errors.password}
            className="h-10"
            disabled={loading}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Min. 8 znaków, litera i cyfra
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Powtórz hasło</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
            aria-invalid={!!errors.confirmPassword}
            className="h-10"
            disabled={loading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-blue-100 bg-secondary/50 p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="rodConsent"
            checked={form.rodConsent}
            onCheckedChange={(v) => setField("rodConsent", v === true)}
            disabled={loading}
            className="mt-0.5"
            aria-invalid={!!errors.rodConsent}
          />
          <Label
            htmlFor="rodConsent"
            className="text-sm font-normal leading-relaxed text-foreground"
          >
            Wyrażam zgodę na przetwarzanie moich danych osobowych (w tym PESEL)
            przez Centrum Medyczne Kiryluk &amp; Wenta w celu prowadzenia konta
            pacjenta i obsługi wizyt, zgodnie z RODO. *
          </Label>
        </div>
        {errors.rodConsent && (
          <p className="text-sm text-destructive">{errors.rodConsent}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full gap-2 bg-brand text-white hover:bg-brand-deep"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UserPlus className="size-4" />
        )}
        Utwórz konto
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Masz już konto?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand hover:text-brand-deep"
        >
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
