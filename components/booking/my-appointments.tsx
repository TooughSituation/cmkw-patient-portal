"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarPlus, Loader2 } from "lucide-react";
import type { Appointment } from "@/lib/booking/appointments-store";
import {
  loadLocalAppointments,
  APPOINTMENTS_LS_KEY,
} from "@/lib/booking/draft";
import { formatPricePln } from "@/lib/booking/services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function mergeAppointments(
  server: Appointment[],
  local: Appointment[]
): Appointment[] {
  const map = new Map<string, Appointment>();
  for (const a of local) map.set(a.id, a);
  for (const a of server) map.set(a.id, a);
  return Array.from(map.values()).sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
  );
}

const statusLabel: Record<Appointment["status"], string> = {
  confirmed: "Potwierdzona",
  pending_payment: "Oczekuje na płatność",
  cancelled: "Anulowana",
};

export function MyAppointments() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const local = loadLocalAppointments<Appointment>();
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = (await res.json()) as { appointments: Appointment[] };
        const merged = mergeAppointments(data.appointments, local);
        setItems(merged);
        // sync local with server
        try {
          localStorage.setItem(APPOINTMENTS_LS_KEY, JSON.stringify(merged));
        } catch {
          /* ignore */
        }
      } else {
        setItems(local);
      }
    } catch {
      setItems(local);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upcoming = items.filter((a) => a.status !== "cancelled");

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="text-brand-heading">Moje wizyty</CardTitle>
          <CardDescription>
            Zaplanowane i potwierdzone rezerwacje
          </CardDescription>
        </div>
        <Button
          asChild
          className="gap-2 bg-brand text-white hover:bg-brand-deep"
        >
          <Link href="/portal/umow-wizyte">
            <CalendarPlus className="size-4" />
            Umów wizytę
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Ładowanie wizyt…
          </div>
        ) : upcoming.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-muted/30 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nie masz jeszcze zaplanowanych wizyt.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 border-brand/30 text-brand"
            >
              <Link href="/portal/umow-wizyte">Umów pierwszą wizytę</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-brand-heading">
                    {a.serviceName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.doctorName}
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {format(parseISO(a.date), "d MMMM yyyy", { locale: pl })}{" "}
                    · {a.time}
                  </p>
                  {a.note ? (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      Notatka: {a.note}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <Badge
                    className={cn(
                      a.status === "confirmed" &&
                        "bg-emerald-50 text-emerald-800 hover:bg-emerald-50",
                      a.status === "pending_payment" &&
                        "bg-amber-50 text-amber-800",
                      a.status === "cancelled" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {statusLabel[a.status]}
                  </Badge>
                  <span className="text-sm font-semibold text-brand">
                    {formatPricePln(a.pricePln)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
