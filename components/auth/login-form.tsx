"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validations/auth";
import {
  defaultHomeForRole,
  isDoctorPortalRole,
  isPatientRole,
} from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

export function LoginForm({
  variant = "patient",
  defaultEmail = "",
  className,
}: {
  /** patient = tylko pacjenci; doctor = tylko personel */
  variant?: "patient" | "doctor";
  defaultEmail?: string;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isDoctorVariant = variant === "doctor";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Nieprawidłowy e-mail lub hasło.");
        setErrors({ form: "Nieprawidłowy e-mail lub hasło." });
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;

      if (isDoctorVariant && !isDoctorPortalRole(role)) {
        toast.error("To konto nie ma dostępu do Portalu Lekarza.");
        setErrors({
          form: "Użyj logowania pacjenta lub innego konta personelu.",
        });
        await signOut({ redirect: false });
        return;
      }

      if (!isDoctorVariant && isDoctorPortalRole(role)) {
        toast.message("Konto personelu — przekierowanie do EDM…");
        router.push("/doctor");
        router.refresh();
        return;
      }

      if (!isDoctorVariant && !isPatientRole(role) && role) {
        // unexpected
      }

      const roleHome = defaultHomeForRole(role);
      let target = roleHome;
      if (callbackUrl) {
        const isDoctorCb = callbackUrl.startsWith("/doctor");
        const isPortalCb = callbackUrl.startsWith("/portal");
        if (roleHome === "/doctor" && isDoctorCb) target = callbackUrl;
        else if (roleHome === "/portal" && isPortalCb) target = callbackUrl;
        else if (!isDoctorCb && !isPortalCb) target = callbackUrl;
        else target = roleHome;
      }

      toast.success("Zalogowano pomyślnie.");
      router.push(target);
      router.refresh();
    } catch {
      toast.error("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("space-y-4", className)}
      noValidate
    >
      {errors.form && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={
            isDoctorVariant
              ? "jan.kiryluk@cmkw.pl"
              : "jan.kowalski@email.pl"
          }
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          className="h-10"
          disabled={loading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password}
          className="h-10"
          disabled={loading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "h-11 w-full gap-2 text-white",
          isDoctorVariant
            ? "bg-brand-deep hover:bg-brand"
            : "bg-brand hover:bg-brand-deep"
        )}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogIn className="size-4" />
        )}
        {isDoctorVariant ? "Zaloguj do EDM" : "Zaloguj się"}
      </Button>

      {!isDoctorVariant ? (
        <p className="text-center text-sm text-muted-foreground">
          Nie masz konta?{" "}
          <Link
            href="/rejestracja"
            className="font-semibold text-brand hover:text-brand-deep"
          >
            Zarejestruj się
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Jesteś pacjentem?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand hover:text-brand-deep"
          >
            Portal Pacjenta
          </Link>
        </p>
      )}
    </form>
  );
}
