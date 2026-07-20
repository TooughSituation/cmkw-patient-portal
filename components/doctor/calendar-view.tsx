"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { pl } from "date-fns/locale";
import { format, parseISO, startOfDay } from "date-fns";
import {
  Loader2,
  Plus,
  Search,
  UserPlus,
  CalendarCheck,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDoctorVisits } from "@/hooks/use-doctor-visits";
import { VisitStatusBadge } from "@/components/doctor/visit-status-badge";
import { PatientGroups } from "@/components/doctor/patient-groups";
import { VisitRowActions } from "@/components/doctor/visit-row-actions";
import { EmptyState } from "@/components/doctor/empty-state";
import { PatientNameLink } from "@/components/doctor/patient-name-link";
import { QuickVisitDialog } from "@/components/doctor/quick-visit-dialog";
import { TeleconfirmPanel } from "@/components/doctor/teleconfirm-panel";
import { VISIT_TYPE_LABELS } from "@/lib/doctor/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CalendarView() {
  const { byDate, loading, updateStatus, datesWithVisits } =
    useDoctorVisits();
  const [selected, setSelected] = useState<Date>(startOfDay(new Date()));
  const [hideCompleted, setHideCompleted] = useState(false);
  const [query, setQuery] = useState("");

  const dateKey = format(selected, "yyyy-MM-dd");

  const dayVisits = useMemo(() => {
    let list = byDate(dateKey);
    if (hideCompleted) {
      list = list.filter((v) => v.status !== "completed");
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (v) =>
          `${v.patientFirstName} ${v.patientLastName}`
            .toLowerCase()
            .includes(q) ||
          v.note.toLowerCase().includes(q) ||
          v.time.includes(q) ||
          v.doctorName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [byDate, dateKey, hideCompleted, query]);

  const daysWithDots = useMemo(() => {
    return Array.from(datesWithVisits).map((d) => parseISO(d));
  }, [datesWithVisits]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        <span className="text-sm">Ładowanie kalendarza…</span>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-5">
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
            Kalendarz
          </h1>
          <p className="text-sm text-slate-500">
            {format(selected, "EEEE, d MMMM yyyy", { locale: pl })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <QuickVisitDialog
            defaultDate={dateKey}
            trigger={
              <Button className="h-9 gap-1.5 bg-brand text-white hover:bg-brand-deep">
                <Plus className="size-4" />
                Szybka wizyta
              </Button>
            }
          />
          <Button
            asChild
            className="h-9 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Link href="/doctor/pacjenci/nowy">
              <UserPlus className="size-4" />
              Dodaj pacjenta
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-9 gap-1.5 border-slate-300 bg-white"
            onClick={() =>
              toast.success("Dzień zakończony (symulacja)", {
                description: format(selected, "d.MM.yyyy"),
              })
            }
          >
            <CalendarCheck className="size-4" />
            Zakończ dzień
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
        {/* Mini calendar */}
        <Card className="h-fit border-slate-200 bg-white shadow-sm ring-slate-200">
          <CardContent className="p-2 pt-3">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(d) => d && setSelected(startOfDay(d))}
              locale={pl}
              modifiers={{ hasVisit: daysWithDots }}
              modifiersClassNames={{
                hasVisit:
                  "after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-brand",
              }}
              className="w-full [--cell-size:2.25rem]"
            />
            <div className="mt-2 border-t border-slate-100 px-2 py-2 text-[11px] text-slate-500">
              Niebieska kropka = dzień z wizytami
            </div>
          </CardContent>
        </Card>

        {/* Day table */}
        <Card className="border-slate-200 bg-white shadow-sm ring-slate-200">
          <CardHeader className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold text-slate-800">
              Wizyty dnia · {dayVisits.length}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  className="size-3.5 rounded border-slate-300 accent-[var(--brand)]"
                  checked={hideCompleted}
                  onChange={(e) => setHideCompleted(e.target.checked)}
                />
                Ukryj zakończone
              </label>
              <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Szukaj wizyty…"
                  className="h-8 bg-white pl-8 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {dayVisits.length === 0 ? (
              <EmptyState
                title="Brak elementów do wyświetlenia"
                description="Brak wizyt w wybranym dniu lub filtrach. Wybierz inną datę albo wyczyść wyszukiwanie."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="w-[72px] font-semibold">
                        Godzina
                      </TableHead>
                      <TableHead className="font-semibold">Pacjent</TableHead>
                      <TableHead className="hidden font-semibold md:table-cell">
                        Grupy pacjenta
                      </TableHead>
                      <TableHead className="font-semibold">Stan</TableHead>
                      <TableHead className="hidden font-semibold lg:table-cell">
                        Typ
                      </TableHead>
                      <TableHead className="hidden font-semibold xl:table-cell">
                        Notatka
                      </TableHead>
                      <TableHead className="w-[100px] text-right font-semibold">
                        Akcje
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dayVisits.map((v) => (
                      <TableRow
                        key={v.id}
                        className={cn(
                          v.status === "cancelled" && "opacity-60",
                          v.status === "completed" && "bg-slate-50/50"
                        )}
                      >
                        <TableCell className="font-mono text-sm font-semibold">
                          <Link
                            href={`/doctor/wizyty/${v.id}`}
                            className="text-brand hover:underline"
                          >
                            {v.time}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <PatientNameLink
                            patientId={v.patientId}
                            firstName={v.patientFirstName}
                            lastName={v.patientLastName}
                            showDoctorHint
                            doctorName={v.doctorName}
                          />
                          <div className="text-xs text-slate-500 md:hidden">
                            {VISIT_TYPE_LABELS[v.type]}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <PatientGroups groups={v.patientGroups} />
                        </TableCell>
                        <TableCell>
                          <VisitStatusBadge status={v.status} />
                        </TableCell>
                        <TableCell className="hidden text-sm text-slate-600 lg:table-cell">
                          {VISIT_TYPE_LABELS[v.type]}
                        </TableCell>
                        <TableCell className="hidden max-w-[220px] truncate text-sm text-slate-500 xl:table-cell">
                          {v.note || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <VisitRowActions
                            visit={v}
                            onStatusChange={updateStatus}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <TeleconfirmPanel />
      </div>
    </div>
  );
}
