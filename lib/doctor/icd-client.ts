import { SEED_ICD10 } from "@/lib/doctor/seed-icd10";
import type { Icd10Code } from "@/lib/doctor/icd-types";

export const DOCTOR_ICD_STORAGE_KEY = "cmkw-doctor-icd10-v1";

export function loadIcdFromLocalStorage(): Icd10Code[] {
  if (typeof window === "undefined") return structuredClone(SEED_ICD10);
  try {
    const raw = localStorage.getItem(DOCTOR_ICD_STORAGE_KEY);
    if (!raw) {
      const seed = structuredClone(SEED_ICD10);
      localStorage.setItem(DOCTOR_ICD_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Icd10Code[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = structuredClone(SEED_ICD10);
      localStorage.setItem(DOCTOR_ICD_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return structuredClone(SEED_ICD10);
  }
}

export function saveIcdToLocalStorage(codes: Icd10Code[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOCTOR_ICD_STORAGE_KEY, JSON.stringify(codes));
  } catch {
    // ignore
  }
}

export function resetIcdLocalStorage(): Icd10Code[] {
  const seed = structuredClone(SEED_ICD10);
  saveIcdToLocalStorage(seed);
  return seed;
}
