"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { pl } from "date-fns/locale";
import {
  addDays,
  addMonths,
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
  subMonths,
  subWeeks,
} from "date-fns";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDoctorVisits } from "@/hooks/use-doctor-visits";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import { EmptyState } from "@/components/doctor/empty-state";
import { QuickVisitDialog } from "@/components/doctor/quick-visit-dialog";
import { TeleconfirmPanel } from "@/components/doctor/teleconfirm-panel";
import { DoctorDashboardInsights } from "@/components/doctor/doctor-dashboard-insights";
import { DayTimeline } from "@/components/doctor/calendar/day-timeline";
import { WeekTimeline } from "@/components/doctor/calendar/week-timeline";
import { KeyboardCheatsheet } from "@/components/doctor/calendar/keyboard-cheatsheet";
import { useCalendarKeyboard } from "@/hooks/use-calendar-keyboard";
import {
  CAL_DOCTOR_FILTER_KEY,
  CAL_MODE_STORAGE_KEY,
  parseSlotDropId,
  type CalMode,
} from "@/lib/doctor/calendar-constants";
import {
  findSchedule,
  generateTimesForDay,
  getDayAvailability,
} from "@/lib/doctor/schedule-utils";
import { dayCellStatus } from "@/lib/doctor/slots";
import { ALL_BRANCHES_ID, branchLabel } from "@/lib/doctor/branches";
import {
  emptyVisitClinical,
  type DoctorVisit,
  type VisitStatus,
} from "@/lib/doctor/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_DOT: Record<string, string> = {
  scheduled: "bg-emerald-500",
  confirmed: "bg-sky-500",
  teleconfirmed: "bg-violet-500",
  in_progress: "bg-amber-500",
  completed: "bg-slate-400",
  cancelled: "bg-red-400",
};

export function CalendarView() {
  const {
    byDate,
    loading,
    updateStatus,
    datesWithVisits,
    updateVisit,
    addVisit,
  } = useDoctorVisits();
  const {
    schedules,
    branchFilter,
    validateVisitSlot,
    allStaffDoctors,
    seesAllDoctors,
    canEditVisit,
    viewAsDoctorId,
    setViewAsDoctorId,
    sharedPreviewDoctorId,
  } = useDoctorData();

  const [selected, setSelected] = useState<Date>(startOfDay(new Date()));
  const [mode, setMode] = useState<CalMode>("day");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [query, setQuery] = useState("");
  /** Tylko facility: dodatkowy filtr w toolbarze (synch z viewAs) */
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [dashFilter, setDashFilter] = useState<
    "none" | "today" | "confirm" | "in_progress"
  >("none");
  const [helpOpen, setHelpOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [activeDrag, setActiveDrag] = useState<DoctorVisit | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    visit: DoctorVisit;
    date: string;
    time: string;
  } | null>(null);
  const [moving, setMoving] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const m = localStorage.getItem(CAL_MODE_STORAGE_KEY) as CalMode | null;
      if (m === "day" || m === "week" || m === "month") setMode(m);
      if (seesAllDoctors) {
        const d = localStorage.getItem(CAL_DOCTOR_FILTER_KEY);
        if (d) setDoctorFilter(d);
      }
    } catch {
      // ignore
    }
  }, [seesAllDoctors]);

  // Facility: synchronizuj filtr kalendarza z globalnym viewAs
  useEffect(() => {
    if (!seesAllDoctors) {
      setDoctorFilter("all");
      return;
    }
    setDoctorFilter(viewAsDoctorId ?? "all");
  }, [seesAllDoctors, viewAsDoctorId]);

  const setModePersist = useCallback((m: CalMode) => {
    setMode(m);
    try {
      localStorage.setItem(CAL_MODE_STORAGE_KEY, m);
    } catch {
      // ignore
    }
  }, []);

  const setDoctorPersist = useCallback(
    (id: string) => {
      if (!seesAllDoctors) return;
      setDoctorFilter(id);
      setViewAsDoctorId(id === "all" ? null : id);
      try {
        localStorage.setItem(CAL_DOCTOR_FILTER_KEY, id);
      } catch {
        // ignore
      }
    },
    [seesAllDoctors, setViewAsDoctorId]
  );

  /** Multi-lekarz UI tylko dla placówki */
  const showDoctorFilter = seesAllDoctors;
  const doctors = allStaffDoctors;

  const dateKey = format(selected, "yyyy-MM-dd");

  const filterVisits = useCallback(
    (list: DoctorVisit[]) => {
      let out = list;
      // Provider już filtruje po widoczności; facility może dodatkowo zawęzić (zsynchronizowane z viewAs)
      if (seesAllDoctors && doctorFilter !== "all") {
        out = out.filter((v) => v.doctorId === doctorFilter);
      }
      if (hideCompleted) {
        out = out.filter((v) => v.status !== "completed");
      }
      if (dashFilter === "confirm") {
        out = out.filter(
          (v) =>
            v.needsTeleconfirm &&
            (v.status === "scheduled" || v.status === "confirmed")
        );
      }
      if (dashFilter === "in_progress") {
        out = out.filter((v) => v.status === "in_progress");
      }
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        out = out.filter(
          (v) =>
            `${v.patientFirstName} ${v.patientLastName}`
              .toLowerCase()
              .includes(q) ||
            v.note.toLowerCase().includes(q) ||
            v.time.includes(q) ||
            v.doctorName.toLowerCase().includes(q)
        );
      }
      return out;
    },
    [doctorFilter, hideCompleted, dashFilter, query, seesAllDoctors]
  );

  const dayVisits = useMemo(() => {
    return filterVisits(byDate(dateKey));
  }, [byDate, dateKey, filterVisits]);

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

  /** Allowed drop times for current drag */
  const allowedForDrag = useMemo(() => {
    if (!activeDrag) return null;
    const sch = findSchedule(
      schedules,
      activeDrag.doctorId,
      activeDrag.branchId
    );
    if (!sch) return { times: new Set<string>(), keys: new Set<string>() };

    const times = new Set<string>();
    const keys = new Set<string>();

    const dates =
      mode === "week"
        ? weekDays.map((d) => format(d, "yyyy-MM-dd"))
        : [dateKey];

    for (const date of dates) {
      const av = getDayAvailability(sch, date);
      if (av.kind !== "open" && av.kind !== "dyzur") continue;
      for (const t of generateTimesForDay(
        av.startTime,
        av.endTime,
        av.slotMinutes
      )) {
        const check = validateVisitSlot({
          doctorId: activeDrag.doctorId,
          branchId: activeDrag.branchId,
          date,
          time: t,
          excludeVisitId: activeDrag.id,
        });
        if (check.ok) {
          times.add(t);
          keys.add(`${date}|${t}`);
        }
      }
    }
    return { times, keys };
  }, [
    activeDrag,
    schedules,
    validateVisitSlot,
    mode,
    weekDays,
    dateKey,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragStart(e: DragStartEvent) {
    const visit = e.active.data.current?.visit as DoctorVisit | undefined;
    if (visit) setActiveDrag(visit);
  }

  function handleDragEnd(e: DragEndEvent) {
    const visit = e.active.data.current?.visit as DoctorVisit | undefined;
    setActiveDrag(null);
    if (!visit || !e.over) return;

    if (visit.status === "completed" || visit.status === "cancelled") {
      toast.error("Nie można przenieść wizyty zakończonej lub odwołanej.");
      return;
    }

    if (!canEditVisit(visit)) {
      toast.error("Brak uprawnień do edycji tej wizyty (tylko podgląd).");
      return;
    }

    const parsed = parseSlotDropId(String(e.over.id));
    if (!parsed) return;

    if (parsed.date === visit.date && parsed.time === visit.time) return;

    const check = validateVisitSlot({
      doctorId: visit.doctorId,
      branchId: visit.branchId,
      date: parsed.date,
      time: parsed.time,
      excludeVisitId: visit.id,
    });

    if (!check.ok) {
      toast.error(check.reason ?? "Niedozwolony slot");
      return;
    }

    setPendingMove({ visit, date: parsed.date, time: parsed.time });
  }

  function confirmMove() {
    if (!pendingMove) return;
    if (!canEditVisit(pendingMove.visit)) {
      toast.error("Brak uprawnień do edycji tej wizyty.");
      setPendingMove(null);
      return;
    }
    setMoving(true);
    const { visit, date, time } = pendingMove;
    const updated = updateVisit(visit.id, { date, time });
    setPendingMove(null);
    setMoving(false);
    if (!updated) {
      toast.error("Nie udało się przenieść wizyty.");
      return;
    }
    toast.success("Wizyta przeniesiona", {
      description: `${date} ${time} · ${visit.patientLastName}`,
    });
  }

  function handleStatus(id: string, status: VisitStatus) {
    const ok = updateStatus(id, status);
    if (!ok) {
      toast.error("Brak uprawnień do zmiany statusu tej wizyty.");
    }
  }

  function handleDuplicate(visit: DoctorVisit) {
    const now = new Date().toISOString();
    const clinical = emptyVisitClinical();
    try {
      const copy: DoctorVisit = {
        ...clinical,
        ...visit,
        id: `v-${crypto.randomUUID().slice(0, 8)}`,
        status: "scheduled",
        note: visit.note ? `${visit.note} (kopia)` : "Kopia wizyty",
        medicalNote: visit.medicalNote,
        diagnoses: [...(visit.diagnoses ?? [])],
        prescriptions: [...(visit.prescriptions ?? [])],
        referrals: [...(visit.referrals ?? [])],
        documentIds: [],
        needsTeleconfirm: true,
        createdAt: now,
        updatedAt: now,
      };
      // try +15 min
      const [h, m] = visit.time.split(":").map(Number);
      const mins = (h ?? 0) * 60 + (m ?? 0) + 15;
      const nh = String(Math.floor(mins / 60)).padStart(2, "0");
      const nm = String(mins % 60).padStart(2, "0");
      copy.time = `${nh}:${nm}`;
      addVisit(copy);
      toast.success("Zduplikowano wizytę", {
        description: `${copy.date} ${copy.time}`,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Nie udało się zduplikować"
      );
    }
  }

  const goToday = useCallback(() => {
    setSelected(startOfDay(new Date()));
    setDashFilter("today");
  }, []);

  const goPrev = useCallback(() => {
    if (mode === "month") setSelected((d) => startOfDay(subMonths(d, 1)));
    else if (mode === "week") setSelected((d) => startOfDay(subWeeks(d, 1)));
    else setSelected((d) => startOfDay(addDays(d, -1)));
  }, [mode]);

  const goNext = useCallback(() => {
    if (mode === "month") setSelected((d) => startOfDay(addMonths(d, 1)));
    else if (mode === "week") setSelected((d) => startOfDay(addWeeks(d, 1)));
    else setSelected((d) => startOfDay(addDays(d, 1)));
  }, [mode]);

  const onEscape = useCallback(() => {
    if (pendingMove) setPendingMove(null);
    else if (helpOpen) setHelpOpen(false);
    else if (quickOpen) setQuickOpen(false);
  }, [pendingMove, helpOpen, quickOpen]);

  useCalendarKeyboard({
    mode,
    onModeChange: setModePersist,
    onToday: goToday,
    onPrev: goPrev,
    onNext: goNext,
    onQuickVisit: () => setQuickOpen(true),
    onFocusSearch: () => searchRef.current?.focus(),
    onToggleHelp: () => setHelpOpen((v) => !v),
    onEscape,
  });

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-slate-200/70"
            />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">Ładowanie kalendarza…</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="p-3 md:p-4 lg:p-5">
        <DoctorDashboardInsights
          activeFilter={dashFilter}
          onFilter={(f) => {
            setDashFilter(f);
            if (f === "today") {
              setSelected(startOfDay(new Date()));
              setModePersist("day");
            }
            if (f === "confirm" || f === "in_progress") {
              setModePersist("day");
            }
          }}
        />

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-brand-heading md:text-xl">
              Kalendarz
              {!seesAllDoctors && !sharedPreviewDoctorId ? (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  · mój grafik
                </span>
              ) : null}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(selected, "EEEE, d MMMM yyyy", { locale: pl })} ·{" "}
              {branchLabel(branchFilter)}
              {dashFilter !== "none" ? (
                <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-brand">
                  filtr:{" "}
                  {dashFilter === "today"
                    ? "dziś"
                    : dashFilter === "confirm"
                      ? "do potwierdzenia"
                      : "w trakcie"}
                  <button
                    type="button"
                    className="ml-1 underline"
                    onClick={() => setDashFilter("none")}
                  >
                    wyczyść
                  </button>
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
              {(["day", "week", "month"] as CalMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModePersist(m)}
                  className={cn(
                    "rounded-md px-3.5 py-2 text-xs font-semibold transition",
                    mode === m
                      ? "bg-brand text-white shadow-sm"
                      : "text-slate-600 hover:bg-secondary"
                  )}
                >
                  {m === "day" ? "Dzień" : m === "week" ? "Tydzień" : "Miesiąc"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="outline" size="icon-sm" onClick={goPrev}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={goToday}
              >
                Dziś
              </Button>
              <Button variant="outline" size="icon-sm" onClick={goNext}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
            {showDoctorFilter ? (
              <Select value={doctorFilter} onValueChange={setDoctorPersist}>
                <SelectTrigger className="h-9 w-[180px] bg-white shadow-sm">
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
            ) : null}
            {sharedPreviewDoctorId ? (
              <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-800">
                Podgląd udostępnionego kalendarza
              </span>
            ) : null}
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj (F)…"
              className="h-9 w-[150px] bg-white shadow-sm"
            />
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => setHelpOpen(true)}
              title="Skróty (?)"
            >
              <HelpCircle className="size-4" />
            </Button>
            <QuickVisitDialog
              open={quickOpen}
              onOpenChange={setQuickOpen}
              defaultDate={dateKey}
              trigger={
                <Button
                  className="h-10 gap-2 bg-brand px-5 text-sm font-semibold text-white shadow-md hover:bg-brand-deep"
                  onClick={() => setQuickOpen(true)}
                >
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
                Pacjent
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-9 gap-1.5 bg-white"
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

        <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
          <Legend color="bg-emerald-100 border-emerald-200" label="Dostępny" />
          <Legend color="bg-sky-100 border-sky-200" label="Wizyta / zajęty" />
          <Legend color="bg-amber-100 border-amber-200" label="Urlop / wolne" />
          <Legend color="bg-slate-100 border-slate-200" label="Poza grafikami" />
          <Legend color="bg-violet-100 border-violet-200" label="Telepotwierdzone" />
          <span className="text-muted-foreground">
            Przeciągnij wizytę · PPM · 2× klik · skróty ?
          </span>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDrag(null)}
        >
          {mode === "day" && (
            <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
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
                    className="w-full [--cell-size:2.2rem]"
                  />
                  <label className="mt-2 flex cursor-pointer items-center gap-2 border-t px-2 py-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      className="accent-[var(--brand)]"
                      checked={hideCompleted}
                      onChange={(e) => setHideCompleted(e.target.checked)}
                    />
                    Ukryj zakończone
                  </label>
                </CardContent>
              </Card>

              <div>
                <Card className="mb-2 border-slate-200 bg-white shadow-sm">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm text-brand-heading">
                      Oś czasu · sloty 15 min · {dayVisits.length} wizyt
                    </CardTitle>
                  </CardHeader>
                </Card>
                {dayVisits.length === 0 && !activeDrag ? (
                  <Card className="border-slate-200 bg-white">
                    <EmptyState
                      title="Brak wizyt w tym dniu"
                      description="Przeciągnij wizytę z innego dnia w widoku tygodnia albo dodaj szybką wizytę (N)."
                      actionHref="/doctor/terminy"
                      actionLabel="Szukaj terminów"
                    />
                  </Card>
                ) : null}
                <DayTimeline
                  date={dateKey}
                  visits={dayVisits}
                  allowedTimes={allowedForDrag?.times}
                  dragVisitId={activeDrag?.id}
                  onStatusChange={handleStatus}
                  onDuplicate={handleDuplicate}
                />
              </div>
            </div>
          )}

          {mode === "week" && (
            <WeekTimeline
              days={weekDays}
              visitsByDate={(d) => filterVisits(byDate(d))}
              selected={selected}
              onSelectDay={(d) => {
                setSelected(startOfDay(d));
                setModePersist("day");
              }}
              dragVisitId={activeDrag?.id}
              allowedDropKeys={allowedForDrag?.keys}
              onStatusChange={handleStatus}
              onDuplicate={handleDuplicate}
            />
          )}

          {mode === "month" && (
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
                <CardTitle className="text-base text-brand-heading">
                  {format(selected, "LLLL yyyy", { locale: pl })}
                </CardTitle>
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
                    const list = filterVisits(byDate(key));
                    const sampleDoc =
                      doctorFilter !== "all"
                        ? doctors.find((d) => d.doctorId === doctorFilter)
                        : doctors[0];
                    const bId =
                      branchFilter !== ALL_BRANCHES_ID
                        ? branchFilter
                        : sampleDoc?.branchIds[0] ?? "bialystok";
                    const sch = sampleDoc
                      ? findSchedule(
                          schedules,
                          sampleDoc.doctorId ?? sampleDoc.id,
                          bId
                        )
                      : undefined;
                    const cell = dayCellStatus(sch, key, list);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelected(startOfDay(day));
                          setModePersist("day");
                        }}
                        className={cn(
                          "min-h-[76px] rounded-lg border p-1.5 text-left transition hover:ring-2 hover:ring-brand/30",
                          !isSameMonth(day, selected) && "opacity-40",
                          isSameDay(day, selected) && "ring-2 ring-brand",
                          cell === "available" &&
                            "border-emerald-100 bg-emerald-50/50",
                          cell === "leave" && "border-amber-100 bg-amber-50/60",
                          cell === "outside" && "border-slate-100 bg-slate-50",
                          cell === "occupied" && "border-sky-100 bg-sky-50/50"
                        )}
                      >
                        <div className="text-xs font-semibold">
                          {format(day, "d")}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-0.5">
                          {list.slice(0, 4).map((v) => (
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
                          <div className="mt-0.5 text-[9px] font-medium text-muted-foreground">
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

          <DragOverlay dropAnimation={null}>
            {activeDrag ? (
              <div className="w-44 rounded-md border border-brand bg-white px-2 py-1.5 text-xs shadow-xl ring-2 ring-brand/30">
                <div className="font-mono font-bold">{activeDrag.time}</div>
                <div className="font-medium">
                  {activeDrag.patientLastName} {activeDrag.patientFirstName}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="mt-4">
          <TeleconfirmPanel />
        </div>

        <KeyboardCheatsheet open={helpOpen} onOpenChange={setHelpOpen} />

        <Dialog
          open={!!pendingMove}
          onOpenChange={(o) => !o && setPendingMove(null)}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-brand-heading">
                Przenieść wizytę?
              </DialogTitle>
              <DialogDescription>
                {pendingMove ? (
                  <>
                    {pendingMove.visit.patientFirstName}{" "}
                    {pendingMove.visit.patientLastName}
                    <br />
                    <span className="font-medium text-foreground">
                      {pendingMove.visit.date} {pendingMove.visit.time}
                    </span>{" "}
                    →{" "}
                    <span className="font-medium text-brand">
                      {pendingMove.date} {pendingMove.time}
                    </span>
                  </>
                ) : null}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setPendingMove(null)}
                disabled={moving}
              >
                Anuluj
              </Button>
              <Button
                className="bg-brand text-white hover:bg-brand-deep"
                onClick={confirmMove}
                disabled={moving}
              >
                Potwierdź
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
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
