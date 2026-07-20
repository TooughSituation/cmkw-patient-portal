import { SEED_DOCUMENTS } from "@/lib/doctor/seed-documents";
import type { DoctorDocument } from "@/lib/doctor/types";

export const DOCTOR_DOCUMENTS_STORAGE_KEY = "cmkw-doctor-documents-v1";

export function loadDocumentsFromLocalStorage(): DoctorDocument[] {
  if (typeof window === "undefined") return structuredClone(SEED_DOCUMENTS);
  try {
    const raw = localStorage.getItem(DOCTOR_DOCUMENTS_STORAGE_KEY);
    if (!raw) {
      const seed = structuredClone(SEED_DOCUMENTS);
      localStorage.setItem(DOCTOR_DOCUMENTS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as DoctorDocument[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = structuredClone(SEED_DOCUMENTS);
      localStorage.setItem(DOCTOR_DOCUMENTS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return structuredClone(SEED_DOCUMENTS);
  }
}

export function saveDocumentsToLocalStorage(docs: DoctorDocument[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOCTOR_DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
  } catch {
    // ignore
  }
}

export function resetDocumentsLocalStorage(): DoctorDocument[] {
  const seed = structuredClone(SEED_DOCUMENTS);
  saveDocumentsToLocalStorage(seed);
  return seed;
}
