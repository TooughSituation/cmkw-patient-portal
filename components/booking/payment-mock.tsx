"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  clearBookingDraft,
  loadBookingDraft,
  appendLocalAppointment,
  type BookingDraft,
} from "@/lib/booking/draft";
import { formatPricePln } from "@/lib/booking/services";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PaymentMock() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const d = loadBookingDraft();
    setDraft(d);
    setReady(true);
    if (!d) {
      toast.error("Brak danych rezerwacji. Zacznij od nowa.");
      router.replace("/portal/umow-wizyte");
    }
  }, [router]);

  async function simulatePayment() {
    if (!draft) return;
    setLoading(true);
    try {
      // Symulacja opóźnienia bramki płatności
      await new Promise((r) => setTimeout(r, 900));

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: draft.doctorId,
          serviceId: draft.serviceId,
          date: draft.date,
          time: draft.time,
          note: draft.note,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        appointment?: unknown;
      };

      if (!res.ok) {
        toast.error(data.error ?? "Płatność nie powiodła się.");
        return;
      }

      if (data.appointment) {
        appendLocalAppointment(data.appointment);
      }
      clearBookingDraft();
      toast.success("Płatność przyjęta. Wizyta potwierdzona!");
      router.push("/portal/umow-wizyte/sukces");
      router.refresh();
    } catch {
      toast.error("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready || !draft) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Ładowanie płatności…
      </p>
    );
  }

  return (
    <div
      className="mx-auto max-w-lg space-y-6"
      data-tour="patient-payment"
    >
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
            <CreditCard className="size-6" />
          </div>
          <CardTitle className="text-brand-heading">
            Płatność online (mock)
          </CardTitle>
          <CardDescription>
            To jest symulacja bramki płatności — żadne środki nie są
            pobierane.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2 rounded-lg bg-muted/50 p-4">
            <Row label="Usługa" value={draft.serviceName} />
            <Row label="Lekarz" value={draft.doctorName} />
            <Row
              label="Termin"
              value={`${format(parseISO(draft.date), "d MMMM yyyy", { locale: pl })} · ${draft.time}`}
            />
            <Row
              label="Pacjent"
              value={`${draft.patientFirstName} ${draft.patientLastName}`}
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-muted-foreground">Kwota</span>
            <span className="text-2xl font-bold text-brand">
              {formatPricePln(draft.pricePln)}
            </span>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-secondary/50 p-3 text-xs text-brand-deep">
            <Lock className="mt-0.5 size-3.5 shrink-0" />
            <p>
              Po kliknięciu „Symuluj płatność” rezerwacja zostanie zapisana w
              portalu jako potwierdzona.
            </p>
          </div>

          <Button
            type="button"
            disabled={loading}
            onClick={simulatePayment}
            className="h-11 w-full gap-2 bg-brand text-white hover:bg-brand-deep"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            Symuluj płatność
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => router.push("/portal/umow-wizyte")}
            className="w-full text-muted-foreground"
          >
            Anuluj i wróć do rezerwacji
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
