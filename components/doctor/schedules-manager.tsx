"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarClock, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import { CLINIC_BRANCHES } from "@/lib/doctor/branches";
import {
  EXCEPTION_LABELS,
  WEEKDAY_LABELS,
  WEEKDAY_SHORT,
  type DaySchedule,
  type DoctorSchedule,
  type ScheduleException,
  type ScheduleExceptionType,
  type Weekday,
} from "@/lib/doctor/schedule-types";
import {
  copyScheduleDays,
  ensureWeekDays,
  previewWeeks,
} from "@/lib/doctor/schedule-utils";
import { cn } from "@/lib/utils";

export function SchedulesManager() {
  const { staff, schedules, saveSchedulesData, resetSchedules } =
    useDoctorData();
  const doctors = staff.filter((s) => s.role === "doctor" && s.active);

  const [selectedId, setSelectedId] = useState(
    schedules[0]?.id ?? ""
  );
  const selected =
    schedules.find((s) => s.id === selectedId) ?? schedules[0] ?? null;

  const [draft, setDraft] = useState<DoctorSchedule | null>(null);
  const active = draft && draft.id === selected?.id ? draft : selected;

  function beginEdit(s: DoctorSchedule) {
    setSelectedId(s.id);
    setDraft({
      ...structuredClone(s),
      days: ensureWeekDays(s.days),
    });
  }

  function save() {
    if (!draft) return;
    const next = schedules.map((s) =>
      s.id === draft.id
        ? { ...draft, updatedAt: new Date().toISOString() }
        : s
    );
    // if new schedule not in list
    if (!schedules.some((s) => s.id === draft.id)) {
      next.push({ ...draft, updatedAt: new Date().toISOString() });
    }
    saveSchedulesData(next);
    setDraft(null);
    toast.success("Zapisano grafik");
  }

  function updateDay(weekday: Weekday, patch: Partial<DaySchedule>) {
    if (!draft) return;
    setDraft({
      ...draft,
      days: ensureWeekDays(draft.days).map((d) =>
        d.weekday === weekday ? { ...d, ...patch } : d
      ),
    });
  }

  function addException() {
    if (!draft) return;
    const ex: ScheduleException = {
      id: `ex-${crypto.randomUUID().slice(0, 6)}`,
      date: format(new Date(), "yyyy-MM-dd"),
      type: "urlop",
      note: "",
    };
    setDraft({ ...draft, exceptions: [...draft.exceptions, ex] });
  }

  function copyFrom(sourceId: string) {
    if (!draft) return;
    const src = schedules.find((s) => s.id === sourceId);
    if (!src) return;
    setDraft(copyScheduleDays(src, draft));
    toast.message("Skopiowano dni tygodnia (bez wyjątków)");
  }

  const preview = useMemo(
    () => (active ? previewWeeks(active, 5) : []),
    [active]
  );

  const doctorSchedules = useMemo(() => {
    return doctors.flatMap((d) => {
      const list = schedules.filter((s) => s.staffId === d.id || s.doctorId === d.doctorId);
      return list.length
        ? list
        : d.branchIds.map((branchId) => ({
            id: `sch-new-${d.id}-${branchId}`,
            staffId: d.id,
            doctorId: d.doctorId ?? d.id,
            branchId,
            days: ensureWeekDays([]),
            exceptions: [] as ScheduleException[],
            updatedAt: new Date().toISOString(),
            _virtual: true as const,
          }));
    });
  }, [doctors, schedules]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-brand-heading">
            Grafiki pracy lekarzy
          </h2>
          <p className="text-sm text-muted-foreground">
            Godziny przyjęć per oddział · wyjątki (urlop / wolne / dyżur)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetSchedules();
            setDraft(null);
            toast.success("Przywrócono seed grafików");
          }}
        >
          Przywróć seed
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lekarze / oddziały</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {doctorSchedules.map((s) => {
              const doc = doctors.find(
                (d) => d.id === s.staffId || d.doctorId === s.doctorId
              );
              const branch = CLINIC_BRANCHES.find((b) => b.id === s.branchId);
              const isSel = active?.id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => beginEdit(s as DoctorSchedule)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2.5 text-left text-sm transition",
                    isSel
                      ? "bg-brand text-white"
                      : "hover:bg-secondary text-slate-700"
                  )}
                >
                  <span className="block font-medium">
                    {doc
                      ? `${doc.title} ${doc.lastName}`
                      : s.doctorId}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isSel ? "text-white/80" : "text-muted-foreground"
                    )}
                  >
                    {branch?.shortName ?? s.branchId}
                    {"_virtual" in s ? " · (nowy)" : ""}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {!active ? (
          <Card className="border-dashed border-slate-300">
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              Wybierz lekarza i oddział z listy.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-brand-heading">
                  <CalendarClock className="size-4 text-brand" />
                  Tydzień roboczy
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Select
                    onValueChange={(v) => copyFrom(v)}
                    disabled={!draft}
                  >
                    <SelectTrigger className="h-9 w-[200px]">
                      <SelectValue placeholder="Kopiuj z…" />
                    </SelectTrigger>
                    <SelectContent>
                      {schedules
                        .filter((s) => s.id !== active.id)
                        .map((s) => {
                          const doc = doctors.find(
                            (d) => d.doctorId === s.doctorId
                          );
                          const br = CLINIC_BRANCHES.find(
                            (b) => b.id === s.branchId
                          );
                          return (
                            <SelectItem key={s.id} value={s.id}>
                              {doc?.lastName ?? s.doctorId} · {br?.shortName}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                  {!draft ? (
                    <Button
                      size="sm"
                      className="h-9"
                      variant="outline"
                      onClick={() => beginEdit(active)}
                    >
                      Edytuj
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9"
                        onClick={() => setDraft(null)}
                      >
                        Anuluj
                      </Button>
                      <Button
                        size="sm"
                        className="h-9 gap-1.5 bg-brand text-white hover:bg-brand-deep"
                        onClick={save}
                      >
                        <Save className="size-3.5" />
                        Zapisz
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {ensureWeekDays(active.days).map((d) => (
                  <div
                    key={d.weekday}
                    className={cn(
                      "grid items-center gap-2 rounded-lg border px-3 py-2 sm:grid-cols-[120px_1fr_auto_auto_auto]",
                      d.enabled
                        ? "border-slate-200 bg-white"
                        : "border-slate-100 bg-slate-50 opacity-70"
                    )}
                  >
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Checkbox
                        checked={d.enabled}
                        disabled={!draft}
                        onCheckedChange={(v) =>
                          updateDay(d.weekday, { enabled: v === true })
                        }
                      />
                      <span className="sm:hidden">
                        {WEEKDAY_SHORT[d.weekday as Weekday]}
                      </span>
                      <span className="hidden sm:inline">
                        {WEEKDAY_LABELS[d.weekday as Weekday]}
                      </span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        type="time"
                        className="h-9 w-[120px]"
                        value={d.startTime}
                        disabled={!draft || !d.enabled}
                        onChange={(e) =>
                          updateDay(d.weekday, { startTime: e.target.value })
                        }
                      />
                      <span className="text-muted-foreground">–</span>
                      <Input
                        type="time"
                        className="h-9 w-[120px]"
                        value={d.endTime}
                        disabled={!draft || !d.enabled}
                        onChange={(e) =>
                          updateDay(d.weekday, { endTime: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      slot
                      <Input
                        type="number"
                        className="h-9 w-16"
                        min={5}
                        max={60}
                        step={5}
                        value={d.slotMinutes}
                        disabled={!draft || !d.enabled}
                        onChange={(e) =>
                          updateDay(d.weekday, {
                            slotMinutes: Number(e.target.value) || 20,
                          })
                        }
                      />
                      min
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base text-brand-heading">
                  Wyjątki (urlopy / wolne / dyżury)
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1"
                  disabled={!draft}
                  onClick={addException}
                >
                  <Plus className="size-3.5" />
                  Dodaj
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {(active.exceptions ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Brak wyjątków w grafiku.
                  </p>
                ) : (
                  active.exceptions.map((ex, i) => (
                    <div
                      key={ex.id}
                      className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
                    >
                      <Input
                        type="date"
                        className="h-9"
                        value={ex.date}
                        disabled={!draft}
                        onChange={(e) => {
                          if (!draft) return;
                          const exceptions = [...draft.exceptions];
                          exceptions[i] = { ...ex, date: e.target.value };
                          setDraft({ ...draft, exceptions });
                        }}
                      />
                      <Select
                        value={ex.type}
                        disabled={!draft}
                        onValueChange={(v) => {
                          if (!draft) return;
                          const exceptions = [...draft.exceptions];
                          exceptions[i] = {
                            ...ex,
                            type: v as ScheduleExceptionType,
                          };
                          setDraft({ ...draft, exceptions });
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            Object.keys(EXCEPTION_LABELS) as ScheduleExceptionType[]
                          ).map((t) => (
                            <SelectItem key={t} value={t}>
                              {EXCEPTION_LABELS[t]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="h-9"
                        placeholder="Notatka"
                        value={ex.note}
                        disabled={!draft}
                        onChange={(e) => {
                          if (!draft) return;
                          const exceptions = [...draft.exceptions];
                          exceptions[i] = { ...ex, note: e.target.value };
                          setDraft({ ...draft, exceptions });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={!draft}
                        onClick={() => {
                          if (!draft) return;
                          setDraft({
                            ...draft,
                            exceptions: draft.exceptions.filter(
                              (x) => x.id !== ex.id
                            ),
                          });
                        }}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                      {ex.type === "dyzur" ? (
                        <div className="flex gap-2 sm:col-span-4">
                          <Input
                            type="time"
                            className="h-9 w-[120px]"
                            value={ex.startTime ?? "16:00"}
                            disabled={!draft}
                            onChange={(e) => {
                              if (!draft) return;
                              const exceptions = [...draft.exceptions];
                              exceptions[i] = {
                                ...ex,
                                startTime: e.target.value,
                              };
                              setDraft({ ...draft, exceptions });
                            }}
                          />
                          <Input
                            type="time"
                            className="h-9 w-[120px]"
                            value={ex.endTime ?? "19:00"}
                            disabled={!draft}
                            onChange={(e) => {
                              if (!draft) return;
                              const exceptions = [...draft.exceptions];
                              exceptions[i] = {
                                ...ex,
                                endTime: e.target.value,
                              };
                              setDraft({ ...draft, exceptions });
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-brand-heading">
                  Podgląd 5 tygodni
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {([1, 2, 3, 4, 5, 6, 0] as Weekday[]).map((wd) => (
                    <div
                      key={wd}
                      className="text-center text-[10px] font-medium text-muted-foreground"
                    >
                      {WEEKDAY_SHORT[wd]}
                    </div>
                  ))}
                  {preview.map(({ date, availability }) => {
                    const d = parseISO(date);
                    // reorder: mon-first grid — preview is sequential from today
                    let color =
                      "bg-slate-100 text-slate-500 border-slate-200";
                    if (availability.kind === "open")
                      color = "bg-emerald-50 text-emerald-800 border-emerald-200";
                    if (availability.kind === "dyzur")
                      color = "bg-sky-50 text-sky-800 border-sky-200";
                    if (
                      availability.kind === "urlop" ||
                      availability.kind === "wolne"
                    )
                      color = "bg-amber-50 text-amber-900 border-amber-200";
                    return (
                      <div
                        key={date}
                        title={`${date}: ${availability.kind}`}
                        className={cn(
                          "rounded border px-0.5 py-1 text-center text-[10px]",
                          color
                        )}
                      >
                        <div className="font-semibold">
                          {format(d, "d", { locale: pl })}
                        </div>
                        <div className="truncate opacity-80">
                          {availability.kind === "open" ||
                          availability.kind === "dyzur"
                            ? `${availability.startTime.slice(0, 5)}`
                            : availability.kind === "off"
                              ? "—"
                              : availability.kind.slice(0, 3)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50">
                    Przyjmuje
                  </Badge>
                  <Badge variant="outline" className="border-amber-200 bg-amber-50">
                    Urlop/wolne
                  </Badge>
                  <Badge variant="outline" className="border-sky-200 bg-sky-50">
                    Dyżur
                  </Badge>
                  <Badge variant="outline">Poza grafikami</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
