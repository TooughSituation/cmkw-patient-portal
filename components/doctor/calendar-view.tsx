"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { pl } from "date-fns/locale";
import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDoctorVisits } from "@/hooks/use-doctor-visits";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import { VisitStatusBadge } from "@/components/doctor/visit-status-badge";
import { PatientGroups } from "@/components/doctor/patient-groups";
import { VisitRowActions } from "@/components/doctor/visit-row-actions";
import { EmptyState } from "@/components/doctor/empty-state";
import { PatientNameLink } from "@/components/doctor/patient-name-link";
import { QuickVisitDialog } from "@/components/doctor/quick-visit-dialog";
import { TeleconfirmPanel } from "@/components/doctor/teleconfirm-panel";
import { VISIT_TYPE_LABELS } from "@/lib/doctor/types";
import {
  findSchedule,
  generateTimesForDay,
  getDayAvailability,
} from "@/lib/doctor/schedule-utils";
import { dayCellStatus } from "@/lib/doctor/slots";
import { ALL_BRANCHES_ID, branchLabel } from "@/lib/doctor/branches";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CalMode = "day" | "week" | "month";

const STATUS_DOT: Record<string, string> = {
  scheduled: "bg-emerald-500",
  confirmed: "bg-sky-500",
  teleconfirmed: "bg-violet-500",
  in_progress: "bg-amber-500",
  completed: "bg-slate-400",
  cancelled: "bg-red-400",
};

export function CalendarView() {
  const { byDate, loading, updateStatus, datesWithVisits, visits } =
    useDoctorVisits();
  const { staff, schedules, branchFilter } = useDoctorData();

  const [selected, setSelected] = useState<Date>(startOfDay(new Date()));
  const [mode, setMode] = useState<CalMode>("day");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [query, setQuery] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");

  const doctors = useMemo(
    () => staff.filter((s) => s.role === "doctor" && s.active),
    [staff]
  );

  const dateKey = format(selected, "yyyy-MM-dd");

  const dayVisits = useMemo(() => {
    let list = byDate(dateKey);
    if (doctorFilter !== "all") {
      list = list.filter((v) => v.doctorId === doctorFilter);
    }
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
  }, [byDate, dateKey, hideCompleted, query, doctorFilter]);

  /** Free slots for selected day (from schedules) for legend strip */
  const dayScheduleInfo = useMemo(() => {
    return doctors
      .filter(
        (d) => doctorFilter === "all" || d.doctorId === doctorFilter
      )
      .flatMap((d) => {
        const branchIds =
          branchFilter === ALL_BRANCHES_ID
            ? d.branchIds
            : d.branchIds.filter((b) => b === branchFilter);
        return branchIds.map((branchId) => {
          const sch = findSchedule(
            schedules,
            d.doctorId ?? d.id,
            branchId
          );
          const av = sch
            ? getDayAvailability(sch, dateKey)
            : ({ kind: "off" } as const);
          const free =
            av.kind === "open" || av.kind === "dyzur"
              ? generateTimesForDay(
                  av.startTime,
                  av.endTime,
                  av.slotMinutes
                ).filter(
                  (t) =>
                    !visits.some(
                      (v) =>
                        v.doctorId === (d.doctorId ?? d.id) &&
                        v.branchId === branchId &&
                        v.date === dateKey &&
                        v.time === t &&
                        v.status !== "cancelled"
                    )
                )
              : [];
          return {
            doctorId: d.doctorId ?? d.id,
            name: `${d.title} ${d.lastName}`,
            branchId,
            av,
            freeCount: free.length,
            freeSample: free.slice(0, 6),
          };
        });
      });
  }, [
    doctors,
    doctorFilter,
    branchFilter,
    schedules,
    dateKey,
    visits,
  ]);

  const daysWithDots = useMemo(() => {
    return Array.from(datesWithVisits).map((d) => parseISO(d));
  }, [datesWithVisits]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selected, { weekStartsOn: 1 });
    const end = endOfWeek(selected, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [selected]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(selected), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(selected), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [selected]);

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
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-brand-heading md:text-xl">
            Kalendarz
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(selected, "EEEE, d MMMM yyyy", { locale: pl })} ·{" "}
            {branchLabel(branchFilter)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
            {(["day", "week", "month"] as CalMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition",
                  mode === m
                    ? "bg-brand text-white"
                    : "text-slate-600 hover:bg-secondary"
                )}
              >
                {m === "day" ? "Dzień" : m === "week" ? "Tydzień" : "Miesiąc"}
              </button>
            ))}
          </div>
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="h-9 w-[180px] bg-white">
              <SelectValue placeholder="Lekarz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszyscy lekarze</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.doctorId ?? d.id}>
                  {d.title} {d.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {/* Legend */}
      <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
        <Legend color="bg-emerald-100 border-emerald-200" label="Dostępny (grafik)" />
        <Legend color="bg-sky-100 border-sky-200" label="Wizyta / zajęty" />
        <Legend color="bg-amber-100 border-amber-200" label="Urlop / wolne" />
        <Legend color="bg-slate-100 border-slate-200" label="Poza grafikami" />
      </div>

      {mode === "day" && (
        <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
          <Card className="h-fit border-slate-200 bg-white shadow-sm">
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
              <div className="mt-2 space-y-1 border-t border-slate-100 px-2 py-2">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Grafik na ten dzień
                </p>
                {dayScheduleInfo.slice(0, 8).map((info) => (
                  <div
                    key={`${info.doctorId}-${info.branchId}`}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="truncate font-medium">{info.name}</span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5",
                        info.av.kind === "open" || info.av.kind === "dyzur"
                          ? "bg-emerald-50 text-emerald-800"
                          : info.av.kind === "urlop" || info.av.kind === "wolne"
                            ? "bg-amber-50 text-amber-900"
                            : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {info.av.kind === "open" || info.av.kind === "dyzur"
                        ? `${info.freeCount} wolnych`
                        : info.av.kind === "urlop"
                          ? "urlop"
                          : info.av.kind === "wolne"
                            ? "wolne"
                            : "poza"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <DayVisitsTable
            dayVisits={dayVisits}
            hideCompleted={hideCompleted}
            setHideCompleted={setHideCompleted}
            query={query}
            setQuery={setQuery}
            updateStatus={updateStatus}
          />
        </div>
      )}

      {mode === "week" && (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
            <CardTitle className="text-base text-brand-heading">
              Tydzień {format(weekDays[0]!, "d MMM", { locale: pl })} –{" "}
              {format(weekDays[6]!, "d MMM yyyy", { locale: pl })}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setSelected(subWeeks(selected, 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setSelected(startOfDay(new Date()))}
              >
                Dziś
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setSelected(addWeeks(selected, 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <div className="grid min-w-[800px] grid-cols-7 divide-x">
              {weekDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                let list = byDate(key);
                if (doctorFilter !== "all") {
                  list = list.filter((v) => v.doctorId === doctorFilter);
                }
                return (
                  <div
                    key={key}
                    className={cn(
                      "min-h-[320px] p-2",
                      isSameDay(day, selected) && "bg-secondary/40"
                    )}
                  >
                    <button
                      type="button"
                      className="mb-2 w-full text-left"
                      onClick={() => {
                        setSelected(startOfDay(day));
                        setMode("day");
                      }}
                    >
                      <div className="text-xs font-medium text-muted-foreground">
                        {format(day, "EEE", { locale: pl })}
                      </div>
                      <div className="text-sm font-semibold text-brand-heading">
                        {format(day, "d MMM", { locale: pl })}
                      </div>
                    </button>
                    <div className="space-y-1">
                      {list.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground">
                          Brak wizyt
                        </p>
                      ) : (
                        list.map((v) => (
                          <Link
                            key={v.id}
                            href={`/doctor/wizyty/${v.id}`}
                            className={cn(
                              "block rounded border-l-2 bg-slate-50 px-1.5 py-1 text-[10px] hover:bg-secondary",
                              STATUS_DOT[v.status]
                                ? `border-l-[${v.status}]`
                                : "border-l-brand"
                            )}
                            style={{
                              borderLeftColor:
                                v.status === "cancelled"
                                  ? "#f87171"
                                  : v.status === "completed"
                                    ? "#94a3b8"
                                    : v.status === "in_progress"
                                      ? "#f59e0b"
                                      : v.status === "teleconfirmed"
                                        ? "#8b5cf6"
                                        : v.status === "confirmed"
                                          ? "#0ea5e9"
                                          : "#10b981",
                            }}
                          >
                            <div className="font-mono font-semibold">
                              {v.time}
                            </div>
                            <div className="truncate">
                              {v.patientLastName} {v.patientFirstName[0]}.
                            </div>
                            <div className="truncate text-muted-foreground">
                              {v.doctorName.split(" ").slice(-1)[0]}
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "month" && (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
            <CardTitle className="text-base text-brand-heading">
              {format(selected, "LLLL yyyy", { locale: pl })}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  setSelected(startOfDay(addDays(startOfMonth(selected), -1)))
                }
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setSelected(startOfDay(new Date()))}
              >
                Dziś
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  setSelected(startOfDay(addDays(endOfMonth(selected), 1)))
                }
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
              {["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                let list = byDate(key);
                if (doctorFilter !== "all") {
                  list = list.filter((v) => v.doctorId === doctorFilter);
                }
                // sample schedule status for first doctor or filter
                const sampleDoc =
                  doctorFilter !== "all"
                    ? doctors.find((d) => d.doctorId === doctorFilter)
                    : doctors[0];
                const branchId =
                  branchFilter !== ALL_BRANCHES_ID
                    ? branchFilter
                    : sampleDoc?.branchIds[0] ?? "bialystok";
                const sch = sampleDoc
                  ? findSchedule(
                      schedules,
                      sampleDoc.doctorId ?? sampleDoc.id,
                      branchId
                    )
                  : undefined;
                const cell = dayCellStatus(sch, key, list);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelected(startOfDay(day));
                      setMode("day");
                    }}
                    className={cn(
                      "min-h-[72px] rounded-lg border p-1 text-left transition hover:ring-2 hover:ring-brand/30",
                      !isSameMonth(day, selected) && "opacity-40",
                      isSameDay(day, selected) && "ring-2 ring-brand",
                      cell === "available" && "border-emerald-100 bg-emerald-50/50",
                      cell === "leave" && "border-amber-100 bg-amber-50/60",
                      cell === "outside" && "border-slate-100 bg-slate-50",
                      cell === "occupied" && "border-sky-100 bg-sky-50/50"
                    )}
                  >
                    <div className="text-xs font-semibold">
                      {format(day, "d")}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-0.5">
                      {list.slice(0, 3).map((v) => (
                        <span
                          key={v.id}
                          className={cn(
                            "size-1.5 rounded-full",
                            STATUS_DOT[v.status] ?? "bg-brand"
                          )}
                        />
                      ))}
                    </div>
                    {list.length > 0 ? (
                      <div className="mt-0.5 text-[9px] text-muted-foreground">
                        {list.length} wiz.
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-4">
        <TeleconfirmPanel />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5",
        color
      )}
    >
      {label}
    </span>
  );
}

function DayVisitsTable({
  dayVisits,
  hideCompleted,
  setHideCompleted,
  query,
  setQuery,
  updateStatus,
}: {
  dayVisits: ReturnType<typeof useDoctorVisits>["visits"];
  hideCompleted: boolean;
  setHideCompleted: (v: boolean) => void;
  query: string;
  setQuery: (v: string) => void;
  updateStatus: ReturnType<typeof useDoctorVisits>["updateStatus"];
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
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
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj wizyty…"
              className="h-8 bg-white text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {dayVisits.length === 0 ? (
          <EmptyState
            title="Brak elementów do wyświetlenia"
            description="Brak wizyt w wybranym dniu lub filtrach."
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
                    Grupy
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
  );
}
