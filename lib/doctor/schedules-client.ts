import { SEED_SCHEDULES } from "@/lib/doctor/seed-schedules";
import type { DoctorSchedule } from "@/lib/doctor/schedule-types";

export const DOCTOR_SCHEDULES_STORAGE_KEY = "cmkw-doctor-schedules-v1";

export function loadSchedulesFromLocalStorage(): DoctorSchedule[] {
  if (typeof window === "undefined") return structuredClone(SEED_SCHEDULES);
  try {
    const raw = localStorage.getItem(DOCTOR_SCHEDULES_STORAGE_KEY);
    if (!raw) {
      const seed = structuredClone(SEED_SCHEDULES);
      localStorage.setItem(DOCTOR_SCHEDULES_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as DoctorSchedule[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = structuredClone(SEED_SCHEDULES);
      localStorage.setItem(DOCTOR_SCHEDULES_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return structuredClone(SEED_SCHEDULES);
  }
}

export function saveSchedulesToLocalStorage(list: DoctorSchedule[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOCTOR_SCHEDULES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function resetSchedulesLocalStorage(): DoctorSchedule[] {
  const seed = structuredClone(SEED_SCHEDULES);
  saveSchedulesToLocalStorage(seed);
  return seed;
}
