"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { MessageSquare, Phone, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDoctorVisits } from "@/hooks/use-doctor-visits";
import { isPendingTeleconfirm } from "@/lib/doctor/visit-status";
import { EmptyState } from "@/components/doctor/empty-state";
import { VisitStatusBadge } from "@/components/doctor/visit-status-badge";

export function TeleconfirmPanel() {
  const { visits, updateStatus, updateVisit } = useDoctorVisits();

  const pending = visits
    .filter((v) => isPendingTeleconfirm(v.status, v.needsTeleconfirm))
    .sort((a, b) =>
      `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
    )
    .slice(0, 12);

  return (
    <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-brand-heading">
          <Phone className="size-4 text-brand" />
          Telepotwierdzenia
          {pending.length > 0 ? (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">
              {pending.length}
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {pending.length === 0 ? (
          <EmptyState
            title="Brak wizyt do potwierdzenia"
            description="Wizyty oznaczone jako wymagające kontaktu pojawią się tutaj."
            className="py-10"
          />
        ) : (
          <ul className="divide-y">
            {pending.map((v) => (
              <li
                key={v.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/doctor/wizyty/${v.id}`}
                    className="font-medium text-brand hover:underline"
                  >
                    {v.patientFirstName} {v.patientLastName}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(v.date), "d MMM yyyy", { locale: pl })} ·{" "}
                    {v.time} · {v.doctorName}
                  </p>
                  <div className="mt-1">
                    <VisitStatusBadge status={v.status} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    className="h-8 gap-1 bg-brand text-white hover:bg-brand-deep"
                    onClick={() => {
                      updateStatus(v.id, "teleconfirmed");
                      updateVisit(v.id, { needsTeleconfirm: false });
                      toast.success("Telepotwierdzono", {
                        description: `${v.patientLastName} ${v.patientFirstName}`,
                      });
                    }}
                  >
                    <CheckCircle2 className="size-3.5" />
                    Potwierdź
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-destructive"
                    onClick={() => {
                      updateStatus(v.id, "cancelled");
                      updateVisit(v.id, { needsTeleconfirm: false });
                      toast.message("Wizyta odwołana");
                    }}
                  >
                    <XCircle className="size-3.5" />
                    Odwołaj
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1"
                    onClick={() =>
                      toast.success("SMS wysłany (mock)", {
                        description: `Przypomnienie: ${v.date} ${v.time}`,
                      })
                    }
                  >
                    <MessageSquare className="size-3.5" />
                    SMS
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
