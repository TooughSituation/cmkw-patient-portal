"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  CalendarDays,
  Phone,
  Users,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDoctorVisits } from "@/hooks/use-doctor-visits";
import { useDoctorPatients } from "@/hooks/use-doctor-patients";
import { isPendingTeleconfirm } from "@/lib/doctor/visit-status";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type DashFilter = "none" | "today" | "confirm" | "in_progress";

export function DoctorDashboardInsights({
  activeFilter = "none",
  onFilter,
}: {
  activeFilter?: DashFilter;
  onFilter?: (f: DashFilter) => void;
}) {
  const { visits } = useDoctorVisits();
  const { patients } = useDoctorPatients();
  const today = format(new Date(), "yyyy-MM-dd");

  const todayVisits = visits.filter(
    (v) => v.date === today && v.status !== "cancelled"
  );
  const toConfirm = visits.filter((v) =>
    isPendingTeleconfirm(v.status, v.needsTeleconfirm)
  );
  const patientsWithVisits = new Set(visits.map((v) => v.patientId));
  const withoutVisit = patients.filter((p) => !patientsWithVisits.has(p.id));
  const inProgress = visits.filter((v) => v.status === "in_progress");

  const cards: Array<{
    filter: DashFilter | "patients";
    label: string;
    value: number;
    icon: typeof CalendarDays;
    tone: string;
    iconTone: string;
    href?: string;
  }> = [
    {
      filter: "today",
      label: "Dzisiejsze wizyty",
      value: todayVisits.length,
      icon: CalendarDays,
      tone: "bg-sky-50 text-sky-800 border-sky-100",
      iconTone: "bg-sky-100 text-sky-700",
    },
    {
      filter: "confirm",
      label: "Do potwierdzenia",
      value: toConfirm.length,
      icon: Phone,
      tone: "bg-violet-50 text-violet-900 border-violet-100",
      iconTone: "bg-violet-100 text-violet-700",
    },
    {
      filter: "patients",
      label: "Pacjenci bez wizyty",
      value: withoutVisit.length,
      icon: Users,
      tone: "bg-amber-50 text-amber-900 border-amber-100",
      iconTone: "bg-amber-100 text-amber-800",
      href: "/doctor/pacjenci",
    },
    {
      filter: "in_progress",
      label: "W trakcie",
      value: inProgress.length,
      icon: AlertCircle,
      tone: "bg-emerald-50 text-emerald-900 border-emerald-100",
      iconTone: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => {
        const active =
          c.filter !== "patients" && activeFilter === c.filter;
        const inner = (
          <Card
            className={cn(
              "border shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md",
              c.tone,
              active && "ring-2 ring-brand ring-offset-1"
            )}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  c.iconTone
                )}
              >
                <c.icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium opacity-80">{c.label}</p>
                <p className="text-2xl font-bold tabular-nums">{c.value}</p>
              </div>
              <ArrowRight className="size-4 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-80" />
            </CardContent>
          </Card>
        );

        if (c.href) {
          return (
            <Link key={c.label} href={c.href} className="group">
              {inner}
            </Link>
          );
        }

        return (
          <button
            key={c.label}
            type="button"
            className="group text-left"
            onClick={() =>
              onFilter?.(
                activeFilter === c.filter
                  ? "none"
                  : (c.filter as DashFilter)
              )
            }
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
