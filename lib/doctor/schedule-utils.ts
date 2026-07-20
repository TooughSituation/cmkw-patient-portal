import { addDays, format, getDay, parseISO, startOfDay } from "date-fns";
import {
  minutesToTime,
  timeToMinutes,
  type DaySchedule,
  type DoctorSchedule,
  type ScheduleException,
  type Weekday,
} from "@/lib/doctor/schedule-types";
import type { DoctorVisit } from "@/lib/doctor/types";

export type DayAvailability =
  | { kind: "off" }
  | { kind: "urlop" | "wolne"; exception: ScheduleException }
  | {
      kind: "open" | "dyzur";
      startTime: string;
      endTime: string;
      slotMinutes: number;
      exception?: ScheduleException;
    };

export function getDayAvailability(
  schedule: DoctorSchedule,
  dateStr: string
): DayAvailability {
  const ex = schedule.exceptions.find((e) => e.date === dateStr);
  if (ex?.type === "urlop" || ex?.type === "wolne") {
    return { kind: ex.type, exception: ex };
  }

  const weekday = getDay(parseISO(dateStr)) as Weekday;
  const day = schedule.days.find((d) => d.weekday === weekday);

  if (ex?.type === "dyzur") {
    const start = ex.startTime ?? day?.startTime ?? "08:00";
    const end = ex.endTime ?? day?.endTime ?? "18:00";
    const slot = day?.slotMinutes ?? 20;
    return {
      kind: "dyzur",
      startTime: start,
      endTime: end,
      slotMinutes: slot,
      exception: ex,
    };
  }

  if (!day || !day.enabled) return { kind: "off" };

  return {
    kind: "open",
    startTime: day.startTime,
    endTime: day.endTime,
    slotMinutes: day.slotMinutes,
  };
}

export function generateTimesForDay(
  startTime: string,
  endTime: string,
  slotMinutes: number
): string[] {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const step = Math.max(5, slotMinutes);
  const times: string[] = [];
  for (let t = start; t + step <= end; t += step) {
    times.push(minutesToTime(t));
  }
  return times;
}

export function isVisitOccupying(
  visits: DoctorVisit[],
  doctorId: string,
  branchId: string,
  date: string,
  time: string
): boolean {
  return visits.some(
    (v) =>
      v.doctorId === doctorId &&
      v.branchId === branchId &&
      v.date === date &&
      v.time === time &&
      v.status !== "cancelled"
  );
}

/**
 * Czy termin (date+time) jest dozwolony w grafiku (bez sprawdzenia kolizji wizyt).
 */
export function isWithinSchedule(
  schedule: DoctorSchedule | undefined,
  dateStr: string,
  time: string
): { ok: boolean; reason?: string } {
  if (!schedule) {
    return { ok: false, reason: "Brak grafiku pracy dla tego lekarza/oddziału." };
  }
  const av = getDayAvailability(schedule, dateStr);
  if (av.kind === "urlop") {
    return { ok: false, reason: `Urlop: ${av.exception.note || "—"}` };
  }
  if (av.kind === "wolne") {
    return { ok: false, reason: `Dzień wolny: ${av.exception.note || "—"}` };
  }
  if (av.kind === "off") {
    return { ok: false, reason: "Poza grafikami pracy (dzień wolny)." };
  }
  if (av.kind !== "open" && av.kind !== "dyzur") {
    return { ok: false, reason: "Poza grafikami pracy." };
  }
  const t = timeToMinutes(time);
  const start = timeToMinutes(av.startTime);
  const end = timeToMinutes(av.endTime);
  if (t < start || t >= end) {
    return {
      ok: false,
      reason: `Poza godzinami pracy (${av.startTime}–${av.endTime}).`,
    };
  }
  // align to slot grid
  if ((t - start) % av.slotMinutes !== 0) {
    return {
      ok: false,
      reason: `Godzina nie pasuje do siatki slotów (${av.slotMinutes} min).`,
    };
  }
  return { ok: true };
}

export function findSchedule(
  schedules: DoctorSchedule[],
  doctorId: string,
  branchId: string
): DoctorSchedule | undefined {
  return schedules.find(
    (s) => s.doctorId === doctorId && s.branchId === branchId
  );
}

/** Podgląd 4–6 tygodni: status dnia dla grafiku */
export function previewWeeks(
  schedule: DoctorSchedule,
  weeks = 5
): Array<{ date: string; availability: DayAvailability }> {
  const out: Array<{ date: string; availability: DayAvailability }> = [];
  const start = startOfDay(new Date());
  for (let i = 0; i < weeks * 7; i++) {
    const date = format(addDays(start, i), "yyyy-MM-dd");
    out.push({ date, availability: getDayAvailability(schedule, date) });
  }
  return out;
}

export function copyScheduleDays(
  from: DoctorSchedule,
  to: DoctorSchedule
): DoctorSchedule {
  return {
    ...to,
    days: structuredClone(from.days),
    updatedAt: new Date().toISOString(),
  };
}

export function ensureWeekDays(days: DaySchedule[]): DaySchedule[] {
  const map = new Map(days.map((d) => [d.weekday, d]));
  return ([0, 1, 2, 3, 4, 5, 6] as Weekday[]).map((weekday) => {
    return (
      map.get(weekday) ?? {
        weekday,
        enabled: false,
        startTime: "08:00",
        endTime: "16:00",
        slotMinutes: 20,
      }
    );
  });
}
