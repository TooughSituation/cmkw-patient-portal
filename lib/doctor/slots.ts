import { addDays, format, getDay, isBefore, startOfDay } from "date-fns";
import type { StaffMember } from "@/lib/doctor/admin-types";
import type { VisitTypeConfig } from "@/lib/doctor/admin-types";
import { getBranchById } from "@/lib/doctor/branches";

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

/** Deterministic pseudo-random 0–1 from string seed */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const DAY_START = 8; // 08:00
const DAY_END = 16; // last slot start 15:40 for 20min

/**
 * Generuje wolne sloty na `days` dni naprzód.
 * Kiryluk (niski availabilityFactor) ma najmniej wolnych terminów.
 */
export function generateFreeSlots(options: {
  staff: StaffMember[];
  visitTypes: VisitTypeConfig[];
  days?: number;
  branchFilter?: string; // all | branch id
  doctorId?: string;
  specialty?: string;
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string; // HH:mm
  timeTo?: string;
  durationMin?: number;
  visitTypeId?: string;
  mode?: string;
}): FreeSlot[] {
  const days = options.days ?? 35;
  const today = startOfDay(new Date());
  const doctors = options.staff.filter(
    (s) => s.role === "doctor" && s.active && s.doctorId
  );
  const types = options.visitTypes.filter((t) => t.active);
  if (!doctors.length || !types.length) return [];

  const slots: FreeSlot[] = [];

  for (let d = 0; d < days; d++) {
    const date = addDays(today, d);
    const dow = getDay(date); // 0 Sun
    if (dow === 0) continue; // no Sunday
    if (dow === 6 && d % 2 === 1) continue; // sparse Saturdays

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

          const step = Math.max(15, Math.min(vt.durationMin, 30));
          for (let hour = DAY_START; hour < DAY_END; hour++) {
            for (let min = 0; min < 60; min += step) {
              if (hour === DAY_END - 1 && min > 30) continue;
              const time = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
              if (options.timeFrom && time < options.timeFrom) continue;
              if (options.timeTo && time > options.timeTo) continue;

              // Skip past times for today
              if (d === 0) {
                const now = new Date();
                const [hh, mm] = time.split(":").map(Number);
                const slotDt = new Date(date);
                slotDt.setHours(hh!, mm!, 0, 0);
                if (isBefore(slotDt, now)) continue;
              }

              const key = `${doc.id}|${branchId}|${dateStr}|${time}|${vt.id}`;
              const roll = hash01(key);
              // lower availabilityFactor => fewer free slots
              const threshold = 0.12 + doc.availabilityFactor * 0.55;
              // Kiryluk ~0.22 → threshold ~0.24, Sammoudi 0.68 → ~0.49
              if (roll > threshold) continue;

              // weekday bias: fewer afternoon for busy doctors
              if (doc.availabilityFactor < 0.3 && hour >= 13 && roll > 0.15)
                continue;

              slots.push({
                id: key,
                doctorId: doc.doctorId ?? doc.id,
                staffId: doc.id,
                doctorName: `${doc.title} ${doc.firstName} ${doc.lastName}`.trim(),
                specialty: doc.specialty,
                branchId,
                branchName: branch.shortName,
                date: dateStr,
                time,
                durationMin: vt.durationMin,
                visitTypeId: vt.id,
                visitTypeName: vt.name,
                mode: vt.mode,
              });
            }
          }
        }
      }
    }
  }

  return slots.sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
  );
}

/** Grupuje sloty po lekarzu + typie + oddziale */
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
