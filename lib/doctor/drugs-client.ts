import { SEED_DRUGS } from "@/lib/doctor/seed-drugs";
import type { Drug } from "@/lib/doctor/drug-types";

export const DOCTOR_DRUGS_STORAGE_KEY = "cmkw-doctor-drugs-v1";

export function loadDrugsFromLocalStorage(): Drug[] {
  if (typeof window === "undefined") return structuredClone(SEED_DRUGS);
  try {
    const raw = localStorage.getItem(DOCTOR_DRUGS_STORAGE_KEY);
    if (!raw) {
      const seed = structuredClone(SEED_DRUGS);
      localStorage.setItem(DOCTOR_DRUGS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Drug[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = structuredClone(SEED_DRUGS);
      localStorage.setItem(DOCTOR_DRUGS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return structuredClone(SEED_DRUGS);
  }
}

export function saveDrugsToLocalStorage(drugs: Drug[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOCTOR_DRUGS_STORAGE_KEY, JSON.stringify(drugs));
  } catch {
    // ignore
  }
}

export function resetDrugsLocalStorage(): Drug[] {
  const seed = structuredClone(SEED_DRUGS);
  saveDrugsToLocalStorage(seed);
  return seed;
}
