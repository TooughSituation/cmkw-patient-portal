import { SEED_VISITS } from "@/lib/doctor/seed-visits";
import type { DoctorVisit } from "@/lib/doctor/types";

/**
 * Warstwa klienta: localStorage + seed.
 * (Bez Node APIs — bezpieczne w "use client".)
 */

export const DOCTOR_VISITS_STORAGE_KEY = "cmkw-doctor-visits-v1";

export function loadVisitsFromLocalStorage(): DoctorVisit[] {
  if (typeof window === "undefined") return structuredClone(SEED_VISITS);
  try {
    const raw = localStorage.getItem(DOCTOR_VISITS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        DOCTOR_VISITS_STORAGE_KEY,
        JSON.stringify(SEED_VISITS)
      );
      return structuredClone(SEED_VISITS);
    }
    const parsed = JSON.parse(raw) as DoctorVisit[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(
        DOCTOR_VISITS_STORAGE_KEY,
        JSON.stringify(SEED_VISITS)
      );
      return structuredClone(SEED_VISITS);
    }
    return parsed;
  } catch {
    return structuredClone(SEED_VISITS);
  }
}

export function saveVisitsToLocalStorage(visits: DoctorVisit[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOCTOR_VISITS_STORAGE_KEY, JSON.stringify(visits));
  } catch {
    // quota / private mode
  }
}

export function resetVisitsLocalStorage(): DoctorVisit[] {
  const seed = structuredClone(SEED_VISITS);
  saveVisitsToLocalStorage(seed);
  return seed;
}
