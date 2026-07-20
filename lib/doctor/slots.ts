import { addDays, format, isBefore, parseISO, startOfDay } from "date-fns";
import type { StaffMember, VisitTypeConfig } from "@/lib/doctor/admin-types";
import { getBranchById } from "@/lib/doctor/branches";
import type { DoctorSchedule } from "@/lib/doctor/schedule-types";
import {
  generateTimesForDay,
  getDayAvailability,
  isVisitOccupying,
} from "@/lib/doctor/schedule-utils";
import type { DoctorVisit } from "@/lib/doctor/types";

export type FreeSlot = {
  id: string;
  doctorId: string;
  staffId: string;
  doctorName: string;
  specialty: string;
  branchId: string;
  branchName: string;
  date: string;
  time: string;
  durationMin: number;
  visitTypeId: string;
  visitTypeName: string;
  mode: VisitTypeConfig["mode"];
};

export type CalendarCellKind =
  | "available"
  | "occupied"
  | "outside"
  | "leave"
  | "off";

/**
 * Generuje wolne sloty na podstawie grafików + zajętych wizyt.
 */
export function generateFreeSlots(options: {
  staff: StaffMember[];
  visitTypes: VisitTypeConfig[];
  schedules: DoctorSchedule[];
  occupiedVisits: DoctorVisit[];
  days?: number;
  branchFilter?: string;
  doctorId?: string;
  specialty?: string;
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  durationMin?: number;
  visitTypeId?: string;
  mode?: string;
}): FreeSlot[] {
  const days = options.days ?? 40;
  const today = startOfDay(new Date());
  const doctors = options.staff.filter(
    (s) => s.role === "doctor" && s.active && s.doctorId
  );
  const types = options.visitTypes.filter((t) => t.active);
  if (!doctors.length || !types.length) return [];

  const slots: FreeSlot[] = [];

  for (let d = 0; d < days; d++) {
    const date = addDays(today, d);
    const dateStr = format(date, "yyyy-MM-dd");
    if (options.dateFrom && dateStr < options.dateFrom) continue;
    if (options.dateTo && dateStr > options.dateTo) continue;

    for (const doc of doctors) {
      if (options.doctorId && options.doctorId !== "all") {
        if (doc.doctorId !== options.doctorId && doc.id !== options.doctorId)
          continue;
      }
      if (options.specialty && options.specialty !== "all") {
        if (
          !doc.specialty.toLowerCase().includes(options.specialty.toLowerCase())
        )
          continue;
      }

      for (const branchId of doc.branchIds) {
        if (
          options.branchFilter &&
          options.branchFilter !== "all" &&
          branchId !== options.branchFilter
        ) {
          continue;
        }
        const branch = getBranchById(branchId);
        if (!branch) continue;

        const schedule = options.schedules.find(
          (s) => s.doctorId === (doc.doctorId ?? doc.id) && s.branchId === branchId
        );
        if (!schedule) continue;

        const av = getDayAvailability(schedule, dateStr);
        if (av.kind !== "open" && av.kind !== "dyzur") {
          continue;
        }
        const openHours = av;

        for (const vt of types) {
          if (options.visitTypeId && options.visitTypeId !== "all") {
            if (vt.id !== options.visitTypeId) continue;
          }
          if (options.mode && options.mode !== "all") {
            if (vt.mode !== options.mode) continue;
          }
          if (options.durationMin && options.durationMin > 0) {
            if (vt.durationMin < options.durationMin) continue;
          }

          const step = Math.max(openHours.slotMinutes, vt.durationMin);
          const stepTimes = generateTimesForDay(
            openHours.startTime,
            openHours.endTime,
            step
          );

          for (const time of stepTimes) {
            if (options.timeFrom && time < options.timeFrom) continue;
            if (options.timeTo && time > options.timeTo) continue;

            if (d === 0) {
              const now = new Date();
              const [hh, mm] = time.split(":").map(Number);
              const slotDt = parseISO(dateStr);
              slotDt.setHours(hh!, mm!, 0, 0);
              if (isBefore(slotDt, now)) continue;
            }

            const doctorId = doc.doctorId ?? doc.id;
            if (
              isVisitOccupying(
                options.occupiedVisits,
                doctorId,
                branchId,
                dateStr,
                time
              )
            ) {
              continue;
            }

            slots.push({
              id: `${doctorId}|${branchId}|${dateStr}|${time}|${vt.id}`,
              doctorId,
              staffId: doc.id,
              doctorName:
                `${doc.title} ${doc.firstName} ${doc.lastName}`.trim(),
              specialty: doc.specialty,
              branchId,
              branchName: branch.shortName,
              date: dateStr,
              time,
              durationMin: Math.max(vt.durationMin, openHours.slotMinutes),
              visitTypeId: vt.id,
              visitTypeName: vt.name,
              mode: vt.mode,
            });
          }
        }
      }
    }
  }

  // Deduplicate by doctor|branch|date|time (prefer first visit type)
  const seen = new Set<string>();
  const unique: FreeSlot[] = [];
  for (const s of slots) {
    const k = `${s.doctorId}|${s.branchId}|${s.date}|${s.time}`;
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(s);
  }

  return unique.sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
  );
}

export function groupSlotsByDoctor(
  slots: FreeSlot[]
): Array<{
  key: string;
  doctorName: string;
  specialty: string;
  branchId: string;
  branchName: string;
  visitTypeName: string;
  mode: VisitTypeConfig["mode"];
  doctorId: string;
  visitTypeId: string;
  slots: FreeSlot[];
}> {
  const map = new Map<
    string,
    {
      key: string;
      doctorName: string;
      specialty: string;
      branchId: string;
      branchName: string;
      visitTypeName: string;
      mode: VisitTypeConfig["mode"];
      doctorId: string;
      visitTypeId: string;
      slots: FreeSlot[];
    }
  >();

  for (const s of slots) {
    const key = `${s.doctorId}|${s.branchId}|${s.visitTypeId}`;
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        doctorName: s.doctorName,
        specialty: s.specialty,
        branchId: s.branchId,
        branchName: s.branchName,
        visitTypeName: s.visitTypeName,
        mode: s.mode,
        doctorId: s.doctorId,
        visitTypeId: s.visitTypeId,
        slots: [],
      };
      map.set(key, g);
    }
    g.slots.push(s);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.doctorName.localeCompare(b.doctorName, "pl")
  );
}

/** Status komórki kalendarza dla lekarza w danym dniu */
export function dayCellStatus(
  schedule: DoctorSchedule | undefined,
  dateStr: string,
  visitsThatDay: DoctorVisit[]
): CalendarCellKind {
  if (!schedule) return "outside";
  const av = getDayAvailability(schedule, dateStr);
  if (av.kind === "urlop" || av.kind === "wolne") return "leave";
  if (av.kind === "off") return "outside";
  if (av.kind !== "open" && av.kind !== "dyzur") return "outside";
  const openCount = generateTimesForDay(
    av.startTime,
    av.endTime,
    av.slotMinutes
  ).length;
  const occupied = visitsThatDay.filter((v) => v.status !== "cancelled").length;
  if (occupied >= openCount) return "occupied";
  if (occupied > 0) return "occupied";
  return "available";
}
