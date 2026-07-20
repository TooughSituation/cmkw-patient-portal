import { SEED_VISITS } from "@/lib/doctor/seed-visits";
import type { DoctorVisit } from "@/lib/doctor/types";

/**
 * Warstwa klienta: localStorage + seed.
 * v2 — dodane patientId (reset starych danych bez pola).
 */
export const DOCTOR_VISITS_STORAGE_KEY = "cmkw-doctor-visits-v2";

function normalizeVisit(v: DoctorVisit & { patientId?: string }): DoctorVisit {
  return {
    ...v,
    patientId: v.patientId ?? "",
  };
}

export function loadVisitsFromLocalStorage(): DoctorVisit[] {
  if (typeof window === "undefined") return structuredClone(SEED_VISITS);
  try {
    const raw = localStorage.getItem(DOCTOR_VISITS_STORAGE_KEY);
    if (!raw) {
      // migracja ze starego klucza
      const legacy = localStorage.getItem("cmkw-doctor-visits-v1");
      if (legacy) {
        try {
          const old = JSON.parse(legacy) as DoctorVisit[];
          if (Array.isArray(old) && old.length > 0) {
            // Stare wizyty bez patientId — podmień seedem
          }
        } catch {
          // ignore
        }
      }
      const seed = structuredClone(SEED_VISITS);
      localStorage.setItem(DOCTOR_VISITS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as DoctorVisit[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = structuredClone(SEED_VISITS);
      localStorage.setItem(DOCTOR_VISITS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed.map(normalizeVisit);
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
